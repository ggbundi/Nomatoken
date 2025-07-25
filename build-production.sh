#!/bin/bash

# NomaToken Production Build Script for cPanel Node.js Deployment
# This script prepares your app for production deployment

echo "🚀 NomaToken Production Build for cPanel Node.js"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_info "Node.js version: $(node --version)"
print_info "npm version: $(npm --version)"

# Clean previous builds
print_info "Cleaning previous builds..."
rm -rf .next
rm -rf deployment
rm -f nomatoken-production.tar.gz

# Install dependencies
print_info "Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Dependencies installed successfully"

# Update Next.js config for production
print_info "Updating Next.js configuration for production..."

# Backup original config
cp next.config.js next.config.js.backup

# Create production config
cat > next.config.js << 'EOF'
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
  // Ensure API routes work in production
  experimental: {
    serverComponentsExternalPackages: ['axios']
  }
};

module.exports = nextConfig;
EOF

print_status "Next.js configuration updated for production"

# Build the application
print_info "Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    # Restore original config
    mv next.config.js.backup next.config.js
    exit 1
fi

print_status "Application built successfully"

# Create deployment directory
print_info "Creating deployment package..."
mkdir -p deployment

# Copy necessary files for production
print_info "Copying production files..."
cp -r .next deployment/ 2>/dev/null || print_warning ".next folder not found - build may have failed"
cp -r public deployment/
cp server.js deployment/
cp package.json deployment/package.json.original

# Verify .next folder was copied
if [ ! -d "deployment/.next" ]; then
    print_error ".next folder missing from deployment"
    print_info "Attempting to copy .next folder again..."
    if [ -d ".next" ]; then
        cp -r .next deployment/
        print_status ".next folder copied successfully"
    else
        print_error ".next folder not found in project root"
        exit 1
    fi
fi

# Create optimized production package.json
cat > deployment/package.json << 'EOF'
{
  "name": "nomatoken-production",
  "version": "1.0.0",
  "description": "NomaToken DApp - Production Deployment",
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
    "zod": "^3.25.76",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.446.0",
    "tailwind-merge": "^2.5.2",
    "sonner": "^1.5.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Create production environment template
cat > deployment/.env.template << 'EOF'
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

# M-Pesa Production Configuration (UPDATE THESE WITH YOUR ACTUAL CREDENTIALS)
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
EOF

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# NomaToken cPanel Node.js Deployment Instructions

## 📋 Pre-deployment Checklist
- [ ] M-Pesa production credentials obtained from Safaricom
- [ ] SSL certificate configured for nomatoken.com
- [ ] cPanel Node.js support confirmed
- [ ] Backup of current site created

## 🚀 Deployment Steps

### 1. Upload Files
1. Compress this deployment folder: `tar -czf nomatoken-production.tar.gz .`
2. Upload to cPanel File Manager
3. Extract to your domain's root directory (usually public_html)

### 2. Configure Environment Variables
1. Copy `.env.template` to `.env`
2. Update all M-Pesa credentials with your production values
3. Verify all URLs point to https://nomatoken.com

### 3. Set up Node.js App in cPanel
1. Go to "Node.js Apps" in cPanel
2. Create new application:
   - App Root: /public_html/ (or your domain path)
   - App URL: nomatoken.com
   - Node.js Version: 18.x or higher
   - Startup File: server.js
   - Environment: production

### 4. Install Dependencies
```bash
npm install --only=production
```

### 5. Start Application
Click "Start App" in cPanel Node.js interface

### 6. Test Deployment
- Visit https://nomatoken.com
- Test wallet connection
- Test M-Pesa payment flow
- Verify all functionality

## 🔧 Troubleshooting
- Check Node.js app logs in cPanel
- Verify environment variables are set
- Ensure SSL certificate is valid
- Test API endpoints individually

## 📞 Support
If you encounter issues, check the logs and verify all environment variables are correctly set.
EOF

print_status "Deployment package created successfully"

# Create compressed archive
print_info "Creating compressed archive..."
cd deployment
tar -czf ../nomatoken-production.tar.gz .
cd ..

print_status "Compressed archive created: nomatoken-production.tar.gz"

# Restore original Next.js config
mv next.config.js.backup next.config.js
print_status "Original Next.js configuration restored"

# Final summary
echo ""
echo "🎉 Production build complete!"
echo "============================="
print_status "Deployment files: deployment/ folder"
print_status "Compressed archive: nomatoken-production.tar.gz"
print_status "Instructions: deployment/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
print_warning "IMPORTANT: Update .env file with your actual M-Pesa production credentials"
echo ""
print_info "Next steps:"
echo "  1. Get M-Pesa production credentials from Safaricom"
echo "  2. Upload nomatoken-production.tar.gz to cPanel"
echo "  3. Extract and configure Node.js app"
echo "  4. Update environment variables"
echo "  5. Start the application"
echo ""
print_info "Ready for cPanel deployment! 🚀"
