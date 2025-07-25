# NomaToken DApp cPanel Deployment Guide

## 🔍 Step 1: Check Your Hosting Capabilities

### Check if your cPanel supports:
1. **Node.js Applications** (Required for Next.js)
2. **Static File Hosting** (Alternative approach)
3. **Custom Domains** and **SSL Certificates**

### How to Check:
- Log into your cPanel
- Look for "Node.js" or "Node.js Apps" in the software section
- Check if you see "App Manager" or similar tools
- Contact your hosting provider to confirm Node.js support

## 🚀 Method 1: Node.js Deployment (Recommended)

### Prerequisites:
- cPanel with Node.js support
- SSH access (preferred) or File Manager
- Domain/subdomain configured

### Step 1: Prepare Your Application

```bash
# In your local project directory
npm run build
npm run export  # If using static export
```

### Step 2: Create Production Build

```bash
# Create optimized production build
npm run build

# Test locally first
npm start
```

### Step 3: Upload to cPanel

#### Option A: Using SSH (Recommended)
```bash
# Compress your project
tar -czf nomatoken-app.tar.gz .

# Upload via SCP
scp nomatoken-app.tar.gz username@yourserver.com:~/

# SSH into server
ssh username@yourserver.com

# Extract files
tar -xzf nomatoken-app.tar.gz
```

#### Option B: Using File Manager
1. Compress your project folder locally
2. Upload via cPanel File Manager
3. Extract in your domain's public folder

### Step 4: Configure Node.js App in cPanel

1. **Go to Node.js Apps** in cPanel
2. **Create New App**:
   - App Root: `/public_html/nomatoken` (or your preferred path)
   - App URL: `yourdomain.com` or subdomain
   - Node.js Version: 18.x or higher
   - Application Mode: Production
   - Startup File: `server.js` or `next start`

3. **Install Dependencies**:
```bash
npm install --production
```

4. **Start Application**

## 🌐 Method 2: Static Export (Easier Alternative)

If your cPanel doesn't support Node.js, you can export as static files:

### Step 1: Configure Next.js for Static Export

Create/update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
```

### Step 2: Build Static Version

```bash
# Build and export static files
npm run build

# This creates an 'out' folder with static files
```

### Step 3: Upload Static Files

1. **Zip the 'out' folder contents**
2. **Upload to cPanel File Manager**
3. **Extract to public_html** (or subdomain folder)
4. **Set up redirects** if needed

## ⚙️ Method 3: Custom Server Setup

If you need full Next.js features, create a custom server:

### Create `server.js`:
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### Update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "export": "next export"
  }
}
```

## 🔧 Environment Configuration

### Create `.env.production`:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WEB3_PROJECT_ID=your_project_id
NODE_ENV=production
```

### Update Web3 Configuration:
```typescript
// lib/web3-config.ts
const projectId = process.env.NEXT_PUBLIC_WEB3_PROJECT_ID || 'your_project_id'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
```

## 📁 File Structure for cPanel

```
public_html/
├── nomatoken/           # Your app folder
│   ├── .next/          # Built files
│   ├── public/         # Static assets
│   ├── node_modules/   # Dependencies
│   ├── package.json
│   ├── server.js       # Custom server
│   └── .env.production
└── .htaccess           # Apache configuration
```

## 🌐 Domain Configuration

### Option 1: Main Domain
- Upload to `/public_html/`
- Access via `yourdomain.com`

### Option 2: Subdomain
1. Create subdomain in cPanel (e.g., `app.yourdomain.com`)
2. Upload to `/public_html/app/`
3. Access via subdomain

### Option 3: Subfolder
- Upload to `/public_html/nomatoken/`
- Access via `yourdomain.com/nomatoken`

## 🔒 SSL Configuration

### Enable SSL in cPanel:
1. Go to **SSL/TLS** section
2. Enable **Force HTTPS Redirect**
3. Install **Let's Encrypt** certificate (free)

### Update Next.js for HTTPS:
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}
```

## 🚨 Common Issues & Solutions

### Issue 1: Node.js Not Available
**Solution**: Use static export method or upgrade hosting plan

### Issue 2: Build Errors
**Solution**: 
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Issue 3: Environment Variables
**Solution**: Create `.env.production` file with all required variables

### Issue 4: Routing Issues
**Solution**: Add `.htaccess` for Apache:
```apache
RewriteEngine On
RewriteRule ^(.*)$ /index.html [QSA,L]
```

### Issue 5: Large File Uploads
**Solution**: 
- Use FTP/SFTP for large files
- Compress before uploading
- Upload in chunks

## 📊 Performance Optimization

### 1. Optimize Images:
```bash
# Install sharp for better image optimization
npm install sharp
```

### 2. Enable Compression:
```apache
# .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 3. Cache Headers:
```apache
# .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## ✅ Deployment Checklist

- [ ] Check cPanel Node.js support
- [ ] Prepare production build
- [ ] Configure environment variables
- [ ] Upload files to server
- [ ] Set up domain/subdomain
- [ ] Configure SSL certificate
- [ ] Test all functionality
- [ ] Set up monitoring/analytics
- [ ] Configure backups

## 🔄 Continuous Deployment

### Option 1: Manual Updates
1. Build locally
2. Upload changed files
3. Restart Node.js app

### Option 2: Git Integration
```bash
# If cPanel supports Git
git clone your-repo
cd your-repo
npm install
npm run build
npm start
```

## 📞 Getting Help

### Contact Your Hosting Provider:
- Ask about Node.js support
- Request SSH access
- Inquire about deployment assistance

### Alternative Hosting Options:
- **Vercel** (Recommended for Next.js)
- **Netlify** (Good for static exports)
- **DigitalOcean App Platform**
- **Railway** or **Render**

## 🎯 Recommended Approach

1. **Try Node.js deployment first** (if supported)
2. **Fall back to static export** if Node.js unavailable
3. **Consider upgrading hosting** if neither works
4. **Use Vercel as alternative** for best Next.js experience
