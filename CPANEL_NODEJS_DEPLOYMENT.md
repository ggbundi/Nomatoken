# 🚀 NomaToken cPanel Node.js Production Deployment

## 📋 Overview
Deploy the complete NomaToken application with M-Pesa integration to your Node.js-enabled cPanel hosting at https://nomatoken.com/

## 🎯 Deployment Strategy
- **Platform**: cPanel with Node.js support
- **Domain**: https://nomatoken.com/ (existing)
- **Features**: Full Next.js app with API routes for M-Pesa
- **SSL**: Existing SSL certificate
- **Database**: File-based storage (no external DB needed)

## 📝 Step-by-Step Deployment

### Phase 1: Prepare Production Environment

#### 1.1 Create Production Environment File
Create `.env.production` with your actual M-Pesa production credentials:

```env
# Production Environment Configuration
NODE_ENV=production

# Reown AppKit Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=1eeba23b8a565e4340dab5918b836327

# BSC Network Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# NOMA Token Contract (Update with actual addresses)
NEXT_PUBLIC_NOMA_TOKEN_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TOKEN_SALE_CONTRACT=0x0000000000000000000000000000000000000000

# Supported Tokens for Purchase
NEXT_PUBLIC_USDT_CONTRACT=0x55d398326f99059fF775485246999027B3197955
NEXT_PUBLIC_BUSD_CONTRACT=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56

# Network Configuration
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56
NEXT_PUBLIC_ENABLE_TESTNET=false

# M-Pesa Production Configuration
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=YOUR_PRODUCTION_CONSUMER_KEY
MPESA_CONSUMER_SECRET=YOUR_PRODUCTION_CONSUMER_SECRET
MPESA_BUSINESS_SHORT_CODE=YOUR_PRODUCTION_SHORT_CODE
MPESA_PASSKEY=YOUR_PRODUCTION_PASSKEY
MPESA_CALLBACK_URL=https://nomatoken.com/api/mpesa/payment/callback

# M-Pesa Security & Rate Limiting (Production)
MPESA_MAX_REQUESTS_PER_MINUTE=30
MPESA_MAX_PAYMENT_ATTEMPTS=5
MPESA_PAYMENT_TIMEOUT_MS=60000
MPESA_STATUS_CHECK_INTERVAL_MS=5000

# Token Configuration
NOMA_TOKEN_PRICE=0.0245
MIN_PURCHASE_AMOUNT=1
MAX_PURCHASE_AMOUNT=1000

# API Configuration
NEXT_PUBLIC_API_URL=https://nomatoken.com/api

# Server Configuration
PORT=3000
HOSTNAME=0.0.0.0
```

#### 1.2 Update Next.js Configuration for Production
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for Node.js deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Add production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
```

### Phase 2: Build and Package Application

#### 2.1 Create Production Build Script
```bash
#!/bin/bash
# build-production.sh

echo "🚀 Building NomaToken for cPanel Node.js deployment..."

# Clean previous builds
rm -rf .next
rm -rf node_modules
rm -rf deployment

# Install dependencies
npm install --production=false

# Build the application
npm run build

# Create deployment directory
mkdir -p deployment

# Copy necessary files
cp -r .next deployment/
cp -r public deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp server.js deployment/
cp .env.production deployment/.env

# Create production package.json
cat > deployment/package.json << 'EOF'
{
  "name": "nomatoken-production",
  "version": "1.0.0",
  "description": "NomaToken DApp - Production",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "install:prod": "npm install --only=production"
  },
  "dependencies": {
    "next": "13.5.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "^1.11.0",
    "zod": "^3.25.76"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

echo "✅ Production build complete in 'deployment' folder"
```

#### 2.2 Create Deployment Package
```bash
# Make script executable
chmod +x build-production.sh

# Run build script
./build-production.sh

# Create compressed archive
cd deployment
tar -czf ../nomatoken-production.tar.gz .
cd ..

echo "📦 Deployment package: nomatoken-production.tar.gz"
```

### Phase 3: cPanel Deployment

#### 3.1 Upload Application
1. **Access cPanel File Manager**
2. **Navigate to your domain folder** (usually `public_html`)
3. **Upload** `nomatoken-production.tar.gz`
4. **Extract** the archive
5. **Set permissions**: 755 for folders, 644 for files

#### 3.2 Configure Node.js Application
1. **Go to "Node.js Apps"** in cPanel
2. **Create New Application**:
   - **App Root**: `/public_html/` (or your domain path)
   - **App URL**: `nomatoken.com`
   - **Node.js Version**: 18.x or higher
   - **Startup File**: `server.js`
   - **Environment**: `production`

3. **Install Dependencies**:
   ```bash
   npm install --only=production
   ```

4. **Set Environment Variables** in cPanel Node.js app settings:
   - Add all variables from `.env.production`
   - Ensure M-Pesa credentials are correct

#### 3.3 Start Application
1. **Click "Start App"** in cPanel Node.js interface
2. **Monitor logs** for any startup errors
3. **Test application** at https://nomatoken.com/

### Phase 4: M-Pesa Production Configuration

#### 4.1 Update Safaricom Developer Portal
1. **Login to Safaricom Developer Portal**
2. **Update your app configuration**:
   - **Callback URL**: `https://nomatoken.com/api/mpesa/payment/callback`
   - **Environment**: Switch to Production
   - **Get production credentials**

#### 4.2 Test M-Pesa Integration
```bash
# Test payment initiation endpoint
curl -X POST https://nomatoken.com/api/mpesa/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254XXXXXXXXX","amount":"100","accountReference":"NomaToken"}'

# Test callback endpoint
curl https://nomatoken.com/api/mpesa/payment/callback
```

### Phase 5: SSL and Security

#### 5.1 Verify SSL Certificate
- Ensure SSL covers your domain
- Test HTTPS redirect
- Verify certificate chain

#### 5.2 Security Headers (Add to server.js)
```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Application Won't Start
```bash
# Check Node.js version
node --version

# Check logs in cPanel
# Look for missing dependencies or environment variables
```

#### 2. M-Pesa Callbacks Not Working
- Verify callback URL in Safaricom portal
- Check SSL certificate validity
- Test endpoint accessibility

#### 3. Static Assets Not Loading
- Ensure public folder is uploaded
- Check file permissions
- Verify Next.js build completed successfully

### Monitoring and Logs:
- **cPanel Error Logs**: Monitor for application errors
- **Node.js App Logs**: Check startup and runtime logs
- **Access Logs**: Monitor traffic and API usage

## 📊 Performance Optimization

### Production Optimizations:
1. **Enable gzip compression** in cPanel
2. **Set up CDN** if available
3. **Monitor memory usage** in Node.js app
4. **Implement caching** for static assets

## 🚨 Backup Strategy

### Before Deployment:
1. **Backup current static site**
2. **Export database** (if any)
3. **Save environment variables**
4. **Document current configuration**

### Regular Backups:
1. **Automated backups** via cPanel
2. **Code repository** backup
3. **Environment variables** secure storage

## 📞 Go-Live Checklist

- [ ] Production build created successfully
- [ ] Files uploaded to cPanel
- [ ] Node.js app configured and started
- [ ] Environment variables set
- [ ] M-Pesa production credentials configured
- [ ] SSL certificate verified
- [ ] Payment flow tested end-to-end
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## 🎉 Next Steps

1. **Get M-Pesa production credentials** from Safaricom
2. **Run the build script** to create deployment package
3. **Upload and configure** in cPanel
4. **Test thoroughly** before announcing
5. **Monitor** payment flows and performance

Ready to proceed with the deployment?
