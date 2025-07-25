import { NextRequest, NextResponse } from 'next/server';
import {
  maskSensitiveData,
  sanitizeRequestData,
  validateOrigin,
  ServerRateLimiter,
  sanitizeError
} from '@/lib/utils/security';

// Interface for M-Pesa callback data
interface MpesaCallbackItem {
  Name: string;
  Value: any;
}

interface MpesaCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: MpesaCallbackItem[];
  };
}

interface MpesaCallbackBody {
  Body: {
    stkCallback: MpesaCallback;
  };
}

// Rate limiter for callback endpoint
const callbackRateLimiter = new ServerRateLimiter(100, 60000); // 100 callbacks per minute

// Extract callback metadata into a more usable format
function extractCallbackMetadata(items: MpesaCallbackItem[]) {
  const metadata: Record<string, any> = {};
  items.forEach(item => {
    metadata[item.Name] = item.Value;
  });
  return metadata;
}

// Validate callback data structure
function validateCallbackData(data: any): boolean {
  return (
    data &&
    data.Body &&
    data.Body.stkCallback &&
    typeof data.Body.stkCallback.MerchantRequestID === 'string' &&
    typeof data.Body.stkCallback.CheckoutRequestID === 'string' &&
    typeof data.Body.stkCallback.ResultCode === 'number'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'safaricom';

    // Check rate limiting
    const rateLimitResult = callbackRateLimiter.isAllowed(clientIp);
    if (!rateLimitResult.allowed) {
      console.warn('Callback rate limit exceeded:', { clientIp, timestamp: new Date().toISOString() });
      return NextResponse.json({ success: true, message: 'Rate limited' });
    }

    // Validate origin (optional - Safaricom doesn't always send consistent origins)
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');

    // Log callback attempt for monitoring
    console.log('Callback attempt:', {
      clientIp,
      origin,
      userAgent: userAgent?.substring(0, 100), // Truncate for security
      timestamp: new Date().toISOString()
    });

    // Parse and validate request body
    const rawBody = await request.json();
    const body = sanitizeRequestData(rawBody) as MpesaCallbackBody;

    // Validate callback data structure
    if (!validateCallbackData(body)) {
      console.error('Invalid callback data structure:', maskSensitiveData(body));
      return NextResponse.json({ success: true, message: 'Invalid data' });
    }

    const callback = body.Body.stkCallback;

    // Log callback with masked sensitive data
    console.log('M-Pesa Callback received:', maskSensitiveData(callback));

    // Check if payment was successful
    if (callback.ResultCode === 0) {
      // Payment successful
      if (callback.CallbackMetadata) {
        const metadata = extractCallbackMetadata(callback.CallbackMetadata.Item);
        
        const paymentData = {
          merchantRequestId: callback.MerchantRequestID,
          checkoutRequestId: callback.CheckoutRequestID,
          amount: metadata.Amount,
          mpesaReceiptNumber: metadata.MpesaReceiptNumber,
          transactionDate: metadata.TransactionDate,
          phoneNumber: metadata.PhoneNumber,
          resultCode: callback.ResultCode,
          resultDesc: callback.ResultDesc,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };

        // Log successful payment with masked data
        console.log('Payment successful:', maskSensitiveData(paymentData));

        // TODO: Implement the following:
        // 1. Update payment status in database
        // 2. Calculate token amount based on payment
        // 3. Update user's token balance
        // 4. Send confirmation email/SMS
        // 5. Trigger any post-payment webhooks

        // Validate payment data before processing
        if (!paymentData.amount || !paymentData.mpesaReceiptNumber || !paymentData.phoneNumber) {
          console.error('Incomplete payment data:', maskSensitiveData(paymentData));
          return NextResponse.json({ success: true, message: 'Incomplete data' });
        }

        // For now, we'll just log the successful payment
        // In a real implementation, you would:
        // await updatePaymentStatus(paymentData);
        // await updateUserTokenBalance(paymentData);
        // await sendPaymentConfirmation(paymentData);

        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
        });
      }
    } else {
      // Payment failed
      const failureData = {
        merchantRequestId: callback.MerchantRequestID,
        checkoutRequestId: callback.CheckoutRequestID,
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        status: 'failed',
        timestamp: new Date().toISOString(),
      };

      // Log failed payment with masked data
      console.log('Payment failed:', maskSensitiveData(failureData));

      // Validate failure data
      if (!failureData.merchantRequestId || !failureData.checkoutRequestId) {
        console.error('Incomplete failure data:', maskSensitiveData(failureData));
        return NextResponse.json({ success: true, message: 'Incomplete data' });
      }

      // TODO: Update payment status as failed in database
      // await updatePaymentStatus(failureData);

      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed',
    });

  } catch (error: any) {
    // Log error with context but mask sensitive data
    console.error('Callback processing error:', {
      message: error.message,
      stack: error.stack?.substring(0, 500), // Truncate stack trace
      timestamp: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Always return success to M-Pesa to avoid retries
    // This prevents M-Pesa from repeatedly sending the same callback
    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'M-Pesa callback endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
