# M-Pesa Integration Testing Guide

This guide provides comprehensive instructions for testing the M-Pesa payment integration in the NomaToken platform.

## Prerequisites

### 1. Safaricom Developer Account
- Register at [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
- Create a new app and obtain sandbox credentials
- Note down your Consumer Key and Consumer Secret

### 2. Environment Setup
- Copy `.env.local.example` to `.env.local`
- Update M-Pesa credentials with your sandbox values
- Ensure callback URL is publicly accessible (use ngrok for local development)

### 3. Required Tools
- Node.js 18+ and npm/yarn
- ngrok (for local callback URL exposure)
- Postman or similar API testing tool (optional)

## Sandbox Configuration

### Environment Variables
```bash
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/payment/callback
```

### Test Phone Numbers
Safaricom provides specific test phone numbers for different scenarios:

- `254708374149` - Success scenario
- `254708374150` - Insufficient funds scenario  
- `254708374151` - Invalid account scenario
- `254708374152` - Generic failure scenario

## Testing Scenarios

### 1. Successful Payment Flow

**Steps:**
1. Navigate to the token purchase page
2. Select M-Pesa payment method
3. Enter phone number: `254708374149`
4. Enter amount: `100` (USD)
5. Click "Pay with M-Pesa"
6. Verify STK push is initiated
7. Check payment status polling
8. Confirm token purchase completion

**Expected Results:**
- Payment request sent successfully
- Status changes from "waiting" to "polling" to "completed"
- Token amount calculated correctly (100 / 0.0245 = 4,081.63 tokens)
- Success message displayed

### 2. Insufficient Funds Scenario

**Steps:**
1. Use phone number: `254708374150`
2. Follow same process as successful payment

**Expected Results:**
- Payment fails with "Insufficient funds" message
- Status changes to "failed"
- No tokens awarded
- Appropriate error message displayed

### 3. Invalid Phone Number Validation

**Test Cases:**
- Empty phone number
- Invalid format: `123456789`
- Non-Kenyan number: `1234567890`
- Special characters: `+254-712-345-678`

**Expected Results:**
- Client-side validation prevents submission
- Clear error messages displayed
- No API calls made for invalid numbers

### 4. Amount Validation

**Test Cases:**
- Below minimum: `5` USD
- Above maximum: `15000` USD
- Invalid format: `abc`
- Negative amount: `-100`

**Expected Results:**
- Validation errors displayed
- No payment initiation for invalid amounts
- Clear guidance on valid ranges

### 5. Rate Limiting

**Steps:**
1. Make multiple rapid payment requests (>5 in 5 minutes)
2. Observe rate limiting behavior

**Expected Results:**
- Rate limit error after threshold exceeded
- Clear message about waiting period
- Subsequent requests blocked until cooldown

### 6. Network Error Handling

**Steps:**
1. Disconnect internet during payment
2. Simulate server errors (modify API responses)

**Expected Results:**
- Graceful error handling
- User-friendly error messages
- No sensitive information exposed

## API Endpoint Testing

### 1. Payment Initiation
```bash
POST /api/mpesa/payment/initiate
Content-Type: application/json

{
  "phoneNumber": "254708374149",
  "amount": 100,
  "accountReference": "NomaToken"
}
```

### 2. Payment Status Check
```bash
GET /api/mpesa/payment/status?checkoutRequestId=ws_CO_123456789
```

### 3. Token Purchase Completion
```bash
POST /api/tokens/purchase
Content-Type: application/json

{
  "paymentMethod": "mpesa",
  "amount": 100,
  "phoneNumber": "254708374149",
  "mpesaReceiptNumber": "NLJ7RT61SV",
  "checkoutRequestId": "ws_CO_123456789",
  "merchantRequestId": "merchant_123"
}
```

## Security Testing

### 1. Input Validation
- Test SQL injection attempts
- Test XSS payloads
- Test malformed JSON requests
- Test oversized payloads

### 2. Authentication
- Test without proper M-Pesa credentials
- Test with expired tokens
- Test with invalid business short codes

### 3. Rate Limiting
- Test API rate limits
- Test concurrent requests
- Test distributed attacks

## Monitoring and Logging

### 1. Check Application Logs
```bash
# View real-time logs
tail -f logs/development.log

# Search for M-Pesa related logs
grep "M-Pesa" logs/development.log
```

### 2. Monitor API Responses
- Check response times
- Monitor error rates
- Verify callback processing

### 3. Database Verification (if applicable)
- Verify payment records created
- Check token balance updates
- Confirm transaction history

## Troubleshooting

### Common Issues

1. **Callback URL Not Accessible**
   - Ensure ngrok is running
   - Verify URL is publicly accessible
   - Check firewall settings

2. **Invalid Credentials**
   - Verify sandbox credentials
   - Check environment variable names
   - Ensure no trailing spaces

3. **Payment Timeout**
   - Check network connectivity
   - Verify Safaricom sandbox status
   - Increase timeout values if needed

4. **Validation Errors**
   - Check phone number format
   - Verify amount ranges
   - Ensure required fields present

### Debug Steps

1. **Enable Debug Logging**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```

2. **Check Network Requests**
   - Use browser dev tools
   - Monitor API calls
   - Verify request/response data

3. **Test Individual Components**
   - Run unit tests: `npm test`
   - Test validation functions
   - Verify utility methods

## Production Readiness Checklist

- [ ] All tests passing
- [ ] Security validations implemented
- [ ] Rate limiting configured
- [ ] Error handling comprehensive
- [ ] Logging properly configured
- [ ] Environment variables secured
- [ ] Callback URL registered with Safaricom
- [ ] Production credentials obtained
- [ ] SSL certificate configured
- [ ] Monitoring alerts set up

## Support and Resources

- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/docs)
- [NomaToken Technical Documentation](./technical-documentation.md)
- [Security Best Practices](./security-guidelines.md)

## Contact

For technical support or questions about the M-Pesa integration:
- Email: support@nomatoken.com
- Documentation: [Internal Wiki Link]
- Issue Tracker: [GitHub Issues Link]
