# 🚀 NomaToken Production Deployment Checklist

## 📋 Pre-Deployment Requirements

### 1. M-Pesa Production Setup
- [ ] **Safaricom Developer Account** - Production access approved
- [ ] **Production Credentials** - Consumer Key, Consumer Secret, Passkey obtained
- [ ] **Business Short Code** - Production short code assigned
- [ ] **Callback URL** - Configured to `https://nomatoken.com/api/mpesa/payment/callback`
- [ ] **Testing** - Sandbox integration tested and working

### 2. cPanel Hosting Verification
- [ ] **Node.js Support** - Confirmed cPanel supports Node.js 18.x+
- [ ] **SSL Certificate** - Valid SSL for nomatoken.com
- [ ] **Domain Access** - Full access to domain management
- [ ] **File Manager** - Access to upload and extract files
- [ ] **Backup** - Current site backed up

### 3. Smart Contract Deployment (If Applicable)
- [ ] **NOMA Token Contract** - Deployed to BSC Mainnet
- [ ] **Token Sale Contract** - Deployed and configured
- [ ] **Contract Addresses** - Updated in environment variables
- [ ] **Contract Verification** - Verified on BSCScan

## 🛠️ Deployment Process

### Step 1: Prepare Production Build
```bash
# Run the production build script
./build-production.sh
```

**Expected Output:**
- ✅ Dependencies installed
- ✅ Next.js application built
- ✅ Deployment package created
- ✅ Compressed archive: `nomatoken-production.tar.gz`

### Step 2: Configure Environment Variables
1. **Copy template**: `cp .env.production.template .env.production`
2. **Update M-Pesa credentials** with production values:
   ```env
   MPESA_CONSUMER_KEY=your_actual_production_key
   MPESA_CONSUMER_SECRET=your_actual_production_secret
   MPESA_BUSINESS_SHORT_CODE=your_actual_short_code
   MPESA_PASSKEY=your_actual_production_passkey
   ```
3. **Update contract addresses** if deployed
4. **Verify all URLs** point to https://nomatoken.com

### Step 3: Upload to cPanel
1. **Access cPanel File Manager**
2. **Navigate to domain root** (usually `public_html`)
3. **Upload** `nomatoken-production.tar.gz`
4. **Extract** the archive
5. **Set permissions**: 755 for folders, 644 for files

### Step 4: Configure Node.js Application
1. **Go to "Node.js Apps"** in cPanel
2. **Create New Application**:
   - **App Root**: `/public_html/` (or your domain path)
   - **App URL**: `nomatoken.com`
   - **Node.js Version**: 18.x or higher
   - **Startup File**: `server.js`
   - **Environment**: `production`

3. **Set Environment Variables** in cPanel:
   - Copy all variables from `.env.production`
   - Ensure sensitive data is properly secured

4. **Install Dependencies**:
   ```bash
   npm install --only=production
   ```

### Step 5: Start and Test Application
1. **Start Application** in cPanel Node.js interface
2. **Monitor startup logs** for errors
3. **Test basic functionality**:
   - [ ] Website loads at https://nomatoken.com
   - [ ] Wallet connection works
   - [ ] Navigation functions properly
   - [ ] Animations display correctly

## 🧪 Testing Checklist

### Frontend Testing
- [ ] **Homepage** - Loads correctly with animations
- [ ] **Wallet Connection** - MetaMask/WalletConnect works
- [ ] **Token Purchase Flow** - UI functions properly
- [ ] **Responsive Design** - Mobile and desktop views
- [ ] **SSL Certificate** - HTTPS working, no mixed content warnings

### M-Pesa Integration Testing
- [ ] **Payment Initiation** - Test with small amount
- [ ] **STK Push** - Verify push notification received
- [ ] **Payment Completion** - Confirm callback handling
- [ ] **Status Checking** - Verify payment status updates
- [ ] **Error Handling** - Test failed payment scenarios

