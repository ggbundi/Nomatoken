#!/usr/bin/env node

/**
 * Local M-Pesa Integration Test Script
 * 
 * This script helps you test the M-Pesa integration locally by making
 * API calls to your local development server.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Safaricom sandbox test phone numbers
const TEST_PHONE_NUMBERS = {
  success: '254708374149',
  insufficientFunds: '254708374150',
  invalidAccount: '254708374151',
  genericFailure: '254708374152'
};

// Check if ngrok is properly configured
function checkNgrokSetup() {
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!callbackUrl || callbackUrl.includes('your-ngrok-url')) {
    logWarning('⚠️  MPESA_CALLBACK_URL not properly configured!');
    logInfo('Please update your .env.local file with your actual ngrok URL');
    logInfo('Example: MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/payment/callback');
    return false;
  }

  if (callbackUrl.includes('ngrok.io')) {
    logSuccess('✅ ngrok callback URL configured');
    logInfo(`Callback URL: ${callbackUrl}`);
    return true;
  }

  logWarning('⚠️  Callback URL doesn\'t appear to be using ngrok');
  logInfo(`Current URL: ${callbackUrl}`);
  return false;
}

// Test scenarios
const testScenarios = [
  {
    name: 'Valid Payment Request',
    phoneNumber: TEST_PHONE_NUMBERS.success,
    amount: 100,
    expectedResult: 'success'
  },
  {
    name: 'Invalid Phone Number',
    phoneNumber: '123456789',
    amount: 100,
    expectedResult: 'validation_error'
  },
  {
    name: 'Amount Too Low',
    phoneNumber: TEST_PHONE_NUMBERS.success,
    amount: 0.5,
    expectedResult: 'validation_error'
  },
  {
    name: 'Amount Too High',
    phoneNumber: TEST_PHONE_NUMBERS.success,
    amount: 15000,
    expectedResult: 'validation_error'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test M-Pesa payment initiation
async function testPaymentInitiation(scenario) {
  try {
    log(`\nTesting: ${scenario.name}`, 'bright');
    log(`Phone: ${scenario.phoneNumber}, Amount: $${scenario.amount}`);

    const response = await axios.post(`${BASE_URL}/mpesa/payment/initiate`, {
      phoneNumber: scenario.phoneNumber,
      amount: scenario.amount,
      accountReference: 'NomaToken Test'
    });

    if (response.data.success) {
      logSuccess('Payment initiation successful');
      logInfo(`Checkout Request ID: ${response.data.data?.CheckoutRequestID}`);
      return response.data.data?.CheckoutRequestID;
    } else {
      if (scenario.expectedResult === 'validation_error') {
        logSuccess('Validation error caught as expected');
      } else {
        logError(`Payment failed: ${response.data.message}`);
      }
      return null;
    }
  } catch (error) {
    if (scenario.expectedResult === 'validation_error') {
      logSuccess('Validation error caught as expected');
      logInfo(`Error: ${error.response?.data?.error || error.message}`);
    } else {
      logError(`Request failed: ${error.response?.data?.error || error.message}`);
    }
    return null;
  }
}

// Test payment status checking
async function testPaymentStatus(checkoutRequestId) {
  if (!checkoutRequestId) return;

  try {
    log('\nTesting payment status check...', 'bright');

    const response = await axios.get(`${BASE_URL}/mpesa/payment/status`, {
      params: { checkoutRequestId }
    });

    if (response.data.success) {
      logSuccess('Status check successful');
      logInfo(`Status: ${response.data.data?.status || 'pending'}`);
    } else {
      logError(`Status check failed: ${response.data.error}`);
    }
  } catch (error) {
    logError(`Status check request failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test token purchase completion
async function testTokenPurchase() {
  try {
    log('\nTesting token purchase completion...', 'bright');

    const response = await axios.post(`${BASE_URL}/tokens/purchase`, {
      paymentMethod: 'mpesa',
      amount: 100,
      phoneNumber: TEST_PHONE_NUMBERS.success,
      mpesaReceiptNumber: 'TEST_RECEIPT_123',
      checkoutRequestId: 'ws_CO_TEST_123456789',
      merchantRequestId: 'merchant_test_123'
    });

    if (response.data.success) {
      logSuccess('Token purchase successful');
      logInfo(`Tokens awarded: ${response.data.data?.tokenAmount}`);
    } else {
      logError(`Token purchase failed: ${response.data.error}`);
    }
  } catch (error) {
    logError(`Token purchase request failed: ${error.response?.data?.error || error.message}`);
  }
}

// Test rate limiting
async function testRateLimiting() {
  log('\nTesting rate limiting...', 'bright');
  
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(
      axios.post(`${BASE_URL}/mpesa/payment/initiate`, {
        phoneNumber: TEST_PHONE_NUMBERS.success,
        amount: 10,
        accountReference: `Test ${i}`
      }).catch(error => error.response)
    );
  }

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r?.status === 429);
  
  if (rateLimited.length > 0) {
    logSuccess(`Rate limiting working: ${rateLimited.length} requests blocked`);
  } else {
    logWarning('Rate limiting may not be working properly');
  }
}

// Main test function
async function runTests() {
  logHeader('M-Pesa Integration Local Test Suite');
  
  logInfo('Make sure your development server is running on http://localhost:3000');
  logInfo('Update your .env.local file with valid M-Pesa sandbox credentials');
  logWarning('Note: Some tests may fail if M-Pesa credentials are not configured');

  // Check ngrok setup
  logHeader('Checking ngrok Configuration');
  const ngrokConfigured = checkNgrokSetup();
  if (!ngrokConfigured) {
    logWarning('ngrok may not be properly configured. Some callback tests may fail.');
  }

  // Test server connectivity
  try {
    await axios.get(`${BASE_URL}/mpesa/payment/status?checkoutRequestId=test`);
    logSuccess('Server is running and accessible');
  } catch (error) {
    logError('Cannot connect to development server. Make sure it\'s running with: npm run dev');
    process.exit(1);
  }

  // Run test scenarios
  logHeader('Testing Payment Initiation Scenarios');
  let validCheckoutRequestId = null;

  for (const scenario of testScenarios) {
    const checkoutRequestId = await testPaymentInitiation(scenario);
    if (checkoutRequestId && scenario.expectedResult === 'success') {
      validCheckoutRequestId = checkoutRequestId;
    }
  }

  // Test payment status
  logHeader('Testing Payment Status Check');
  await testPaymentStatus(validCheckoutRequestId || 'ws_CO_TEST_123456789');

  // Test token purchase
  logHeader('Testing Token Purchase Completion');
  await testTokenPurchase();

  // Test rate limiting
  logHeader('Testing Rate Limiting');
  await testRateLimiting();

  logHeader('Test Suite Complete');
  logInfo('Check the console output above for test results');
  logInfo('For manual testing, visit: http://localhost:3000');
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testPaymentInitiation,
  testPaymentStatus,
  testTokenPurchase,
  TEST_PHONE_NUMBERS
};
