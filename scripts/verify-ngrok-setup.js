#!/usr/bin/env node

/**
 * ngrok Setup Verification Script
 * 
 * This script verifies that ngrok is properly configured for M-Pesa testing
 */

const axios = require('axios');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

function logHeader(message) {
  log(`\n=== ${message} ===`, 'cyan');
}

// Check if ngrok is installed
function checkNgrokInstallation() {
  try {
    const version = execSync('ngrok version', { encoding: 'utf8' });
    logSuccess('ngrok is installed');
    logInfo(`Version: ${version.trim()}`);
    return true;
  } catch (error) {
    logError('ngrok is not installed');
    logInfo('Install with: npm install -g ngrok');
    return false;
  }
}

// Check if development server is running
async function checkDevServer() {
  try {
    const response = await axios.get('http://localhost:3000/api/mpesa/payment/callback', {
      timeout: 5000
    });
    logSuccess('Development server is running on port 3000');
    return true;
  } catch (error) {
    logError('Development server is not accessible on port 3000');
    logInfo('Start with: npm run dev');
    return false;
  }
}

// Check environment configuration
function checkEnvironmentConfig() {
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  
  if (!callbackUrl) {
    logError('MPESA_CALLBACK_URL is not set');
    return false;
  }
  
  if (callbackUrl.includes('your-ngrok-url')) {
    logWarning('MPESA_CALLBACK_URL contains placeholder text');
    logInfo('Update with your actual ngrok URL');
    return false;
  }
  
  if (!callbackUrl.includes('ngrok.io')) {
    logWarning('MPESA_CALLBACK_URL does not appear to use ngrok');
    logInfo(`Current URL: ${callbackUrl}`);
    return false;
  }
  
  if (!callbackUrl.startsWith('https://')) {
    logError('MPESA_CALLBACK_URL must use HTTPS');
    return false;
  }
  
  logSuccess('MPESA_CALLBACK_URL is properly configured');
  logInfo(`Callback URL: ${callbackUrl}`);
  return true;
}

// Check if ngrok tunnel is active
async function checkNgrokTunnel() {
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  
  if (!callbackUrl || !callbackUrl.includes('ngrok.io')) {
    logWarning('Cannot verify ngrok tunnel - URL not configured');
    return false;
  }
  
  try {
    const response = await axios.get(callbackUrl, {
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    
    logSuccess('ngrok tunnel is active and accessible');
    logInfo(`Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      logError('ngrok tunnel is not accessible');
      logInfo('Make sure ngrok is running: ngrok http 3000');
    } else {
      logError(`Error accessing ngrok tunnel: ${error.message}`);
    }
    return false;
  }
}

// Check ngrok web interface
async function checkNgrokWebInterface() {
  try {
    const response = await axios.get('http://localhost:4040/api/tunnels', {
      timeout: 5000
    });
    
    const tunnels = response.data.tunnels;
    if (tunnels.length === 0) {
      logWarning('No active ngrok tunnels found');
      return false;
    }
    
    logSuccess('ngrok web interface is accessible');
    
    tunnels.forEach((tunnel, index) => {
      logInfo(`Tunnel ${index + 1}: ${tunnel.public_url} -> ${tunnel.config.addr}`);
    });
    
    return true;
  } catch (error) {
    logWarning('ngrok web interface is not accessible');
    logInfo('This is normal if ngrok is not running');
    return false;
  }
}

// Test callback endpoint accessibility
async function testCallbackEndpoint() {
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  
  if (!callbackUrl || callbackUrl.includes('your-ngrok-url')) {
    logWarning('Cannot test callback endpoint - URL not configured');
    return false;
  }
  
  try {
    const response = await axios.get(callbackUrl, {
      timeout: 10000
    });
    
    if (response.data && response.data.message) {
      logSuccess('Callback endpoint is accessible and responding');
      logInfo(`Response: ${response.data.message}`);
      return true;
    } else {
      logWarning('Callback endpoint responded but with unexpected format');
      return false;
    }
  } catch (error) {
    logError(`Callback endpoint test failed: ${error.message}`);
    return false;
  }
}

// Main verification function
async function runVerification() {
  logHeader('ngrok Setup Verification for NomaToken M-Pesa Integration');
  
  let allChecksPass = true;
  
  // Check 1: ngrok installation
  logHeader('Checking ngrok Installation');
  if (!checkNgrokInstallation()) {
    allChecksPass = false;
  }
  
  // Check 2: Development server
  logHeader('Checking Development Server');
  if (!(await checkDevServer())) {
    allChecksPass = false;
  }
  
  // Check 3: Environment configuration
  logHeader('Checking Environment Configuration');
  if (!checkEnvironmentConfig()) {
    allChecksPass = false;
  }
  
  // Check 4: ngrok tunnel
  logHeader('Checking ngrok Tunnel');
  if (!(await checkNgrokTunnel())) {
    allChecksPass = false;
  }
  
  // Check 5: ngrok web interface
  logHeader('Checking ngrok Web Interface');
  await checkNgrokWebInterface();
  
  // Check 6: Callback endpoint
  logHeader('Testing Callback Endpoint');
  if (!(await testCallbackEndpoint())) {
    allChecksPass = false;
  }
  
  // Summary
  logHeader('Verification Summary');
  
  if (allChecksPass) {
    logSuccess('All checks passed! Your ngrok setup is ready for M-Pesa testing');
    logInfo('Next steps:');
    logInfo('1. Update callback URLs in Safaricom Developer Dashboard');
    logInfo('2. Run M-Pesa tests: npm run test:mpesa');
    logInfo('3. Monitor requests at: http://localhost:4040');
  } else {
    logError('Some checks failed. Please address the issues above');
    logInfo('Refer to the ngrok setup guide: docs/ngrok-setup-guide.md');
  }
  
  return allChecksPass;
}

// Run verification if script is executed directly
if (require.main === module) {
  runVerification().catch(error => {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runVerification };
