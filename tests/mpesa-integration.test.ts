/**
 * M-Pesa Integration Test Suite
 * 
 * This file contains comprehensive tests for the M-Pesa payment integration
 * including API endpoints, validation, security measures, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { mpesaService } from '@/lib/services/mpesa-service';
import { validatePhoneNumber, validateAmount } from '@/lib/utils/validation';
import { maskSensitiveData, sanitizeError } from '@/lib/utils/security';

// Mock axios for testing
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('M-Pesa Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Number Validation', () => {
    it('should validate correct Kenyan phone numbers', () => {
      const validNumbers = [
        '254712345678',
        '0712345678',
        '254722345678',
        '0722345678'
      ];

      validNumbers.forEach(number => {
        expect(mpesaService.validatePhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        '123456789',
        '254812345678', // Invalid operator code
        '071234567', // Too short
        '07123456789', // Too long
        '+254712345678', // Plus sign not handled in basic validation
        'abcdefghij'
      ];

      invalidNumbers.forEach(number => {
        expect(mpesaService.validatePhoneNumber(number)).toBe(false);
      });
    });

    it('should format phone numbers correctly', () => {
      expect(mpesaService.formatPhoneNumber('0712345678')).toBe('254712345678');
      expect(mpesaService.formatPhoneNumber('254712345678')).toBe('254712345678');
    });

    it('should throw error for invalid phone number formatting', () => {
      expect(() => mpesaService.formatPhoneNumber('123456789')).toThrow();
    });
  });

  describe('Amount Validation', () => {
    it('should validate correct amounts', () => {
      const validAmounts = [10, 100, 1000, 10000, '50', '500.50'];
      
      validAmounts.forEach(amount => {
        expect(mpesaService.validateAmount(amount)).toBe(true);
      });
    });

    it('should reject invalid amounts', () => {
      const invalidAmounts = [0, -10, 10001, 'abc', '', null, undefined];
      
      invalidAmounts.forEach(amount => {
        expect(mpesaService.validateAmount(amount)).toBe(false);
      });
    });
  });

  describe('M-Pesa Service Methods', () => {
    it('should initiate payment with valid data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            CheckoutRequestID: 'ws_CO_123456789',
            MerchantRequestID: 'merchant_123',
            ResponseCode: '0',
            ResponseDescription: 'Success'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await mpesaService.initiatePayment({
        phoneNumber: '254712345678',
        amount: 100,
        accountReference: 'NomaToken'
      });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/mpesa/payment/initiate'),
        expect.objectContaining({
          phoneNumber: '254712345678',
          amount: 100,
          accountReference: 'NomaToken'
        }),
        expect.objectContaining({
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should handle payment initiation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await mpesaService.initiatePayment({
        phoneNumber: '254712345678',
        amount: 100,
        accountReference: 'NomaToken'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should check payment status', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            checkoutRequestId: 'ws_CO_123456789',
            status: 'completed',
            amount: 100,
            mpesaReceiptNumber: 'NLJ7RT61SV'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await mpesaService.checkPaymentStatus('ws_CO_123456789');

      expect(result).toBeDefined();
      expect(result?.status).toBe('completed');
    });

    it('should handle invalid checkout request ID', async () => {
      const result = await mpesaService.checkPaymentStatus('invalid_id');
      expect(result).toBeNull();
    });
  });

  describe('Security Utilities', () => {
    it('should mask sensitive data correctly', () => {
      const sensitiveData = {
        phoneNumber: '254712345678',
        password: 'secret123',
        mpesaReceiptNumber: 'NLJ7RT61SV'
      };

      const masked = maskSensitiveData(sensitiveData);
      
      expect(masked.phoneNumber).toBe('254****5678');
      expect(masked.password).toBe('***MASKED***');
      expect(masked.mpesaReceiptNumber).toBeDefined();
    });

    it('should sanitize error messages', () => {
      const internalError = new Error('Database connection failed at line 123');
      const sanitized = sanitizeError(internalError);
      
      expect(sanitized.message).toBe('Payment processing failed. Please try again.');
    });

    it('should preserve safe error messages', () => {
      const safeError = new Error('Invalid phone number');
      const sanitized = sanitizeError(safeError);
      
      expect(sanitized.message).toBe('Invalid phone number');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on payment initiation', async () => {
      // Mock multiple rapid requests
      const requests = Array(6).fill(null).map(() => 
        mpesaService.initiatePayment({
          phoneNumber: '254712345678',
          amount: 100,
          accountReference: 'NomaToken'
        })
      );

      const results = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResults = results.filter(r => 
        r.error === 'Rate limit exceeded'
      );
      
      expect(rateLimitedResults.length).toBeGreaterThan(0);
    });
  });

  describe('Token Purchase Integration', () => {
    it('should complete token purchase with valid M-Pesa data', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Token purchase completed successfully',
          data: {
            usdAmount: 100,
            tokenAmount: 4081.63,
            tokenPrice: 0.0245,
            paymentMethod: 'mpesa',
            transactionId: 'NLJ7RT61SV'
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await mpesaService.completeTokenPurchase({
        paymentMethod: 'mpesa',
        amount: 100,
        phoneNumber: '254712345678',
        mpesaReceiptNumber: 'NLJ7RT61SV',
        checkoutRequestId: 'ws_CO_123456789',
        merchantRequestId: 'merchant_123'
      });

      expect(result.success).toBe(true);
      expect(result.data?.tokenAmount).toBe(4081.63);
    });

    it('should validate token purchase request data', async () => {
      const result = await mpesaService.completeTokenPurchase({
        paymentMethod: 'mpesa',
        amount: 100,
        phoneNumber: 'invalid_phone',
        mpesaReceiptNumber: 'NLJ7RT61SV',
        checkoutRequestId: 'ws_CO_123456789',
        merchantRequestId: 'merchant_123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number');
    });
  });

  describe('Utility Functions', () => {
    it('should calculate token amounts correctly', () => {
      expect(mpesaService.calculateTokenAmount(100, 0.0245)).toBeCloseTo(4081.63, 2);
      expect(mpesaService.calculateTokenAmount(50, 0.0245)).toBeCloseTo(2040.82, 2);
    });

    it('should format currency correctly', () => {
      expect(mpesaService.formatCurrency(100)).toBe('$100.00');
      expect(mpesaService.formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format token amounts correctly', () => {
      expect(mpesaService.formatTokenAmount(4081.63)).toBe('4,081.63');
      expect(mpesaService.formatTokenAmount(1000000.123456)).toBe('1,000,000.123456');
    });
  });
});

// Integration test scenarios for manual testing
export const testScenarios = {
  validPayment: {
    phoneNumber: '254712345678',
    amount: 100,
    accountReference: 'NomaToken Test'
  },
  
  invalidPhone: {
    phoneNumber: '123456789',
    amount: 100,
    accountReference: 'NomaToken Test'
  },
  
  invalidAmount: {
    phoneNumber: '254712345678',
    amount: 5, // Below minimum
    accountReference: 'NomaToken Test'
  },
  
  largeAmount: {
    phoneNumber: '254712345678',
    amount: 15000, // Above maximum
    accountReference: 'NomaToken Test'
  }
};
