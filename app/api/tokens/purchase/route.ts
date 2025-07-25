import { NextRequest, NextResponse } from 'next/server';
import { validateTokenPurchase } from '@/lib/utils/validation';
import {
  maskSensitiveData,
  sanitizeRequestData,
  ServerRateLimiter,
  sanitizeError,
  validateEnvironmentVariables
} from '@/lib/utils/security';

// Rate limiter for token purchases
const purchaseRateLimiter = new ServerRateLimiter(10, 300000); // 10 purchases per 5 minutes

// Token purchase endpoint for M-Pesa payments
export async function POST(request: NextRequest) {
  // Declare variables outside try block for error handling
  let body: any = null;
  let clientIp: string = 'unknown';

  try {
    // Get client IP for rate limiting
    clientIp = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limiting
    const rateLimitResult = purchaseRateLimiter.isAllowed(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many purchase requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and sanitize request body
    const rawBody = await request.json();
    body = sanitizeRequestData(rawBody);

    // Validate request data using schema
    const validation = validateTokenPurchase(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    const {
      paymentMethod,
      amount,
      phoneNumber,
      mpesaReceiptNumber,
      checkoutRequestId,
      merchantRequestId
    } = validation.data!;

    // Get token configuration
    const TOKEN_PRICE = parseFloat(process.env.NOMA_TOKEN_PRICE || '0.0245'); // $0.0245 per token
    const MIN_PURCHASE = parseFloat(process.env.MIN_PURCHASE_AMOUNT || '10'); // $10 minimum
    const MAX_PURCHASE = parseFloat(process.env.MAX_PURCHASE_AMOUNT || '10000'); // $10,000 maximum

    // Calculate token amount
    const tokenAmount = amount / TOKEN_PRICE;

    // Create purchase record
    const purchaseData = {
      paymentMethod,
      usdAmount: amount,
      tokenAmount,
      tokenPrice: TOKEN_PRICE,
      phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : null,
      mpesaReceiptNumber: paymentMethod === 'mpesa' ? mpesaReceiptNumber : null,
      checkoutRequestId: paymentMethod === 'mpesa' ? checkoutRequestId : null,
      merchantRequestId: paymentMethod === 'mpesa' ? merchantRequestId : null,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };

    // Log purchase with masked sensitive data
    console.log('Token purchase processed:', maskSensitiveData(purchaseData));

    // TODO: Implement the following:
    // 1. Store purchase record in database
    // 2. Update user's token balance
    // 3. Send confirmation email
    // 4. Trigger any post-purchase webhooks
    // 5. Update analytics/metrics

    // For now, we'll just return the purchase data
    // In a real implementation, you would:
    // const purchase = await createTokenPurchase(purchaseData);
    // await updateUserBalance(userAddress, tokenAmount);
    // await sendPurchaseConfirmation(purchaseData);

    // Prepare response data (mask sensitive information)
    const responseData = {
      usdAmount: amount,
      tokenAmount,
      tokenPrice: TOKEN_PRICE,
      paymentMethod,
      transactionId: paymentMethod === 'mpesa' ? mpesaReceiptNumber : null,
      timestamp: purchaseData.timestamp,
    };

    return NextResponse.json({
      success: true,
      message: 'Token purchase completed successfully',
      data: maskSensitiveData(responseData),
    });

  } catch (error: any) {
    // Log error with context
    console.error('Token purchase error:', {
      message: error.message,
      paymentMethod: body?.paymentMethod,
      amount: body?.amount,
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

// Get purchase history (for user dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!userAddress && !phoneNumber) {
      return NextResponse.json(
        { error: 'User address or phone number is required' },
        { status: 400 }
      );
    }

    // TODO: Implement database lookup for purchase history
    // const purchases = await getUserPurchases(userAddress || phoneNumber);

    // Placeholder response
    const mockPurchases = [
      {
        id: '1',
        paymentMethod: 'mpesa',
        usdAmount: 100,
        tokenAmount: 4081.63,
        tokenPrice: 0.0245,
        status: 'completed',
        timestamp: new Date().toISOString(),
        transactionId: 'NLJ7RT61SV',
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockPurchases,
    });

  } catch (error: any) {
    console.error('Purchase history error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchase history',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
