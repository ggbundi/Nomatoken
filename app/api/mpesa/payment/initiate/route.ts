import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { validateMpesaPaymentRequest } from '@/lib/utils/validation';
import {
  generateMpesaTimestamp,
  generateMpesaPassword,
  maskSensitiveData,
  sanitizeRequestData,
  ServerRateLimiter,
  validateEnvironmentVariables,
  sanitizeError
} from '@/lib/utils/security';

// Rate limiter for payment initiation
const rateLimiter = new ServerRateLimiter(5, 300000); // 5 attempts per 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.valid) {
      console.error('Missing environment variables:', envValidation.missing);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Check rate limiting
    const rateLimitResult = rateLimiter.isAllowed(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many payment attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and sanitize request body
    const rawBody = await request.json();
    const body = sanitizeRequestData(rawBody);

    // Validate request data
    const validation = validateMpesaPaymentRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const { phoneNumber, amount, accountReference } = validation.data!;

    // Get environment variables
    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
    const PASSKEY = process.env.MPESA_PASSKEY;
    const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
    const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/payment/callback`;

    if (!BUSINESS_SHORT_CODE || !PASSKEY) {
      return NextResponse.json(
        { error: 'M-Pesa configuration incomplete' },
        { status: 500 }
      );
    }

    // Generate access token
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/mpesa/auth/token`, {
      method: 'POST',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Generate timestamp and password
    const timestamp = generateMpesaTimestamp();
    const password = generateMpesaPassword(BUSINESS_SHORT_CODE, PASSKEY, timestamp);

    // STK Push payload
    const stkPushPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // M-Pesa requires whole numbers
      PartyA: phoneNumber,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference.substring(0, 12), // Max 12 characters
      TransactionDesc: 'Token Purchase', // Max 13 characters
    };

    // Log request (with masked sensitive data)
    console.log('STK Push request:', maskSensitiveData(stkPushPayload));

    // Log request (with masked sensitive data)
    console.log('STK Push request:', maskSensitiveData(stkPushPayload));

    // Make STK Push request
    const stkUrl = ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const stkResponse = await axios.post(stkUrl, stkPushPayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Store payment request in database/cache (implement based on your storage solution)
    // For now, we'll return the response
    
    return NextResponse.json({
      success: true,
      message: 'STK Push initiated successfully',
      data: {
        MerchantRequestID: stkResponse.data.MerchantRequestID,
        CheckoutRequestID: stkResponse.data.CheckoutRequestID,
        ResponseCode: stkResponse.data.ResponseCode,
        ResponseDescription: stkResponse.data.ResponseDescription,
        CustomerMessage: stkResponse.data.CustomerMessage,
      },
    });

  } catch (error: any) {
    // Log error with masked sensitive data
    console.error('STK Push error:', {
      message: error.message,
      response: maskSensitiveData(error.response?.data),
      timestamp: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Return sanitized error to client
    const sanitizedError = sanitizeError(error);
    return NextResponse.json(
      {
        error: sanitizedError.message,
        code: sanitizedError.code
      },
      { status: 500 }
    );
  }
}
