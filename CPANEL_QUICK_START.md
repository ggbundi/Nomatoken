# 🚀 NomaToken DApp - cPanel Quick Start Guide

## 🔍 Step 1: Check Your Hosting Type

### Method A: Check cPanel Features
1. Log into your cPanel
2. Look for these sections:
   - **"Node.js"** or **"Node.js Apps"** → You can use Method 1 (Node.js)
   - **"File Manager"** only → Use Method 2 (Static)

### Method B: Contact Your Host
Ask your hosting provider:
- "Do you support Node.js applications?"
- "What Node.js versions are available?"
- "Can I run Next.js applications?"

## 🚀 Method 1: Node.js Deployment (Best Option)

### ✅ If your cPanel has Node.js support:

#### Step 1: Prepare Your App
```bash
# Run the deployment script
./deploy-cpanel.sh

# Or manually:
npm install
npm run build
```

#### Step 2: Upload Files
1. **Compress your app**:
   ```bash
   tar -czf nomatoken-app.tar.gz .next public package.json server.js .env.production node_modules
   ```

2. **Upload via cPanel File Manager**:
   - Go to File Manager
   - Navigate to `public_html` (or subdomain folder)
   - Upload the tar.gz file
   - Extract it

#### Step 3: Configure Node.js App
1. **Go to "Node.js Apps" in cPanel**
2. **Click "Create Application"**:
   - **App Root**: `/public_html/nomatoken`
   - **App URL**: `yourdomain.com` or `app.yourdomain.com`
   - **Node.js Version**: `18.x` or higher
   - **Application Mode**: `Production`
   - **Startup File**: `server.js`

3. **Install Dependencies**:
   ```bash
   npm install --production
   ```

4. **Set Environment Variables**:
   - Copy values from `.env.production`
   - Add them in the Node.js app settings

5. **Start Application**

## 🌐 Method 2: Static Export (Fallback)

### ✅ If your cPanel doesn't support Node.js:

#### Step 1: Build Static Version
```bash
# Update next.config.js to enable static export
npm run build
```

#### Step 2: Upload Static Files
1. **Build creates an 'out' folder**
2. **Zip the contents**:
   ```bash
   cd out
   zip -r ../nomatoken-static.zip .
   ```

3. **Upload to cPanel**:
   - Go to File Manager
   - Navigate to `public_html`
   - Upload and extract the zip file

4. **Copy .htaccess**:
   - Upload `public/.htaccess` to `public_html`

## ⚙️ Quick Configuration

### Environment Variables (.env.production)
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_WEB3_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_TOKEN_CONTRACT=0x...
```

### Domain Setup Options

#### Option 1: Main Domain
- Upload to: `/public_html/`
- Access via: `yourdomain.com`

#### Option 2: Subdomain
1. Create subdomain in cPanel: `app.yourdomain.com`
2. Upload to: `/public_html/app/`
3. Access via: `app.yourdomain.com`

#### Option 3: Subfolder
- Upload to: `/public_html/nomatoken/`
- Access via: `yourdomain.com/nomatoken`

## 🔒 SSL Setup (Important!)

### Enable HTTPS:
1. **Go to SSL/TLS in cPanel**
2. **Install Let's Encrypt** (free SSL)
3. **Enable "Force HTTPS Redirect"**
4. **Test**: Visit `https://yourdomain.com`

## 🧪 Testing Checklist

After deployment, test these features:
- [ ] Website loads correctly
- [ ] Wallet connection works
- [ ] Animations display properly
- [ ] Mobile responsiveness
- [ ] All pages accessible
- [ ] SSL certificate active
- [ ] No console errors

## 🚨 Common Issues & Quick Fixes

### Issue 1: "Node.js not supported"
**Solution**: Use static export method

### Issue 2: "Build errors"
**Solution**: 
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Issue 3: "Wallet connection fails"
**Solution**: Check environment variables and HTTPS

### Issue 4: "Animations not working"
**Solution**: Verify static files uploaded correctly

### Issue 5: "404 errors on refresh"
**Solution**: Ensure `.htaccess` is uploaded and configured

## 📞 Getting Help

### Check These First:
1. **Error Logs**: cPanel → Error Logs
2. **File Permissions**: 755 for folders, 644 for files
3. **Environment Variables**: All values set correctly
4. **SSL Certificate**: Properly installed and active

### Contact Support:
- **Your Hosting Provider**: For Node.js support questions
- **cPanel Documentation**: For specific cPanel features
- **Community Forums**: For deployment troubleshooting

## 🎯 Recommended Hosting Providers

If your current host doesn't support Node.js:

### Budget Options:
- **Hostinger** (Node.js support)
- **Namecheap** (Node.js on higher plans)
- **A2 Hosting** (Node.js support)

### Premium Options:
- **SiteGround** (Node.js support)
- **Cloudways** (Managed hosting)
- **DigitalOcean** (VPS with full control)

### Specialized for Next.js:
- **Vercel** (Best for Next.js, free tier)
- **Netlify** (Good for static exports)
- **Railway** (Easy deployment)

## ⚡ Performance Tips

### For Better Performance:
1. **Enable Compression** (gzip in .htaccess)
2. **Set Cache Headers** (browser caching)
3. **Optimize Images** (already configured)
4. **Use CDN** (Cloudflare free tier)
5. **Monitor Performance** (Google PageSpeed)

## 🔄 Updates & Maintenance

### To Update Your App:
1. **Make changes locally**
2. **Run build process**
3. **Upload changed files**
4. **Restart Node.js app** (if using Node.js method)

### Backup Strategy:
- **Regular backups** of your cPanel files
- **Database backups** (if using database)
- **Environment variables** backup
- **SSL certificates** backup

## 🎉 Success!

Once deployed successfully:
- **Share your DApp URL**
- **Test all functionality**
- **Monitor for any issues**
- **Collect user feedback**
- **Plan for scaling**

Your NomaToken DApp should now be live and accessible to users worldwide! 🚀
