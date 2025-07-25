"use client"

import { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/atoms/loading-spinner';
import { useWeb3, useCorrectNetwork } from '@/components/providers/web3-provider';
import { BSC_MAINNET } from '@/lib/web3-config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function WalletConnectionButton() {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    getSupportedTokens
  } = useWeb3();

  const { isCorrectNetwork, switchToCorrectNetwork } = useCorrectNetwork();
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});

  // Update token balances when supported tokens change
  useEffect(() => {
    const tokens = getSupportedTokens();
    const balances: Record<string, string> = {};
    tokens.forEach(token => {
      balances[token.symbol] = token.balance || '0';
    });
    setTokenBalances(balances);
  }, [getSupportedTokens]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshBalances = async () => {
    try {
      await refreshBalances();
      toast.success('Balances refreshed');
    } catch (error) {
      toast.error('Failed to refresh balances');
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        className="gradient-primary text-white font-semibold px-6 py-2 rounded-full hover:scale-105 transition-all duration-300 neon-glow"
        disabled={isConnecting || isLoading}
      >
        {isConnecting || isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-full">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isCorrectNetwork ? 'bg-emerald-500' : 'bg-red-500'
          )} />
          <span className="font-medium">{formatAddress(address!)}</span>
          {!isCorrectNetwork && (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Connected Wallet</span>
            <div className="flex items-center gap-2">
              {!isCorrectNetwork && (
                <Badge variant="destructive" className="text-xs">
                  Wrong Network
                </Badge>
              )}
              <div className={cn(
                "w-2 h-2 rounded-full",
                isCorrectNetwork ? 'bg-emerald-500' : 'bg-red-500'
              )} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-mono mb-3">
            {address}
          </div>

          {!isCorrectNetwork && (
            <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs text-amber-800 mb-1">
                Please switch to BSC Mainnet
              </div>
              <Button
                size="sm"
                onClick={switchToCorrectNetwork}
                className="w-full text-xs"
              >
                Switch to BSC
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>BNB Balance:</span>
              <span className="font-medium">{balance}</span>
            </div>
            {Object.entries(tokenBalances).map(([symbol, balance]) => (
              symbol !== 'BNB' && (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol} Balance:</span>
                  <span className="font-medium">{balance}</span>
                </div>
              )
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRefreshBalances}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Balances
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`${BSC_MAINNET.explorerUrl}/address/${address}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on BSCScan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}