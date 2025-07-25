import React from 'react';
import { toast } from 'sonner';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface LoadingStep {
  id: string;
  message: string;
  estimatedDuration?: number;
}

class LoadingManager {
  private loadingStates: Map<string, LoadingState> = new Map();
  private listeners: Map<string, Set<(state: LoadingState) => void>> = new Map();
  private toastIds: Map<string, string | number> = new Map();

  // Set loading state for a specific operation
  setLoading(operationId: string, isLoading: boolean, message?: string, progress?: number): void {
    const state: LoadingState = { isLoading, message, progress };
    this.loadingStates.set(operationId, state);
    
    // Notify listeners
    const operationListeners = this.listeners.get(operationId);
    if (operationListeners) {
      operationListeners.forEach(listener => listener(state));
    }

    // Show/hide toast for long operations
    if (isLoading && message) {
      const toastId = toast.loading(message, {
        duration: Infinity,
        description: progress !== undefined ? `${Math.round(progress)}% complete` : undefined
      });
      this.toastIds.set(operationId, toastId);
    } else if (!isLoading) {
      const toastId = this.toastIds.get(operationId);
      if (toastId) {
        toast.dismiss(toastId);
        this.toastIds.delete(operationId);
      }
    }
  }

  // Get loading state for an operation
  getLoadingState(operationId: string): LoadingState {
    return this.loadingStates.get(operationId) || { isLoading: false };
  }

  // Check if any operation is loading
  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(state => state.isLoading);
  }

  // Subscribe to loading state changes
  subscribe(operationId: string, listener: (state: LoadingState) => void): () => void {
    if (!this.listeners.has(operationId)) {
      this.listeners.set(operationId, new Set());
    }
    
    this.listeners.get(operationId)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      const operationListeners = this.listeners.get(operationId);
      if (operationListeners) {
        operationListeners.delete(listener);
        if (operationListeners.size === 0) {
          this.listeners.delete(operationId);
        }
      }
    };
  }

  // Execute operation with loading state management
  async executeWithLoading<T>(
    operationId: string,
    operation: () => Promise<T>,
    message: string = 'Processing...'
  ): Promise<T> {
    try {
      this.setLoading(operationId, true, message);
      const result = await operation();
      this.setLoading(operationId, false);
      return result;
    } catch (error) {
      this.setLoading(operationId, false);
      throw error;
    }
  }

  // Execute multi-step operation with progress tracking
  async executeSteps<T>(
    operationId: string,
    steps: LoadingStep[],
    executor: (stepId: string, updateProgress: (progress: number) => void) => Promise<T>
  ): Promise<T> {
    try {
      let currentStep = 0;
      const totalSteps = steps.length;

      for (const step of steps) {
        const stepProgress = (currentStep / totalSteps) * 100;
        this.setLoading(operationId, true, step.message, stepProgress);

        const updateProgress = (progress: number) => {
          const overallProgress = ((currentStep + progress / 100) / totalSteps) * 100;
          this.setLoading(operationId, true, step.message, overallProgress);
        };

        await executor(step.id, updateProgress);
        currentStep++;
      }

      this.setLoading(operationId, false);
      return {} as T; // This should be handled by the executor
    } catch (error) {
      this.setLoading(operationId, false);
      throw error;
    }
  }

  // Clear all loading states
  clearAll(): void {
    // Dismiss all toasts
    this.toastIds.forEach(toastId => toast.dismiss(toastId));
    
    // Clear all states
    this.loadingStates.clear();
    this.listeners.clear();
    this.toastIds.clear();
  }

  // Clear specific operation
  clear(operationId: string): void {
    this.setLoading(operationId, false);
    this.loadingStates.delete(operationId);
    this.listeners.delete(operationId);
    
    const toastId = this.toastIds.get(operationId);
    if (toastId) {
      toast.dismiss(toastId);
      this.toastIds.delete(operationId);
    }
  }
}

// Export singleton instance
export const loadingManager = new LoadingManager();

// Common operation IDs
export const LOADING_OPERATIONS = {
  WALLET_CONNECT: 'wallet_connect',
  WALLET_DISCONNECT: 'wallet_disconnect',
  NETWORK_SWITCH: 'network_switch',
  TOKEN_APPROVE: 'token_approve',
  TOKEN_PURCHASE: 'token_purchase',
  BALANCE_REFRESH: 'balance_refresh',
  PRICE_FETCH: 'price_fetch',
  TRANSACTION_WAIT: 'transaction_wait'
} as const;

// React hook for using loading states
export function useLoadingState(operationId: string) {
  const [state, setState] = React.useState<LoadingState>(
    loadingManager.getLoadingState(operationId)
  );

  React.useEffect(() => {
    const unsubscribe = loadingManager.subscribe(operationId, setState);
    return unsubscribe;
  }, [operationId]);

  return state;
}

// Utility functions for common loading patterns
export const LoadingUtils = {
  // Show loading for wallet operations
  walletOperation: async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    return loadingManager.executeWithLoading(
      LOADING_OPERATIONS.WALLET_CONNECT,
      operation,
      `${operationName}...`
    );
  },

  // Show loading for transaction operations
  transactionOperation: async <T>(
    operation: () => Promise<T>,
    transactionType: string
  ): Promise<T> => {
    const steps: LoadingStep[] = [
      { id: 'prepare', message: `Preparing ${transactionType}...` },
      { id: 'sign', message: 'Please sign the transaction in your wallet...' },
      { id: 'broadcast', message: 'Broadcasting transaction...' },
      { id: 'confirm', message: 'Waiting for confirmation...' }
    ];

    return loadingManager.executeSteps(
      LOADING_OPERATIONS.TOKEN_PURCHASE,
      steps,
      async (stepId, updateProgress) => {
        switch (stepId) {
          case 'prepare':
            updateProgress(100);
            break;
          case 'sign':
            updateProgress(100);
            break;
          case 'broadcast':
            const result = await operation();
            updateProgress(100);
            return result;
          case 'confirm':
            updateProgress(100);
            break;
        }
        return {} as T;
      }
    );
  },

  // Show loading for data fetching
  dataOperation: async <T>(
    operation: () => Promise<T>,
    dataType: string
  ): Promise<T> => {
    return loadingManager.executeWithLoading(
      LOADING_OPERATIONS.PRICE_FETCH,
      operation,
      `Loading ${dataType}...`
    );
  }
};


