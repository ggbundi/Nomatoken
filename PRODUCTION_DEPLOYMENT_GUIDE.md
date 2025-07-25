# 🚀 NomaToken Production Deployment Guide

## 📋 Current Situation Analysis

**Current Setup:**
- ✅ Frontend deployed to cPanel at https://nomatoken.com/ (static export)
- ✅ M-Pesa integration working locally with API routes
- ❌ Conflict: Static export doesn't support API routes needed for M-Pesa

**Challenge:**
M-Pesa requires server-side API routes for payment processing, callbacks, and security, which are incompatible with static exports.

## 🎯 Recommended Solution: Hybrid Deployment

### **Strategy Overview:**
1. **Frontend**: Deploy static files to cPanel (existing setup)
2. **API Backend**: Deploy to Vercel/Netlify Functions (serverless)
3. **Domain**: Keep https://nomatoken.com/ for frontend
4. **API**: Use subdomain like api.nomatoken.com or external API URL

## 📝 Step-by-Step Implementation

### Phase 1: Prepare API Backend for Serverless Deployment

#### 1.1 Create Vercel Configuration
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "env": {
    "MPESA_ENVIRONMENT": "production",
    "MPESA_CONSUMER_KEY": "@mpesa-consumer-key",
    "MPESA_CONSUMER_SECRET": "@mpesa-consumer-secret",
    "MPESA_BUSINESS_SHORT_CODE": "@mpesa-business-short-code",
    "MPESA_PASSKEY": "@mpesa-passkey",
    "MPESA_CALLBACK_URL": "@mpesa-callback-url"
  }
}
```

#### 1.2 Update Environment Variables for Production
```env
# Production M-Pesa Configuration
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_production_short_code
MPESA_PASSKEY=your_production_passkey
MPESA_CALLBACK_URL=https://api.nomatoken.com/api/mpesa/payment/callback

# API Configuration
NEXT_PUBLIC_API_URL=https://api.nomatoken.com/api
```

### Phase 2: Frontend Configuration for Production

#### 2.1 Update Next.js Config for Static Export
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.nomatoken.com/api',
  }
};

module.exports = nextConfig;
```

#### 2.2 Update API Service Configuration
```typescript
// lib/config/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api' 
    : 'https://api.nomatoken.com/api');

export { API_BASE_URL };
```

### Phase 3: Deployment Steps

#### 3.1 Deploy API Backend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy API backend
vercel --prod

# Set environment variables
vercel env add MPESA_CONSUMER_KEY production
vercel env add MPESA_CONSUMER_SECRET production
# ... add all M-Pesa variables
```

#### 3.2 Deploy Frontend to cPanel
```bash
# Build static export
npm run build

# Upload 'out' folder contents to cPanel public_html
# Ensure .htaccess is configured for SPA routing
```

### Phase 4: Domain Configuration

#### 4.1 Set up API Subdomain
1. **In cPanel**: Create subdomain `api.nomatoken.com`
2. **Point to Vercel**: Add CNAME record pointing to your Vercel deployment
3. **SSL**: Ensure SSL certificate covers both main domain and subdomain

#### 4.2 Update Safaricom Developer Portal
- Change callback URL to: `https://api.nomatoken.com/api/mpesa/payment/callback`
- Update all M-Pesa configuration with production credentials

## 🔧 Alternative Solutions

### Option 2: Full Node.js on cPanel (If Supported)

#### Check cPanel Node.js Support:
1. Log into cPanel
2. Look for "Node.js Apps" or "Node.js Selector"
3. If available, proceed with Node.js deployment

#### Node.js Deployment Steps:
```bash
# Prepare production build
npm run build

# Create deployment package
tar -czf nomatoken-production.tar.gz .next public package.json server.js .env.production

# Upload and extract in cPanel
# Configure Node.js app with startup file: server.js
```

### Option 3: Migrate to Vercel/Netlify (Recommended Long-term)

#### Benefits:
- ✅ Full Next.js support including API routes
- ✅ Automatic deployments from Git
- ✅ Built-in SSL and CDN
- ✅ Serverless functions for M-Pesa
- ✅ Environment variable management

#### Migration Steps:
1. **Connect repository** to Vercel/Netlify
2. **Configure environment variables** in platform dashboard
3. **Update domain DNS** to point to new hosting
4. **Set up custom domain** nomatoken.com

## 🔒 Security Considerations

### Production Environment Variables:
```env
# Never commit these to version control
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_actual_production_key
MPESA_CONSUMER_SECRET=your_actual_production_secret
MPESA_BUSINESS_SHORT_CODE=your_actual_short_code
MPESA_PASSKEY=your_actual_production_passkey
MPESA_CALLBACK_URL=https://api.nomatoken.com/api/mpesa/payment/callback

# Rate limiting for production
MPESA_MAX_REQUESTS_PER_MINUTE=30
MPESA_MAX_PAYMENT_ATTEMPTS=5
MPESA_PAYMENT_TIMEOUT_MS=60000
```

### CORS Configuration:
```typescript
// Add to API routes
const allowedOrigins = [
  'https://nomatoken.com',
  'https://www.nomatoken.com'
];
```

## 📊 Testing Strategy

### Pre-deployment Testing:
1. **Local testing** with production environment variables
2. **Staging deployment** to test subdomain setup
3. **M-Pesa sandbox testing** with production-like setup
4. **End-to-end payment flow** testing

### Post-deployment Verification:
1. **Frontend functionality** on https://nomatoken.com/
2. **API endpoints** accessibility
3. **M-Pesa payment initiation** and callbacks
4. **SSL certificate** validation
5. **Performance** and loading times

## 🚨 Rollback Plan

### If Issues Occur:
1. **Keep current static site** as backup
2. **DNS TTL** set to low value (300s) for quick changes
3. **Environment variables** backed up securely
4. **Database backups** if applicable

## 📞 Next Steps

1. **Choose deployment strategy** (Hybrid recommended)
2. **Set up production M-Pesa credentials** with Safaricom
3. **Configure API backend** deployment
4. **Test thoroughly** before going live
5. **Monitor** payment flows and error rates

Would you like me to proceed with implementing any of these strategies?
