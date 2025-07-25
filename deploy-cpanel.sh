#!/bin/bash

# NomaToken DApp - cPanel Deployment Script
# This script prepares your app for cPanel deployment

echo "🚀 NomaToken DApp - cPanel Deployment Preparation"
echo "=================================================="

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

print_status "Node.js and npm are installed"

# Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the application
print_info "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Create deployment package
print_info "Creating deployment package..."

# Create deployment directory
mkdir -p deployment
cd deployment

# Copy necessary files for Node.js deployment
print_info "Preparing Node.js deployment files..."
cp -r ../.next ./
cp -r ../public ./
cp ../package.json ./
cp ../package-lock.json ./
cp ../server.js ./
cp ../.env.production ./.env

# Create a simple package.json for production
cat > package.json << EOF
{
  "name": "nomatoken-dapp",
  "version": "1.0.0",
  "description": "NomaToken DApp - Production Build",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "install:prod": "npm install --production"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

print_status "Node.js deployment package created in 'deployment' folder"

# Create static export if needed
cd ..
print_info "Creating static export..."

# Temporarily modify next.config.js for static export
cp next.config.js next.config.js.backup

cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  distDir: 'out'
};

module.exports = nextConfig;
EOF

# Build static export
npm run build

if [ $? -eq 0 ]; then
    print_status "Static export created successfully"
    
    # Copy static files to deployment
    mkdir -p deployment/static
    cp -r out/* deployment/static/
    
    # Copy .htaccess for static hosting
    cp public/.htaccess deployment/static/
    
    print_status "Static deployment package created in 'deployment/static' folder"
else
    print_error "Failed to create static export"
fi

# Restore original next.config.js
mv next.config.js.backup next.config.js

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << EOF
# NomaToken DApp - Deployment Instructions

## Option 1: Node.js Deployment (Recommended)

### Files to Upload:
- Upload all files from the 'deployment' folder (except 'static' subfolder)
- Upload to your domain's root directory or subdirectory

### cPanel Setup:
1. Go to "Node.js Apps" in cPanel
2. Create new application:
   - App Root: /public_html/nomatoken (or your chosen path)
   - App URL: yourdomain.com
   - Node.js Version: 18.x or higher
   - Startup File: server.js

3. Install dependencies:
   \`\`\`
   npm install --production
   \`\`\`

4. Start the application

### Environment Variables:
- Update .env file with your actual values
- Set environment variables in cPanel Node.js app settings

## Option 2: Static Hosting (Fallback)

### Files to Upload:
- Upload all files from the 'deployment/static' folder
- Upload to your public_html directory

### Setup:
1. Extract files to public_html
2. Ensure .htaccess is in place
3. Configure SSL certificate
4. Test the application

## Domain Configuration:
- Main domain: Upload to /public_html/
- Subdomain: Create subdomain first, then upload
- Subfolder: Upload to /public_html/yourfolder/

## SSL Setup:
1. Enable SSL in cPanel
2. Force HTTPS redirect
3. Install Let's Encrypt certificate

## Testing:
1. Visit your domain
2. Test wallet connection
3. Verify all animations work
4. Check mobile responsiveness

## Troubleshooting:
- Check error logs in cPanel
- Verify file permissions (755 for folders, 644 for files)
- Ensure all environment variables are set
- Contact hosting provider for Node.js support
EOF

# Create compression script
cat > deployment/compress-for-upload.sh << 'EOF'
#!/bin/bash
echo "Creating compressed archive for upload..."

# Create tar.gz for easy upload
tar -czf nomatoken-nodejs.tar.gz .next public package.json server.js .env
echo "✓ Node.js deployment: nomatoken-nodejs.tar.gz"

# Create zip for static files
cd static
zip -r ../nomatoken-static.zip .
cd ..
echo "✓ Static deployment: nomatoken-static.zip"

echo "Upload these files to your cPanel and extract them."
EOF

chmod +x deployment/compress-for-upload.sh

# Final summary
echo ""
echo "🎉 Deployment preparation complete!"
echo "=================================="
print_status "Node.js deployment files: deployment/ folder"
print_status "Static deployment files: deployment/static/ folder"
print_status "Instructions: deployment/DEPLOYMENT_INSTRUCTIONS.md"
print_warning "Remember to update .env.production with your actual values"
print_info "Next steps:"
echo "  1. Update environment variables in .env.production"
echo "  2. Choose deployment method (Node.js or Static)"
echo "  3. Upload files to your cPanel"
echo "  4. Follow the deployment instructions"
echo ""
print_info "For easy upload, run: cd deployment && ./compress-for-upload.sh"
