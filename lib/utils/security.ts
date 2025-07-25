import crypto from 'crypto';

// Security utilities for M-Pesa integration

/**
 * Generate a secure random string
 */
export function generateSecureId(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging/storage
 */
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate M-Pesa callback signature (if Safaricom provides one)
 */
export function validateCallbackSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize request data to prevent injection attacks
 */
export function sanitizeRequestData(data: any): any {
  if (typeof data === 'string') {
    return data.replace(/[<>\"'&]/g, '');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeRequestData(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Validate request origin
 */
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * Generate timestamp for M-Pesa requests
 */
export function generateMpesaTimestamp(): string {
  const date = new Date();
  return date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);
}

/**
 * Generate M-Pesa password
 */
export function generateMpesaPassword(
  businessShortCode: string,
  passkey: string,
  timestamp: string
): string {
  return Buffer.from(businessShortCode + passkey + timestamp).toString('base64');
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  const sensitiveFields = [
    'password', 'passkey', 'consumer_secret', 'access_token',
    'phoneNumber', 'phone', 'mpesaReceiptNumber'
  ];
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (field === 'phoneNumber' || field === 'phone') {
          // Mask phone number: 254712345678 -> 254****5678
          const phone = masked[field].toString();
          masked[field] = phone.slice(0, 3) + '****' + phone.slice(-4);
        } else {
          // Mask other sensitive fields
          masked[field] = '***MASKED***';
        }
      }
    }
    
    return masked;
  }
  
  return data;
}

/**
 * Rate limiting for API endpoints
 */
export class ServerRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true };
    }

    if (record.count >= this.maxAttempts) {
      return { allowed: false, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    this.attempts.set(identifier, record);
    
    return { allowed: true };
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
}

/**
 * Input validation helpers
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidAmount(amount: any): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000 && Number.isFinite(num);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^254[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Environment validation
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_BUSINESS_SHORT_CODE',
    'MPESA_PASSKEY',
    'MPESA_ENVIRONMENT'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Error sanitization for client responses
 */
export function sanitizeError(error: any): { message: string; code?: string } {
  // Don't expose internal errors to clients
  const safeErrors = [
    'Invalid phone number',
    'Invalid amount',
    'Payment failed',
    'Payment timeout',
    'Insufficient funds',
    'Transaction cancelled',
    'Network error'
  ];

  const message = error?.message || 'An error occurred';
  
  // Check if it's a safe error to expose
  const isSafeError = safeErrors.some(safe => message.toLowerCase().includes(safe.toLowerCase()));
  
  return {
    message: isSafeError ? message : 'Payment processing failed. Please try again.',
    code: error?.code
  };
}
