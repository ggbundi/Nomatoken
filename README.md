# 🪙 NomaToken DApp

A modern decentralized application (DApp) for NomaToken with integrated M-Pesa mobile money payments, built with Next.js 13.5.1 and TypeScript.

## ✨ Features

### 🔗 Blockchain Integration
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet
- **BSC Network**: Binance Smart Chain integration
- **Token Purchases**: Support for USDT, BUSD, BNB payments
- **Smart Contract Integration**: Token sale and NOMA token contracts

### 💳 Payment Methods
- **M-Pesa Integration**: STK Push payments via Safaricom API
- **Crypto Payments**: Direct blockchain transactions
- **Real-time Status**: Payment tracking and confirmation
- **Secure Callbacks**: Production-ready webhook handling

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Animations**: Coin animations and smooth transitions
- **Modern UI**: Radix UI components with custom styling
- **Dark/Light Theme**: Theme switching support
- **Accessibility**: WCAG compliant design

### 🔒 Security & Performance
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Secure cross-origin requests
- **SSL/HTTPS**: Production security headers
- **Error Handling**: Comprehensive error management

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ggbundi/Nomatoken.git
   cd Nomatoken
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Update with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📋 Environment Configuration

### Required Environment Variables

```env
# Reown AppKit Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# BSC Network Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
NEXT_PUBLIC_DEFAULT_CHAIN_ID=56

# M-Pesa Configuration (Sandbox/Production)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_short_code
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url

# Token Configuration
NOMA_TOKEN_PRICE=0.0245
MIN_PURCHASE_AMOUNT=1
MAX_PURCHASE_AMOUNT=1000
```

## 🛠️ Development

### Project Structure
```
├── app/                    # Next.js 13 App Router
│   ├── api/               # API routes
│   │   └── mpesa/         # M-Pesa integration
│   ├── demo/              # Demo pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── atoms/             # Basic UI components
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex components
│   └── ui/                # Radix UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── contracts/         # Smart contract ABIs
│   ├── services/          # API services
│   └── utils/             # Helper functions
├── public/                # Static assets
├── scripts/               # Development scripts
└── tests/                 # Test files
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests
npm run test:mpesa   # Test M-Pesa integration

# Deployment
npm run cpanel:build    # Build for cPanel
npm run cpanel:deploy   # Deploy to cPanel
./build-production.sh   # Create production package
```

## 💳 M-Pesa Integration

### Setup Guide

1. **Safaricom Developer Account**
   - Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
   - Create a new app for M-Pesa STK Push
   - Get sandbox credentials for testing

2. **Local Development with ngrok**
   ```bash
   # Install ngrok
   npm install -g ngrok

   # Run setup script
   ./scripts/setup-ngrok.sh

   # Start development server
   npm run dev
   ```

3. **Testing M-Pesa Payments**
   ```bash
   # Test payment initiation
   node scripts/test-mpesa-local.js
   ```

### API Endpoints

- `POST /api/mpesa/payment/initiate` - Initiate STK Push
- `POST /api/mpesa/payment/callback` - Payment callback
- `GET /api/mpesa/payment/status/:id` - Check payment status
- `POST /api/mpesa/auth/token` - Get access token

## 🚀 Production Deployment

### cPanel Node.js Deployment

1. **Build Production Package**
   ```bash
   ./build-production.sh
   ```

2. **Upload to cPanel**
   - Upload `nomatoken-production.tar.gz`
   - Extract to domain root directory

3. **Configure Node.js App**
   - Set startup file: `server.js`
   - Set Node.js version: 18.x+
   - Install dependencies: `npm install --only=production`

4. **Environment Variables**
   - Update `.env` with production credentials
   - Configure M-Pesa production settings

### Alternative Hosting

- **Vercel**: Full Next.js support with serverless functions
- **Netlify**: Static site with serverless functions
- **Railway**: Container-based deployment
- **DigitalOcean**: VPS with Docker

## 📚 Documentation

### Comprehensive Guides
- [📖 cPanel Node.js Deployment Guide](./CPANEL_NODEJS_DEPLOYMENT.md)
- [✅ Production Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [🔧 M-Pesa Integration Setup](./docs/mpesa-testing-guide.md)
- [🌐 ngrok Setup Guide](./docs/ngrok-setup-guide.md)
- [🧪 Local Testing Guide](./docs/local-testing-guide.md)

### API Documentation
- M-Pesa STK Push integration
- Blockchain transaction handling
- Wallet connection management
- Payment status tracking

## 🔧 Technology Stack

### Frontend
- **Next.js 13.5.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Serverless functions
- **Axios** - HTTP client for API calls
- **Zod** - Schema validation
- **Custom middleware** - Rate limiting, CORS, security

### Blockchain
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Reown AppKit** - Wallet connection library
- **Ethers.js** - Ethereum library

### Payments
- **Safaricom M-Pesa API** - Mobile money integration
- **STK Push** - Push payment notifications
- **Webhook handling** - Secure callback processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/ggbundi/Nomatoken/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ggbundi/Nomatoken/discussions)
- **Documentation**: Check the `/docs` folder

### Common Issues
- **M-Pesa Integration**: Check callback URL accessibility
- **Wallet Connection**: Verify network configuration
- **Build Errors**: Ensure Node.js 18.x+ is installed
- **Deployment**: Follow the production deployment checklist

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Additional payment methods
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] DeFi integrations
- [ ] NFT marketplace integration

---

**Built with ❤️ for the NomaToken community**

🌐 **Website**: [nomatoken.com](https://nomatoken.com)  
📧 **Contact**: [Your contact information]  
🐦 **Twitter**: [@nomatoken](https://twitter.com/nomatoken)
