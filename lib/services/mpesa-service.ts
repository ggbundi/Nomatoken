import axios from 'axios';
import { validatePhoneNumber, validateAmount, mpesaRateLimiter } from '@/lib/utils/validation';

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
  error?: string;
}

export interface PaymentStatus {
  checkoutRequestId: string;
  merchantRequestId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  resultDesc?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPurchaseRequest {
  paymentMethod: 'mpesa';
  amount: number;
  phoneNumber: string;
  mpesaReceiptNumber: string;
  checkoutRequestId: string;
  merchantRequestId: string;
}

export interface TokenPurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    usdAmount: number;
    tokenAmount: number;
    tokenPrice: number;
    paymentMethod: string;
    transactionId: string;
    timestamp: string;
  };
  error?: string;
}

class MpesaService {
  private baseUrl: string;
  private requestCount: Map<string, number> = new Map();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  // Enhanced phone number validation using security utilities
  validatePhoneNumber(phoneNumber: string): boolean {
    const validation = validatePhoneNumber(phoneNumber);
    return validation.isValid;
  }

  // Enhanced phone number formatting with error handling
  formatPhoneNumber(phoneNumber: string): string {
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid phone number format');
    }
    return validation.formatted!;
  }

  // Enhanced amount validation
  validateAmount(amount: string | number): boolean {
    const validation = validateAmount(amount);
    return validation.isValid;
  }

  // Client-side rate limiting check
  private checkRateLimit(operation: string): boolean {
    const key = `${operation}_${Date.now()}`;
    return mpesaRateLimiter.isAllowed(key);
  }

  // Sanitize error messages for user display
  private sanitizeErrorMessage(error: any): string {
    const message = error?.response?.data?.error || error?.message || 'An error occurred';

    // List of safe error messages to show to users
    const safeErrors = [
      'invalid phone number',
      'invalid amount',
      'payment failed',
      'payment timeout',
      'insufficient funds',
      'transaction cancelled',
      'network error',
      'too many requests',
      'minimum purchase amount',
      'maximum purchase amount'
    ];

    const lowerMessage = message.toLowerCase();
    const isSafeError = safeErrors.some(safe => lowerMessage.includes(safe));

    return isSafeError ? message : 'Payment processing failed. Please try again.';
  }

  /**
   * Initiate M-Pesa STK Push payment with enhanced validation and security
   */
  async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit('payment_initiation')) {
        return {
          success: false,
          message: 'Too many payment requests. Please wait before trying again.',
          error: 'Rate limit exceeded',
        };
      }

      // Validate phone number
      if (!this.validatePhoneNumber(request.phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use a valid Kenyan number.',
          error: 'Invalid phone number',
        };
      }

      // Validate amount
      if (!this.validateAmount(request.amount)) {
        return {
          success: false,
          message: 'Invalid amount. Please enter a valid amount between $10 and $10,000.',
          error: 'Invalid amount',
        };
      }

      // Format phone number
      const formattedRequest = {
        ...request,
        phoneNumber: this.formatPhoneNumber(request.phoneNumber),
        accountReference: request.accountReference?.substring(0, 12) || 'NomaToken',
      };

      const response = await axios.post(`${this.baseUrl}/mpesa/payment/initiate`, formattedRequest, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('M-Pesa payment initiation error:', error);

      const sanitizedMessage = this.sanitizeErrorMessage(error);
      return {
        success: false,
        message: sanitizedMessage,
        error: sanitizedMessage,
      };
    }
  }

  /**
   * Check payment status with enhanced error handling
   */
  async checkPaymentStatus(checkoutRequestId: string): Promise<PaymentStatus | null> {
    try {
      // Validate checkout request ID format
      if (!checkoutRequestId || !checkoutRequestId.startsWith('ws_CO_')) {
        console.error('Invalid checkout request ID format:', checkoutRequestId);
        return null;
      }

      // Check rate limiting
      if (!this.checkRateLimit('status_check')) {
        console.warn('Rate limit exceeded for status check');
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/mpesa/payment/status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Payment status check error:', this.sanitizeErrorMessage(error));
      return null;
    }
  }

  /**
   * Poll payment status with timeout
   */
  async pollPaymentStatus(
    checkoutRequestId: string,
    timeoutMs: number = 120000, // 2 minutes
    intervalMs: number = 3000 // 3 seconds
  ): Promise<PaymentStatus | null> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const poll = async () => {
        try {
          const status = await this.checkPaymentStatus(checkoutRequestId);
          
          if (status && status.status !== 'pending') {
            resolve(status);
            return;
          }
          
          if (Date.now() - startTime >= timeoutMs) {
            resolve(null); // Timeout
            return;
          }
          
          setTimeout(poll, intervalMs);
        } catch (error) {
          console.error('Polling error:', error);
          setTimeout(poll, intervalMs);
        }
      };
      
      poll();
    });
  }

  /**
   * Complete token purchase after successful M-Pesa payment with enhanced validation
   */
  async completeTokenPurchase(request: TokenPurchaseRequest): Promise<TokenPurchaseResponse> {
    try {
      // Validate request data
      if (!request.mpesaReceiptNumber || !request.checkoutRequestId || !request.amount) {
        return {
          success: false,
          message: 'Missing required purchase data',
          error: 'Invalid request data',
        };
      }

      // Validate phone number
      if (!this.validatePhoneNumber(request.phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format',
          error: 'Invalid phone number',
        };
      }

      // Validate amount
      if (!this.validateAmount(request.amount)) {
        return {
          success: false,
          message: 'Invalid purchase amount',
          error: 'Invalid amount',
        };
      }

      // Check rate limiting
      if (!this.checkRateLimit('token_purchase')) {
        return {
          success: false,
          message: 'Too many purchase requests. Please wait before trying again.',
          error: 'Rate limit exceeded',
        };
      }

      const response = await axios.post(`${this.baseUrl}/tokens/purchase`, request, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Token purchase completion error:', this.sanitizeErrorMessage(error));

      const sanitizedMessage = this.sanitizeErrorMessage(error);
      return {
        success: false,
        message: sanitizedMessage,
        error: sanitizedMessage,
      };
    }
  }

  /**
   * Calculate token amount based on USD amount
   */
  calculateTokenAmount(usdAmount: number, tokenPrice: number = 0.0245): number {
    return usdAmount / tokenPrice;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  }
}

export const mpesaService = new MpesaService();