### API Endpoints Testing
```bash
# Test M-Pesa auth endpoint
curl https://nomatoken.com/api/mpesa/auth/token

# Test payment initiation
curl -X POST https://nomatoken.com/api/mpesa/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254XXXXXXXXX","amount":"10","accountReference":"Test"}'

# Test callback endpoint
curl https://nomatoken.com/api/mpesa/payment/callback
```

### Performance Testing
- [ ] **Page Load Speed** - Under 3 seconds
- [ ] **API Response Times** - Under 2 seconds
- [ ] **Memory Usage** - Monitor in cPanel
- [ ] **Error Rates** - Check logs for errors

## 🔒 Security Verification

### SSL and HTTPS
- [ ] **SSL Certificate** - Valid and properly configured
- [ ] **HTTPS Redirect** - HTTP automatically redirects to HTTPS
- [ ] **Security Headers** - Verify security headers are set
- [ ] **Mixed Content** - No HTTP resources on HTTPS pages

### Environment Security
- [ ] **Environment Variables** - Sensitive data not exposed
- [ ] **API Keys** - Production keys properly secured
- [ ] **CORS Configuration** - Only allowed origins permitted
- [ ] **Rate Limiting** - M-Pesa rate limits configured

## 📊 Monitoring Setup

### Application Monitoring
- [ ] **Error Logging** - Monitor cPanel error logs
- [ ] **Access Logs** - Track traffic and usage
- [ ] **Performance Metrics** - Monitor response times
- [ ] **Uptime Monitoring** - Set up external monitoring

### M-Pesa Monitoring
- [ ] **Payment Success Rate** - Track successful payments
- [ ] **Callback Response Times** - Monitor callback performance
- [ ] **Error Rates** - Track failed payments and reasons
- [ ] **Transaction Volumes** - Monitor payment volumes

## 🚨 Rollback Plan

### If Issues Occur
1. **Immediate Actions**:
   - [ ] Stop Node.js application in cPanel
   - [ ] Restore previous static site backup
   - [ ] Update DNS if necessary

2. **Investigation**:
   - [ ] Check application logs
   - [ ] Verify environment variables
   - [ ] Test M-Pesa connectivity
   - [ ] Review recent changes

3. **Recovery**:
   - [ ] Fix identified issues
   - [ ] Test in staging environment
   - [ ] Redeploy with fixes

## 📞 Post-Deployment Actions

### Immediate (First 24 hours)
- [ ] **Monitor logs** continuously
- [ ] **Test all functionality** thoroughly
- [ ] **Check payment flows** with small amounts
- [ ] **Verify SSL certificate** validity
- [ ] **Monitor performance** metrics

### Short-term (First week)
- [ ] **User feedback** collection
- [ ] **Performance optimization** if needed
- [ ] **Security audit** completion
- [ ] **Backup verification** and testing

### Long-term (Ongoing)
- [ ] **Regular monitoring** setup
- [ ] **Automated backups** configuration
- [ ] **Security updates** planning
- [ ] **Performance reviews** monthly

## 🎉 Success Criteria

### Deployment Successful When:
- ✅ Website loads at https://nomatoken.com
- ✅ All frontend functionality works
- ✅ M-Pesa payments process successfully
- ✅ SSL certificate is valid
- ✅ No critical errors in logs
- ✅ Performance meets requirements
- ✅ Security measures are active

## 📞 Support Contacts

### Technical Support
- **cPanel Support**: Your hosting provider's support
- **Safaricom Developer Support**: For M-Pesa issues
- **SSL Certificate Support**: Your certificate provider

### Emergency Contacts
- **Domain Registrar**: For DNS issues
- **Hosting Provider**: For server issues
- **Development Team**: For application issues

---

**Ready for Production Deployment!** 🚀

Follow this checklist step by step to ensure a smooth deployment of your NomaToken application with full M-Pesa integration support.
