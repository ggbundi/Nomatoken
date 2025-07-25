"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react';
import { bsc } from '@reown/appkit/networks';
import { appKit, DEFAULT_CHAIN_ID, BSC_MAINNET, SUPPORTED_TOKENS } from '@/lib/web3-config';
import { getTokenBalance, TokenInfo } from '@/lib/contracts';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  isLoading: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  tokenBalances: Record<string, string>;
}

interface Web3ContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalances: () => Promise<void>;
  getSupportedTokens: () => TokenInfo[];
  purchaseTokens: (amount: string, paymentToken: string) => Promise<{ success: boolean; hash?: string; error?: string }>;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: '0',
  chainId: null,
  isLoading: false,
  provider: null,
  signer: null,
  tokenBalances: {},
};

type Web3Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: Partial<WalletState> }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'UPDATE_BALANCE'; payload: string }
  | { type: 'UPDATE_TOKEN_BALANCES'; payload: Record<string, string> }
  | { type: 'SET_PROVIDER'; payload: { provider: ethers.BrowserProvider | null; signer: ethers.Signer | null } };

function web3Reducer(state: WalletState, action: Web3Action): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_WALLET':
      return { ...state, ...action.payload };
    case 'DISCONNECT_WALLET':
      return { ...initialState };
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    case 'UPDATE_TOKEN_BALANCES':
      return { ...state, tokenBalances: action.payload };
    case 'SET_PROVIDER':
      return { ...state, provider: action.payload.provider, signer: action.payload.signer };
    default:
      return state;
  }
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Reown AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider('eip155');

  // Initialize provider and signer when wallet connects
  useEffect(() => {
    const initializeProvider = async () => {
      if (walletProvider && isConnected && (walletProvider as any)?.request) {
        try {
          const ethersProvider = new ethers.BrowserProvider(walletProvider as any);
          const signer = await ethersProvider.getSigner();

          dispatch({
            type: 'SET_PROVIDER',
            payload: { provider: ethersProvider, signer }
          });
        } catch (error) {
          console.error('Error initializing provider:', error);
        }
      } else {
        dispatch({
          type: 'SET_PROVIDER',
          payload: { provider: null, signer: null }
        });
      }
    };

    initializeProvider();
  }, [walletProvider, isConnected]);

  // Update wallet state when AppKit state changes
  useEffect(() => {
    dispatch({
      type: 'SET_WALLET',
      payload: {
        isConnected: isConnected || false,
        address: address || null,
        chainId: chainId ? Number(chainId) : null,
      }
    });
  }, [isConnected, address, chainId]);

  // Refresh balances when wallet connects or chain changes
  const refreshBalances = useCallback(async () => {
    if (!address || !state.provider) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get BNB balance
      const bnbBalance = await getTokenBalance('native', address, state.provider);
      dispatch({ type: 'UPDATE_BALANCE', payload: bnbBalance });

      // Get token balances
      const tokenBalances: Record<string, string> = {};
      for (const [symbol, token] of Object.entries(SUPPORTED_TOKENS)) {
        if (token.address !== 'native') {
          tokenBalances[symbol] = await getTokenBalance(token.address, address, state.provider);
        }
      }

      dispatch({ type: 'UPDATE_TOKEN_BALANCES', payload: tokenBalances });
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [address, state.provider]);

  useEffect(() => {
    if (isConnected && address && state.provider) {
      refreshBalances();
    }
  }, [isConnected, address, state.provider, refreshBalances]);

  const connectWallet = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await open();
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast.error('Failed to open wallet connection');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectWallet = async () => {
    try {
      await appKit.disconnect();
      dispatch({ type: 'DISCONNECT_WALLET' });
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (!state.provider) {
        toast.error('No wallet connected');
        return;
      }

      // Check if we're already on the target network
      if (chainId === targetChainId) {
        toast.success('Already on the correct network');
        return;
      }

      // Use AppKit to switch network
      await appKit.switchNetwork(bsc);
      toast.success('Network switched successfully');
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
    }
  };

  const getSupportedTokens = useCallback((): TokenInfo[] => {
    return Object.entries(SUPPORTED_TOKENS).map(([symbol, token]) => ({
      ...token,
      balance: symbol === 'BNB' ? state.balance : state.tokenBalances[symbol] || '0'
    }));
  }, [state.balance, state.tokenBalances]);

  const purchaseTokens = async (amount: string, paymentToken: string) => {
    if (!state.signer || !state.provider) {
      return { success: false, error: 'No wallet connected' };
    }

    try {
      // Import TokenService dynamically to avoid circular dependencies
      const { TokenService } = await import('@/lib/services/token-service');
      const tokenService = new TokenService(state.provider, state.signer);

      // Validate payment token
      if (!['BNB', 'USDC', 'USDT'].includes(paymentToken)) {
        return { success: false, error: 'Unsupported payment token' };
      }

      // Check if user is on correct network
      if (chainId !== DEFAULT_CHAIN_ID) {
        return { success: false, error: 'Please switch to BSC network' };
      }

      // Perform the purchase
      const result = await tokenService.purchaseTokens({
        amount,
        paymentToken: paymentToken as 'BNB' | 'USDC' | 'USDT'
      });

      // Refresh balances after successful purchase
      if (result.success) {
        setTimeout(() => {
          refreshBalances();
        }, 2000); // Wait 2 seconds for transaction to be mined
      }

      return result;
    } catch (error: any) {
      console.error('Purchase error:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  };

  const value: Web3ContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalances,
    getSupportedTokens,
    purchaseTokens,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Helper hook for checking if user is on correct network
export function useCorrectNetwork() {
  const { chainId, switchNetwork } = useWeb3();

  const isCorrectNetwork = chainId === DEFAULT_CHAIN_ID;

  const switchToCorrectNetwork = useCallback(async () => {
    if (!isCorrectNetwork) {
      await switchNetwork(DEFAULT_CHAIN_ID);
    }
  }, [isCorrectNetwork, switchNetwork]);

  return {
    isCorrectNetwork,
    switchToCorrectNetwork,
    currentChainId: chainId,
    targetChainId: DEFAULT_CHAIN_ID
  };
}