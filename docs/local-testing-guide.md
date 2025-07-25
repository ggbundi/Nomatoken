# Local M-Pesa Testing Guide

This guide will help you test the M-Pesa integration locally on your development machine.

## Prerequisites

### 1. Safaricom Developer Account Setup
1. Go to [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. Create an account and log in
3. Create a new app in the sandbox environment
4. Note down your **Consumer Key** and **Consumer Secret**

### 2. Install ngrok (for callback URL)
```bash
# Install ngrok globally
npm install -g ngrok

# Or download from https://ngrok.com/download
```

## Step-by-Step Local Testing

### Step 1: Configure Environment Variables

Update your `.env.local` file with your M-Pesa sandbox credentials:

```bash
# M-Pesa Configuration (Sandbox)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_actual_consumer_key_here
MPESA_CONSUMER_SECRET=your_actual_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/payment/callback
```

### Step 2: Start Your Development Server

```bash
# Install dependencies if not already done
npm install

# Start the development server
npm run dev
```

Your server should be running at `http://localhost:3000`

### Step 3: Set Up ngrok for Callback URL

In a new terminal window:

```bash
# Expose your local server to the internet
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update your `.env.local`:

```bash
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/payment/callback
```

Restart your development server after updating the callback URL.

### Step 4: Run Automated Tests

```bash
# Make the test script executable
chmod +x scripts/test-mpesa-local.js

# Run the test suite
node scripts/test-mpesa-local.js
```

### Step 5: Manual Testing via Browser

1. Open `http://localhost:3000` in your browser
2. Navigate to the token purchase section
3. Select "M-Pesa" as payment method
4. Use these test phone numbers:

#### Test Phone Numbers (Safaricom Sandbox)
- **254708374149** - Success scenario
- **254708374150** - Insufficient funds
- **254708374151** - Invalid account
- **254708374152** - Generic failure

#### Test Amounts
- **Valid**: $10 - $1000
- **Invalid**: $0.50 (too low), $15000 (too high)

### Step 6: API Testing with curl

Test individual endpoints:

#### 1. Payment Initiation
```bash
curl -X POST http://localhost:3000/api/mpesa/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254708374149",
    "amount": 100,
    "accountReference": "NomaToken Test"
  }'
```

#### 2. Payment Status Check
```bash
curl "http://localhost:3000/api/mpesa/payment/status?checkoutRequestId=ws_CO_123456789"
```

#### 3. Token Purchase
```bash
curl -X POST http://localhost:3000/api/tokens/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "mpesa",
    "amount": 100,
    "phoneNumber": "254708374149",
    "mpesaReceiptNumber": "TEST123",
    "checkoutRequestId": "ws_CO_123456789",
    "merchantRequestId": "merchant_123"
  }'
```

## Expected Test Results

### ✅ Successful Tests
- Payment initiation with valid phone number and amount
- Proper validation error messages for invalid inputs
- Rate limiting kicks in after multiple requests
- Status checks return appropriate responses
- Token purchase calculates correct token amounts

### ❌ Common Issues and Solutions

#### 1. "Cannot connect to server"
- **Solution**: Make sure `npm run dev` is running
- Check that port 3000 is not blocked

#### 2. "Invalid credentials" or "Unauthorized"
- **Solution**: Verify your M-Pesa Consumer Key and Secret
- Make sure you're using sandbox credentials, not production

#### 3. "Callback URL not accessible"
- **Solution**: Ensure ngrok is running and URL is correct
- Register the callback URL in Safaricom developer portal

#### 4. "Rate limit exceeded"
- **Solution**: This is expected behavior - wait a few minutes
- Or restart the server to reset rate limits

#### 5. "Module not found" errors
- **Solution**: Run `npm install` to install dependencies
- Check that axios and zod are installed

## Monitoring and Debugging

### 1. Check Server Logs
Monitor your terminal running `npm run dev` for:
- API request logs
- Error messages
- M-Pesa callback notifications

### 2. Browser Developer Tools
- Open Network tab to see API requests
- Check Console for JavaScript errors
- Monitor response times and status codes

### 3. ngrok Web Interface
- Visit `http://localhost:4040` to see ngrok requests
- Monitor callback requests from Safaricom

## Test Checklist

- [ ] Environment variables configured
- [ ] Development server running
- [ ] ngrok exposing callback URL
- [ ] Automated test script passes
- [ ] Manual browser testing works
- [ ] API endpoints respond correctly
- [ ] Validation errors handled properly
- [ ] Rate limiting functions
- [ ] Error messages are user-friendly
- [ ] No sensitive data in logs

## Next Steps

Once local testing is successful:

1. **Staging Environment**: Deploy to a staging server
2. **Production Credentials**: Obtain production M-Pesa credentials
3. **SSL Certificate**: Ensure HTTPS for production callback URL
4. **Monitoring**: Set up logging and monitoring
5. **Load Testing**: Test with higher volumes

## Support

If you encounter issues:

1. Check the [M-Pesa Testing Guide](./mpesa-testing-guide.md)
2. Review Safaricom's [API Documentation](https://developer.safaricom.co.ke/docs)
3. Check the browser console and server logs
4. Verify all environment variables are set correctly

## Security Notes

- Never commit real credentials to version control
- Use sandbox environment for all testing
- Regularly rotate API credentials
- Monitor for unusual activity in logs
