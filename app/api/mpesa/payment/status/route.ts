import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  maskSensitiveData,
  sanitizeRequestData,
  ServerRateLimiter,
  sanitizeError,
  validateEnvironmentVariables
} from '@/lib/utils/security';

// Rate limiter for status checks
const statusRateLimiter = new ServerRateLimiter(30, 60000); // 30 requests per minute

// Validation schema for status requests
const statusRequestSchema = z.object({
  checkoutRequestId: z.string()
    .min(10, 'Invalid checkout request ID')
    .regex(/^ws_CO_/, 'Invalid checkout request ID format')
    .optional(),
  merchantRequestId: z.string()
    .min(5, 'Invalid merchant request ID')
    .optional(),
}).refine(data => data.checkoutRequestId || data.merchantRequestId, {
  message: 'Either checkoutRequestId or merchantRequestId is required'
});

// Payment status endpoint for frontend polling
export async function GET(request: NextRequest) {
  // Declare variables outside try block for error handling
  let checkoutRequestId: string | null = null;
  let merchantRequestId: string | null = null;
  let clientIp: string = 'unknown';

  try {
    // Get client IP for rate limiting
    clientIp = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limiting
    const rateLimitResult = statusRateLimiter.isAllowed(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many status check requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    checkoutRequestId = searchParams.get('checkoutRequestId');
    merchantRequestId = searchParams.get('merchantRequestId');

    // Validate request parameters
    const validation = statusRequestSchema.safeParse({
      checkoutRequestId,
      merchantRequestId
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      );
    }

    // TODO: Implement database lookup for payment status
    // For now, we'll return a placeholder response
    // In a real implementation, you would:
    // const paymentStatus = await getPaymentStatus(checkoutRequestId || merchantRequestId);

    // Log status check request (with masked data)
    console.log('Payment status check:', maskSensitiveData({
      checkoutRequestId,
      merchantRequestId,
      clientIp,
      timestamp: new Date().toISOString()
    }));

    // Placeholder response - replace with actual database lookup
    const mockPaymentStatus = {
      checkoutRequestId,
      merchantRequestId,
      status: 'pending', // pending, completed, failed, expired
      amount: null,
      mpesaReceiptNumber: null,
      transactionDate: null,
      phoneNumber: null,
      resultDesc: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mask sensitive data in response
    const responseData = maskSensitiveData(mockPaymentStatus);

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error: any) {
    // Log error with context
    console.error('Payment status check error:', {
      message: error.message,
      checkoutRequestId: checkoutRequestId ? maskSensitiveData(checkoutRequestId) : null,
      merchantRequestId: merchantRequestId ? maskSensitiveData(merchantRequestId) : null,
      clientIp,
      timestamp: new Date().toISOString()
    });

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

// Update payment status (for internal use)
export async function POST(request: NextRequest) {
  // Declare variables outside try block for error handling
  let checkoutRequestId: string | null = null;
  let merchantRequestId: string | null = null;
  let clientIp: string = 'unknown';

  try {
    // Get client IP for rate limiting
    clientIp = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limiting
    const rateLimitResult = statusRateLimiter.isAllowed(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many update requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and sanitize request body
    const rawBody = await request.json();
    const body = sanitizeRequestData(rawBody);
    const { status, ...updateData } = body;
    checkoutRequestId = body.checkoutRequestId;
    merchantRequestId = body.merchantRequestId;

    // Validate request parameters
    const validation = statusRequestSchema.safeParse({
      checkoutRequestId,
      merchantRequestId
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'completed', 'failed', 'expired', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Log status update request (with masked data)
    console.log('Payment status update:', maskSensitiveData({
      checkoutRequestId,
      merchantRequestId,
      status,
      clientIp,
      timestamp: new Date().toISOString()
    }));

    // TODO: Implement database update for payment status
    // const updatedPayment = await updatePaymentStatus({
    //   checkoutRequestId,
    //   merchantRequestId,
    //   status,
    //   ...updateData
    // });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      // data: updatedPayment,
    });

  } catch (error: any) {
    // Log error with context
    console.error('Payment status update error:', {
      message: error.message,
      checkoutRequestId: checkoutRequestId ? maskSensitiveData(checkoutRequestId) : null,
      merchantRequestId: merchantRequestId ? maskSensitiveData(merchantRequestId) : null,
      clientIp,
      timestamp: new Date().toISOString()
    });

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
