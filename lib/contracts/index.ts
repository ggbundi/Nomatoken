import { ethers } from 'ethers'
import { ERC20_ABI, TOKEN_SALE_ABI, NOMA_TOKEN_ABI } from './abis'
import { CONTRACTS, SUPPORTED_TOKENS } from '../web3-config'

export interface TokenInfo {
  symbol: string
  name: string
  decimals: number
  address: string
  balance?: string
  allowance?: string
}

export interface PurchaseParams {
  amount: string
  paymentToken: 'BNB' | 'USDC' | 'USDT'
  recipient?: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

// Contract factory functions
export function getERC20Contract(address: string, signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(address, ERC20_ABI, signerOrProvider)
}

export function getTokenSaleContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACTS.TOKEN_SALE, TOKEN_SALE_ABI, signerOrProvider)
}

export function getNomaTokenContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACTS.NOMA_TOKEN, NOMA_TOKEN_ABI, signerOrProvider)
}

// Token utility functions
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    if (tokenAddress === 'native') {
      const balance = await provider.getBalance(userAddress)
      return ethers.formatEther(balance)
    } else {
      const contract = getERC20Contract(tokenAddress, provider)
      const balance = await contract.balanceOf(userAddress)
      const decimals = await contract.decimals()
      return ethers.formatUnits(balance, decimals)
    }
  } catch (error) {
    console.error('Error getting token balance:', error)
    return '0'
  }
}

export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    if (tokenAddress === 'native') {
      return ethers.MaxUint256.toString() // Native token doesn't need allowance
    }
    
    const contract = getERC20Contract(tokenAddress, provider)
    const allowance = await contract.allowance(ownerAddress, spenderAddress)
    const decimals = await contract.decimals()
    return ethers.formatUnits(allowance, decimals)
  } catch (error) {
    console.error('Error getting token allowance:', error)
    return '0'
  }
}

export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: ethers.Signer
): Promise<TransactionResult> {
  try {
    const contract = getERC20Contract(tokenAddress, signer)
    const decimals = await contract.decimals()
    const amountWei = ethers.parseUnits(amount, decimals)
    
    const tx = await contract.approve(spenderAddress, amountWei)
    await tx.wait()
    
    return {
      hash: tx.hash,
      success: true
    }
  } catch (error: any) {
    console.error('Error approving token:', error)
    return {
      hash: '',
      success: false,
      error: error.message || 'Failed to approve token'
    }
  }
}

// Token purchase functions
export async function purchaseTokensWithBNB(
  amount: string,
  signer: ethers.Signer
): Promise<TransactionResult> {
  try {
    const contract = getTokenSaleContract(signer)
    const amountWei = ethers.parseEther(amount)
    
    const tx = await contract.buyTokensWithBNB({ value: amountWei })
    await tx.wait()
    
    return {
      hash: tx.hash,
      success: true
    }
  } catch (error: any) {
    console.error('Error purchasing tokens with BNB:', error)
    return {
      hash: '',
      success: false,
      error: error.message || 'Failed to purchase tokens'
    }
  }
}

export async function purchaseTokensWithToken(
  tokenAddress: string,
  amount: string,
  signer: ethers.Signer
): Promise<TransactionResult> {
  try {
    const contract = getTokenSaleContract(signer)
    const tokenContract = getERC20Contract(tokenAddress, signer)
    const decimals = await tokenContract.decimals()
    const amountWei = ethers.parseUnits(amount, decimals)
    
    const tx = await contract.buyTokensWithToken(tokenAddress, amountWei)
    await tx.wait()
    
    return {
      hash: tx.hash,
      success: true
    }
  } catch (error: any) {
    console.error('Error purchasing tokens with token:', error)
    return {
      hash: '',
      success: false,
      error: error.message || 'Failed to purchase tokens'
    }
  }
}

// Utility functions
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  try {
    const num = parseFloat(amount)
    if (num === 0) return '0'
    if (num < 0.0001) return '< 0.0001'
    if (num < 1) return num.toFixed(6)
    if (num < 1000) return num.toFixed(4)
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K'
    return (num / 1000000).toFixed(2) + 'M'
  } catch {
    return '0'
  }
}

export function calculateTokensFromUSD(usdAmount: string, tokenPrice: string): string {
  try {
    const usd = parseFloat(usdAmount)
    const price = parseFloat(tokenPrice)
    if (price === 0) return '0'
    return (usd / price).toFixed(0)
  } catch {
    return '0'
  }
}

export function calculateUSDFromTokens(tokenAmount: string, tokenPrice: string): string {
  try {
    const tokens = parseFloat(tokenAmount)
    const price = parseFloat(tokenPrice)
    return (tokens * price).toFixed(2)
  } catch {
    return '0'
  }
}
