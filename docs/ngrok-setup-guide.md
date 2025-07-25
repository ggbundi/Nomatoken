# ngrok Setup Guide for M-Pesa Integration

This guide provides step-by-step instructions for setting up ngrok to test M-Pesa callbacks in your NomaToken platform.

## Quick Start

### 1. Automated Setup (Recommended)

Run the automated setup script:

```bash
./scripts/setup-ngrok.sh
```

This script will:
- Check if ngrok is installed
- Install ngrok if needed
- Verify your development server is running
- Start the ngrok tunnel
- Provide next steps

### 2. Manual Setup

If you prefer manual setup, follow these steps:

## Step-by-Step Manual Setup

### Step 1: Install ngrok

**Option A: Using npm**
```bash
npm install -g ngrok
```

**Option B: Using package manager (Linux)**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

**Option C: Using Homebrew (macOS)**
```bash
brew install ngrok/ngrok/ngrok
```

### Step 2: Create ngrok Account (Optional)

1. Visit [https://ngrok.com/signup](https://ngrok.com/signup)
2. Create a free account
3. Get your auth token from the dashboard
4. Configure it:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Development Server

```bash
npm run dev
```

Ensure your server is running on `http://localhost:3000`

### Step 4: Start ngrok Tunnel

**Basic command:**
```bash
ngrok http 3000
```

**With region specification:**
```bash
ngrok http 3000 --region=us
```

**With custom subdomain (paid plan):**
```bash
ngrok http 3000 --subdomain=nomatoken-dev
```

### Step 5: Copy the ngrok URL

After starting ngrok, you'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)

### Step 6: Update Environment Configuration

Update your `.env.local` file:

```bash
# Replace the placeholder with your actual ngrok URL
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/payment/callback
```

**Important:** Replace `abc123.ngrok.io` with your actual ngrok URL.

### Step 7: Update Safaricom Developer Dashboard

1. **Log into Safaricom Developer Portal:**
   - Go to [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
   - Log in with your credentials

2. **Navigate to Your App:**
   - Go to "My Apps" → Select your sandbox app
   - Click on "Lipa Na M-Pesa Online" or "STK Push"

3. **Update Callback URLs:**
   - **Validation URL:** `https://abc123.ngrok.io/api/mpesa/payment/callback`
   - **Confirmation URL:** `https://abc123.ngrok.io/api/mpesa/payment/callback`

### Step 8: Test the Integration

Run the automated test suite:

```bash
npm run test:mpesa
```

Or test manually by visiting:
- `http://localhost:3000` - Your local app
- `https://abc123.ngrok.io` - Your app via ngrok
- `http://localhost:4040` - ngrok web interface

## Testing Checklist

- [ ] ngrok is installed and running
- [ ] Development server is running on port 3000
- [ ] ngrok tunnel is active and accessible
- [ ] `.env.local` updated with ngrok callback URL
- [ ] Safaricom dashboard updated with ngrok URLs
- [ ] Test payment initiation works
- [ ] Callback endpoint receives M-Pesa responses
- [ ] ngrok web interface shows incoming requests

## Common Issues and Solutions

### Issue: "ngrok not found"
**Solution:** Install ngrok using one of the methods above

### Issue: "Connection refused"
**Solution:** Make sure your development server is running with `npm run dev`

### Issue: "Callback not received"
**Solutions:**
- Verify ngrok URL is correct in `.env.local`
- Check Safaricom dashboard has the correct callback URL
- Ensure ngrok tunnel is still active
- Check ngrok web interface at `http://localhost:4040` for incoming requests

### Issue: "Invalid callback URL in Safaricom dashboard"
**Solution:** Make sure you're using the HTTPS URL from ngrok, not HTTP

### Issue: "ngrok tunnel expired"
**Solution:** Free ngrok tunnels expire after 2 hours. Restart ngrok and update URLs

## Advanced Configuration

### Custom ngrok Configuration File

Create `~/.ngrok2/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  nomatoken:
    proto: http
    addr: 3000
    subdomain: nomatoken-dev
    region: us
```

Start with:
```bash
ngrok start nomatoken
```

### Multiple Environments

For different environments, you can use different subdomains:
- Development: `nomatoken-dev.ngrok.io`
- Staging: `nomatoken-staging.ngrok.io`
- Testing: `nomatoken-test.ngrok.io`

## Security Considerations

- Never commit ngrok URLs to version control
- Use HTTPS URLs only for M-Pesa callbacks
- Monitor ngrok web interface for unexpected requests
- Rotate ngrok auth tokens regularly
- Use IP whitelisting if available in your ngrok plan

## Next Steps

After successful ngrok setup:

1. **Run comprehensive tests:** `npm run test:mpesa`
2. **Test different payment scenarios** using Safaricom test phone numbers
3. **Monitor callback logs** in your application
4. **Verify token purchase flow** works end-to-end
5. **Prepare for production deployment** with permanent callback URLs

## Support

If you encounter issues:
- Check the [M-Pesa Testing Guide](./mpesa-testing-guide.md)
- Review [Local Testing Guide](./local-testing-guide.md)
- Visit ngrok documentation: [https://ngrok.com/docs](https://ngrok.com/docs)
- Check Safaricom API docs: [https://developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
