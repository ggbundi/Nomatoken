import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { bsc, bscTestnet } from '@reown/appkit/networks'

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set')
}

// Network configurations
export const BSC_MAINNET = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/'
}

export const BSC_TESTNET = {
  chainId: 97,
  name: 'BNB Smart Chain Testnet',
  currency: 'tBNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'
}

// Contract addresses
export const CONTRACTS = {
  NOMA_TOKEN: process.env.NEXT_PUBLIC_NOMA_TOKEN_CONTRACT || '0x0000000000000000000000000000000000000000',
  TOKEN_SALE: process.env.NEXT_PUBLIC_TOKEN_SALE_CONTRACT || '0x0000000000000000000000000000000000000000',
  USDC: process.env.NEXT_PUBLIC_USDC_CONTRACT || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT || '0x55d398326f99059fF775485246999027B3197955'
}

// Token configurations
export const SUPPORTED_TOKENS = {
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    address: 'native',
    icon: '/icons/bnb.svg'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    address: CONTRACTS.USDC,
    icon: '/icons/usdc.svg'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    address: CONTRACTS.USDT,
    icon: '/icons/usdt.svg'
  }
}

// Create the networks array - ensure we always have at least BSC mainnet
const networks = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true'
  ? [bsc, bscTestnet]
  : [bsc]

// Create Ethers adapter
const ethersAdapter = new EthersAdapter()

// App metadata
const metadata = {
  name: 'NOMA Token',
  description: 'Revolutionary Real Estate Tokenization Platform',
  url: 'https://nomatoken.com',
  icons: ['/assets/NOMA CHAIN LOGO Compressed.svg']
}

// Create and configure AppKit
export const appKit = createAppKit({
  adapters: [ethersAdapter],
  networks: networks as [typeof bsc, ...typeof networks],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: ['google', 'github', 'apple', 'facebook', 'x'],
    emailShowWallets: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#10B981',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#10B981',
    '--w3m-border-radius-master': '12px'
  }
})

// Default chain ID
export const DEFAULT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '56')

// Gas settings
export const GAS_SETTINGS = {
  gasLimit: 300000,
  maxFeePerGas: '20000000000', // 20 gwei
  maxPriorityFeePerGas: '2000000000' // 2 gwei
}

// Token sale configuration
export const TOKEN_SALE_CONFIG = {
  tokenPrice: '0.0245', // $0.0245 per token
  minPurchase: '10', // $10 minimum
  maxPurchase: '10000', // $10,000 maximum
  networkFee: '2.5' // $2.50 network fee
}
