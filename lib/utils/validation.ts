import { z } from 'zod';

// Phone number validation schema
export const phoneNumberSchema = z.string()
  .transform((val) => val.replace(/[\s\-\+]/g, '')) // Clean the phone number
  .refine((val) => val.length >= 9, 'Phone number is too short')
  .refine((val) => val.length <= 13, 'Phone number is too long')
  .refine((val) => /^(254|0)[0-9]{9}$/.test(val), 'Invalid phone number format. Use 0712345678 or 254712345678');

// Amount validation schema - accepts both string and number
export const amountSchema = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val))
])
  .refine((val) => !isNaN(val), 'Amount must be a valid number')
  .refine((val) => val >= 1, 'Amount must be at least $1')
  .refine((val) => val <= 10000, 'Amount cannot exceed $10,000')
  .refine((val) => val > 0, 'Amount must be positive');

// M-Pesa payment request validation schema
export const mpesaPaymentRequestSchema = z.object({
  phoneNumber: phoneNumberSchema,
  amount: amountSchema,
  accountReference: z.string()
    .min(1, 'Account reference is required')
    .max(12, 'Account reference cannot exceed 12 characters')
    .optional()
    .default('NomaToken'),
});

// Token purchase validation schema
export const tokenPurchaseSchema = z.object({
  paymentMethod: z.literal('mpesa'),
  amount: amountSchema,
  phoneNumber: phoneNumberSchema,
  mpesaReceiptNumber: z.string()
    .min(8, 'Invalid M-Pesa receipt number')
    .max(15, 'Invalid M-Pesa receipt number')
    .regex(/^[A-Z0-9]+$/, 'Invalid M-Pesa receipt number format'),
  checkoutRequestId: z.string()
    .min(10, 'Invalid checkout request ID')
    .regex(/^ws_CO_/, 'Invalid checkout request ID format'),
  merchantRequestId: z.string()
    .min(5, 'Invalid merchant request ID'),
});

// Validation helper functions
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; formatted?: string; error?: string } {
  try {
    // Clean the phone number
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Validate with schema
    phoneNumberSchema.parse(cleaned);
    
    // Format to 254 format
    let formatted = cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      formatted = '254' + cleaned.substring(1);
    }
    
    return { isValid: true, formatted };
  } catch (error: any) {
    return { isValid: false, error: error.errors?.[0]?.message || 'Invalid phone number' };
  }
}

export function validateAmount(amount: string | number): { isValid: boolean; value?: number; error?: string } {
  try {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    amountSchema.parse(numericAmount);
    return { isValid: true, value: numericAmount };
  } catch (error: any) {
    return { isValid: false, error: error.errors?.[0]?.message || 'Invalid amount' };
  }
}

export function validateMpesaPaymentRequest(data: any): { isValid: boolean; data?: any; errors?: string[] } {
  try {
    const validated = mpesaPaymentRequestSchema.parse(data);
    return { isValid: true, data: validated };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { isValid: false, errors };
  }
}

export function validateTokenPurchase(data: any): { isValid: boolean; data?: any; errors?: string[] } {
  try {
    const validated = tokenPurchaseSchema.parse(data);
    return { isValid: true, data: validated };
  } catch (error: any) {
    const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'];
    return { isValid: false, errors };
  }
}

// Sanitization helpers
export function sanitizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^0-9]/g, '');
}

export function sanitizeAmount(amount: string): string {
  return amount.replace(/[^0-9.]/g, '');
}

export function sanitizeAccountReference(reference: string): string {
  return reference.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 12);
}

// Rate limiting helpers (for client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < this.maxAttempts) {
      return 0;
    }
    
    const oldestAttempt = Math.min(...attempts);
    const remainingTime = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, remainingTime);
  }
}

// Create a global rate limiter for M-Pesa payments
export const mpesaRateLimiter = new RateLimiter(3, 300000); // 3 attempts per 5 minutes
