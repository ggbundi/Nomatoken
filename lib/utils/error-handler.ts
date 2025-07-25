import { toast } from 'sonner';

export interface Web3Error {
  code: number;
  message: string;
  data?: any;
}

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
  severity: 'error' | 'warning' | 'info';
}

// Common Web3 error codes and their user-friendly messages
const ERROR_CODES: Record<string, ErrorInfo> = {
  // MetaMask/Wallet errors
  4001: {
    title: 'Transaction Rejected',
    message: 'You rejected the transaction in your wallet.',
    action: 'Please try again and approve the transaction.',
    severity: 'warning'
  },
  4100: {
    title: 'Unauthorized',
    message: 'The requested account is not authorized.',
    action: 'Please connect your wallet and try again.',
    severity: 'error'
  },
  4200: {
    title: 'Unsupported Method',
    message: 'Your wallet does not support this operation.',
    action: 'Please try using a different wallet.',
    severity: 'error'
  },
  4900: {
    title: 'Disconnected',
    message: 'Your wallet is disconnected.',
    action: 'Please reconnect your wallet and try again.',
    severity: 'error'
  },
  4901: {
    title: 'Chain Disconnected',
    message: 'Your wallet is not connected to the correct network.',
    action: 'Please switch to BSC network and try again.',
    severity: 'error'
  },
  
  // Network errors
  '-32000': {
    title: 'Insufficient Funds',
    message: 'You do not have enough funds to complete this transaction.',
    action: 'Please add more funds to your wallet.',
    severity: 'error'
  },
  '-32002': {
    title: 'Request Pending',
    message: 'A request is already pending in your wallet.',
    action: 'Please check your wallet and complete the pending request.',
    severity: 'warning'
  },
  '-32003': {
    title: 'Transaction Rejected',
    message: 'The transaction was rejected.',
    action: 'Please try again.',
    severity: 'warning'
  },
  '-32602': {
    title: 'Invalid Parameters',
    message: 'Invalid transaction parameters.',
    action: 'Please refresh the page and try again.',
    severity: 'error'
  },
  '-32603': {
    title: 'Internal Error',
    message: 'An internal error occurred.',
    action: 'Please try again later.',
    severity: 'error'
  }
};

// Common error message patterns
const ERROR_PATTERNS: Array<{ pattern: RegExp; info: ErrorInfo }> = [
  {
    pattern: /insufficient funds/i,
    info: {
      title: 'Insufficient Funds',
      message: 'You do not have enough funds for this transaction.',
      action: 'Please add more funds to your wallet.',
      severity: 'error'
    }
  },
  {
    pattern: /gas required exceeds allowance/i,
    info: {
      title: 'Gas Limit Exceeded',
      message: 'The transaction requires more gas than allowed.',
      action: 'Please try again with a higher gas limit.',
      severity: 'error'
    }
  },
  {
    pattern: /nonce too low/i,
    info: {
      title: 'Transaction Nonce Error',
      message: 'Transaction nonce is too low.',
      action: 'Please reset your wallet account and try again.',
      severity: 'error'
    }
  },
  {
    pattern: /replacement transaction underpriced/i,
    info: {
      title: 'Transaction Underpriced',
      message: 'The replacement transaction gas price is too low.',
      action: 'Please increase the gas price and try again.',
      severity: 'warning'
    }
  },
  {
    pattern: /execution reverted/i,
    info: {
      title: 'Transaction Failed',
      message: 'The smart contract execution was reverted.',
      action: 'Please check the transaction parameters and try again.',
      severity: 'error'
    }
  },
  {
    pattern: /network error/i,
    info: {
      title: 'Network Error',
      message: 'Unable to connect to the blockchain network.',
      action: 'Please check your internet connection and try again.',
      severity: 'error'
    }
  },
  {
    pattern: /timeout/i,
    info: {
      title: 'Request Timeout',
      message: 'The request timed out.',
      action: 'Please try again.',
      severity: 'warning'
    }
  }
];

export function parseWeb3Error(error: any): ErrorInfo {
  // Handle different error formats
  let errorCode: number | undefined;
  let errorMessage: string = '';

  if (error?.code) {
    errorCode = error.code;
  }

  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.reason) {
    errorMessage = error.reason;
  } else if (error?.data?.message) {
    errorMessage = error.data.message;
  }

  // Check for known error codes first
  if (errorCode && ERROR_CODES[errorCode.toString()]) {
    return ERROR_CODES[errorCode.toString()];
  }

  // Check for error message patterns
  for (const { pattern, info } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return info;
    }
  }

  // Default error info
  return {
    title: 'Transaction Failed',
    message: errorMessage || 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists.',
    severity: 'error'
  };
}

export function handleWeb3Error(error: any, customMessage?: string): void {
  console.error('Web3 Error:', error);
  
  const errorInfo = parseWeb3Error(error);
  
  const message = customMessage || errorInfo.message;
  const fullMessage = errorInfo.action 
    ? `${message} ${errorInfo.action}`
    : message;

  switch (errorInfo.severity) {
    case 'error':
      toast.error(fullMessage, {
        duration: 5000,
        description: errorInfo.title
      });
      break;
    case 'warning':
      toast.warning(fullMessage, {
        duration: 4000,
        description: errorInfo.title
      });
      break;
    case 'info':
      toast.info(fullMessage, {
        duration: 3000,
        description: errorInfo.title
      });
      break;
  }
}

export function isUserRejectedError(error: any): boolean {
  return error?.code === 4001 || 
         /user rejected/i.test(error?.message || '') ||
         /user denied/i.test(error?.message || '');
}

export function isInsufficientFundsError(error: any): boolean {
  return error?.code === -32000 ||
         /insufficient funds/i.test(error?.message || '');
}

export function isNetworkError(error: any): boolean {
  return /network error/i.test(error?.message || '') ||
         /failed to fetch/i.test(error?.message || '') ||
         error?.code === 'NETWORK_ERROR';
}

export function getErrorSeverity(error: any): 'error' | 'warning' | 'info' {
  if (isUserRejectedError(error)) {
    return 'warning';
  }
  
  if (isNetworkError(error)) {
    return 'error';
  }
  
  return parseWeb3Error(error).severity;
}

// Retry mechanism for failed transactions
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry user-rejected transactions
      if (isUserRejectedError(error)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}
