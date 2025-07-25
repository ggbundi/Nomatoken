import { ethers } from 'ethers';
import {
  getTokenBalance,
  getTokenAllowance,
  approveToken,
  purchaseTokensWithBNB,
  purchaseTokensWithToken,
  getTokenSaleContract,
  getERC20Contract,
  TransactionResult
} from '../contracts';
import { CONTRACTS, SUPPORTED_TOKENS, TOKEN_SALE_CONFIG } from '../web3-config';
import { priceService } from './price-service';
import { handleWeb3Error, retryOperation } from '../utils/error-handler';
import { loadingManager, LOADING_OPERATIONS, LoadingUtils } from '../utils/loading-manager';
import { toast } from 'sonner';

export interface TokenPurchaseParams {
  amount: string; // USD amount
  paymentToken: 'BNB' | 'USDC' | 'USDT';
  slippage?: number; // percentage (default 1%)
}

export interface TokenPurchaseResult {
  success: boolean;
  hash?: string;
  error?: string;
  tokensReceived?: string;
}

export interface TokenSaleInfo {
  tokenPrice: string;
  totalSold: string;
  saleActive: boolean;
  minPurchase: string;
  maxPurchase: string;
  userPurchases: string;
}

export class TokenService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Get token sale information
  async getTokenSaleInfo(userAddress?: string): Promise<TokenSaleInfo> {
    try {
      const contract = getTokenSaleContract(this.provider);
      
      const [tokenPrice, totalSold, saleActive, minPurchase, maxPurchase] = await Promise.all([
        contract.tokenPrice(),
        contract.totalSold(),
        contract.saleActive(),
        contract.minPurchase(),
        contract.maxPurchase()
      ]);

      let userPurchases = '0';
      if (userAddress) {
        userPurchases = await contract.userPurchases(userAddress);
      }

      return {
        tokenPrice: ethers.formatEther(tokenPrice),
        totalSold: ethers.formatEther(totalSold),
        saleActive,
        minPurchase: ethers.formatEther(minPurchase),
        maxPurchase: ethers.formatEther(maxPurchase),
        userPurchases: ethers.formatEther(userPurchases)
      };
    } catch (error) {
      console.error('Error getting token sale info:', error);
      return {
        tokenPrice: TOKEN_SALE_CONFIG.tokenPrice,
        totalSold: '0',
        saleActive: true,
        minPurchase: TOKEN_SALE_CONFIG.minPurchase,
        maxPurchase: TOKEN_SALE_CONFIG.maxPurchase,
        userPurchases: '0'
      };
    }
  }

  // Calculate token amount from USD
  calculateTokenAmount(usdAmount: string, tokenPrice: string): string {
    try {
      const usd = parseFloat(usdAmount);
      const price = parseFloat(tokenPrice);
      if (price === 0) return '0';
      return (usd / price).toFixed(0);
    } catch {
      return '0';
    }
  }

  // Calculate required payment token amount
  async calculatePaymentAmount(
    usdAmount: string,
    paymentToken: 'BNB' | 'USDC' | 'USDT'
  ): Promise<string> {
    try {
      if (paymentToken === 'USDT' || paymentToken === 'USDC') {
        // For stablecoins, 1:1 with USD
        return usdAmount;
      } else if (paymentToken === 'BNB') {
        // Get real-time BNB price
        const tokenPrice = await priceService.getTokenPrice('BNB');
        const bnbPrice = tokenPrice?.price || 300; // Fallback to $300
        const usd = parseFloat(usdAmount);
        return (usd / bnbPrice).toFixed(6);
      }
      return '0';
    } catch {
      return '0';
    }
  }

  // Check if user has sufficient balance
  async checkSufficientBalance(
    userAddress: string,
    amount: string,
    paymentToken: 'BNB' | 'USDC' | 'USDT'
  ): Promise<boolean> {
    try {
      const tokenInfo = SUPPORTED_TOKENS[paymentToken];
      const balance = await getTokenBalance(tokenInfo.address, userAddress, this.provider);
      return parseFloat(balance) >= parseFloat(amount);
    } catch {
      return false;
    }
  }

  // Check and approve token if needed
  async checkAndApproveToken(
    userAddress: string,
    amount: string,
    paymentToken: 'USDC' | 'USDT'
  ): Promise<TransactionResult> {
    if (!this.signer) {
      return { success: false, hash: '', error: 'No signer available' };
    }

    try {
      const tokenInfo = SUPPORTED_TOKENS[paymentToken];
      const allowance = await getTokenAllowance(
        tokenInfo.address,
        userAddress,
        CONTRACTS.TOKEN_SALE,
        this.provider
      );

      if (parseFloat(allowance) >= parseFloat(amount)) {
        return { success: true, hash: '' }; // Already approved
      }

      // Need to approve
      toast.info('Approving token spend...');
      return await approveToken(tokenInfo.address, CONTRACTS.TOKEN_SALE, amount, this.signer);
    } catch (error: any) {
      return { success: false, hash: '', error: error.message };
    }
  }

  // Purchase tokens with BNB
  async purchaseWithBNB(params: TokenPurchaseParams): Promise<TokenPurchaseResult> {
    if (!this.signer) {
      return { success: false, error: 'No wallet connected' };
    }

    return LoadingUtils.transactionOperation(async () => {
      try {
        const paymentAmount = await this.calculatePaymentAmount(params.amount, 'BNB');
        const userAddress = await this.signer!.getAddress();

        // Check balance
        const hasSufficientBalance = await this.checkSufficientBalance(
          userAddress,
          paymentAmount,
          'BNB'
        );

        if (!hasSufficientBalance) {
          throw new Error('Insufficient BNB balance');
        }

        const result = await retryOperation(
          () => purchaseTokensWithBNB(paymentAmount, this.signer!),
          2 // Retry up to 2 times
        );

        if (result.success) {
          const tokensReceived = this.calculateTokenAmount(params.amount, TOKEN_SALE_CONFIG.tokenPrice);
          toast.success(`Successfully purchased ${tokensReceived} NOMA tokens!`);
          return {
            success: true,
            hash: result.hash,
            tokensReceived
          };
        } else {
          throw new Error(result.error || 'Purchase failed');
        }
      } catch (error: any) {
        handleWeb3Error(error, 'Failed to purchase tokens with BNB');
        return { success: false, error: error.message || 'Purchase failed' };
      }
    }, 'BNB token purchase');
  }

  // Purchase tokens with ERC20 token (USDC/USDT)
  async purchaseWithToken(params: TokenPurchaseParams): Promise<TokenPurchaseResult> {
    if (!this.signer || (params.paymentToken !== 'USDT' && params.paymentToken !== 'USDC')) {
      return { success: false, error: 'Invalid payment token or no wallet connected' };
    }

    return LoadingUtils.transactionOperation(async () => {
      try {
        const paymentAmount = await this.calculatePaymentAmount(params.amount, params.paymentToken);
        const userAddress = await this.signer!.getAddress();
        const tokenInfo = SUPPORTED_TOKENS[params.paymentToken];

        // Check balance
        const hasSufficientBalance = await this.checkSufficientBalance(
          userAddress,
          paymentAmount,
          params.paymentToken
        );

        if (!hasSufficientBalance) {
          throw new Error(`Insufficient ${params.paymentToken} balance`);
        }

        // Check and approve token (only for ERC20 tokens, not BNB)
        if (params.paymentToken !== 'BNB') {
          const approvalResult = await retryOperation(
            () => this.checkAndApproveToken(userAddress, paymentAmount, params.paymentToken as 'USDC' | 'USDT'),
            2
          );

          if (!approvalResult.success) {
            throw new Error(approvalResult.error || 'Token approval failed');
          }

          if (approvalResult.hash) {
            toast.success('Token approved successfully!');
          }
        }

        const result = await retryOperation(
          () => purchaseTokensWithToken(tokenInfo.address, paymentAmount, this.signer!),
          2
        );

        if (result.success) {
          const tokensReceived = this.calculateTokenAmount(params.amount, TOKEN_SALE_CONFIG.tokenPrice);
          toast.success(`Successfully purchased ${tokensReceived} NOMA tokens!`);
          return {
            success: true,
            hash: result.hash,
            tokensReceived
          };
        } else {
          throw new Error(result.error || 'Purchase failed');
        }
      } catch (error: any) {
        handleWeb3Error(error, `Failed to purchase tokens with ${params.paymentToken}`);
        return { success: false, error: error.message || 'Purchase failed' };
      }
    }, `${params.paymentToken} token purchase`);
  }

  // Main purchase method
  async purchaseTokens(params: TokenPurchaseParams): Promise<TokenPurchaseResult> {
    if (params.paymentToken === 'BNB') {
      return this.purchaseWithBNB(params);
    } else {
      return this.purchaseWithToken(params);
    }
  }

  // Get user's token balances
  async getUserTokenBalances(userAddress: string): Promise<Record<string, string>> {
    const balances: Record<string, string> = {};
    
    for (const [symbol, token] of Object.entries(SUPPORTED_TOKENS)) {
      try {
        balances[symbol] = await getTokenBalance(token.address, userAddress, this.provider);
      } catch {
        balances[symbol] = '0';
      }
    }

    return balances;
  }
}
