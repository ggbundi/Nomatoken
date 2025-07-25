"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnectionButton } from './wallet-connection-button';
import { LoadingSpinner } from '@/components/atoms/loading-spinner';
import { CheckCircle, Smartphone, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { useWeb3, useCorrectNetwork } from '@/components/providers/web3-provider';
import { TOKEN_SALE_CONFIG } from '@/lib/web3-config';
import { mpesaService } from '@/lib/services/mpesa-service';
import { toast } from 'sonner';
import { priceService } from '@/lib/services/price-service';
import { cn } from '@/lib/utils';

interface PurchaseWizardStepProps {
  step: 1 | 2 | 3;
  onStepComplete: (step: number) => void;
  className?: string;
}

export function PurchaseWizardStep({ step, onStepComplete, className }: PurchaseWizardStepProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<'BNB' | 'USDC' | 'USDT'>('USDC');
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [calculatedTokens, setCalculatedTokens] = useState('0');
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [mpesaPaymentData, setMpesaPaymentData] = useState<{
    checkoutRequestId: string;
    merchantRequestId: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'waiting' | 'polling' | 'completed' | 'failed'>('idle');

  const { isConnected, address, getSupportedTokens, purchaseTokens } = useWeb3();
  const { isCorrectNetwork, switchToCorrectNetwork } = useCorrectNetwork();

  // Fetch token prices on component mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await priceService.getTokenPrices(['BNB', 'USDC', 'USDT']);
        const priceMap: Record<string, number> = {};
        Object.entries(prices).forEach(([symbol, priceInfo]) => {
          priceMap[symbol] = priceInfo.price;
        });
        setTokenPrices(priceMap);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, []);

  // Calculate tokens and payment amount when amount or payment token changes
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setCalculatedTokens('0');
      setPaymentAmount('0');
      return;
    }

    const usdAmount = parseFloat(amount);
    const tokenPrice = parseFloat(TOKEN_SALE_CONFIG.tokenPrice);
    const tokens = (usdAmount / tokenPrice).toFixed(0);
    setCalculatedTokens(tokens);

    // Calculate payment amount based on selected token
    if (selectedPaymentToken === 'USDC' || selectedPaymentToken === 'USDT') {
      setPaymentAmount(amount);
    } else if (selectedPaymentToken === 'BNB') {
      const bnbPrice = tokenPrices['BNB'] || 300;
      const bnbAmount = (usdAmount / bnbPrice).toFixed(6);
      setPaymentAmount(bnbAmount);
    }
  }, [amount, selectedPaymentToken, tokenPrices]);

  const handleMpesaPayment = async () => {
    if (!phoneNumber || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate phone number
    if (!mpesaService.validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
      return;
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    const minPurchase = parseFloat(process.env.NEXT_PUBLIC_MIN_PURCHASE_AMOUNT || '10');
    const maxPurchase = parseFloat(process.env.NEXT_PUBLIC_MAX_PURCHASE_AMOUNT || '10000');

    if (numericAmount < minPurchase) {
      toast.error(`Minimum purchase amount is $${minPurchase}`);
      return;
    }

    if (numericAmount > maxPurchase) {
      toast.error(`Maximum purchase amount is $${maxPurchase}`);
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('initiating');

    try {
      // Format phone number
      const formattedPhone = mpesaService.formatPhoneNumber(phoneNumber);

      // Initiate M-Pesa payment
      const response = await mpesaService.initiatePayment({
        phoneNumber: formattedPhone,
        amount: numericAmount,
        accountReference: 'NomaToken Purchase',
      });

      if (response.success && response.data) {
        setMpesaPaymentData({
          checkoutRequestId: response.data.CheckoutRequestID,
          merchantRequestId: response.data.MerchantRequestID,
        });

        setPaymentStatus('waiting');
        toast.success('Payment request sent to your phone. Please enter your M-Pesa PIN to complete the transaction.');

        // Start polling for payment status
        setTimeout(() => {
          pollPaymentStatus(response.data!.CheckoutRequestID);
        }, 5000); // Wait 5 seconds before starting to poll

      } else {
        throw new Error(response.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast.error(error.message || 'Failed to initiate M-Pesa payment');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    setPaymentStatus('polling');

    try {
      const status = await mpesaService.pollPaymentStatus(checkoutRequestId, 120000, 3000);

      if (status) {
        if (status.status === 'completed') {
          setPaymentStatus('completed');
          toast.success('Payment completed successfully!');

          // Complete token purchase
          if (status.mpesaReceiptNumber && mpesaPaymentData) {
            await completeTokenPurchase(status);
          }

          onStepComplete(2);
        } else if (status.status === 'failed') {
          setPaymentStatus('failed');
          toast.error(status.resultDesc || 'Payment failed');
        } else {
          setPaymentStatus('failed');
          toast.error('Payment was cancelled or expired');
        }
      } else {
        setPaymentStatus('failed');
        toast.error('Payment timeout. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment polling error:', error);
      setPaymentStatus('failed');
      toast.error('Failed to check payment status');
    }
  };

  const completeTokenPurchase = async (paymentStatus: any) => {
    try {
      if (!mpesaPaymentData) return;

      const response = await mpesaService.completeTokenPurchase({
        paymentMethod: 'mpesa',
        amount: parseFloat(amount),
        phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
        mpesaReceiptNumber: paymentStatus.mpesaReceiptNumber,
        checkoutRequestId: mpesaPaymentData.checkoutRequestId,
        merchantRequestId: mpesaPaymentData.merchantRequestId,
      });

      if (response.success) {
        toast.success(`Successfully purchased ${mpesaService.formatTokenAmount(response.data!.tokenAmount)} NOMA tokens!`);
      } else {
        toast.error(response.error || 'Failed to complete token purchase');
      }
    } catch (error: any) {
      console.error('Token purchase completion error:', error);
      toast.error('Failed to complete token purchase');
    }
  };

  const handleCryptoPayment = async () => {
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to BSC network');
      return;
    }

    const usdAmount = parseFloat(amount);
    const minPurchase = parseFloat(TOKEN_SALE_CONFIG.minPurchase);
    const maxPurchase = parseFloat(TOKEN_SALE_CONFIG.maxPurchase);

    if (usdAmount < minPurchase) {
      toast.error(`Minimum purchase amount is $${minPurchase}`);
      return;
    }

    if (usdAmount > maxPurchase) {
      toast.error(`Maximum purchase amount is $${maxPurchase}`);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await purchaseTokens(amount, selectedPaymentToken);

      if (result.success) {
        toast.success(`Successfully purchased ${calculatedTokens} NOMA tokens!`);
        onStepComplete(2);
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTokenPurchase = async () => {
    // This step is now handled by handleCryptoPayment
    // This function can be used for final confirmation or additional processing
    onStepComplete(3);
  };

  const getUserTokenBalances = () => {
    const tokens = getSupportedTokens();
    return tokens.reduce((acc, token) => {
      acc[token.symbol] = token.balance || '0';
      return acc;
    }, {} as Record<string, string>);
  };

  const hasInsufficientBalance = () => {
    const balances = getUserTokenBalances();
    const requiredAmount = parseFloat(paymentAmount);
    const userBalance = parseFloat(balances[selectedPaymentToken] || '0');
    return userBalance < requiredAmount;
  };

  if (step === 1) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-noma-success" />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
            Step 1: Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <>
              <p className="text-center text-muted-foreground">
                Connect your wallet to start purchasing NOMA tokens
              </p>
              <div className="flex justify-center">
                <WalletConnectionButton />
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-noma-success mx-auto mb-2" />
                <p className="font-medium">Wallet Connected!</p>
                <p className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <Button 
                onClick={() => onStepComplete(1)}
                className="w-full gradient-primary text-white"
              >
                Continue to Payment
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Step 2: Choose Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mpesa" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mpesa" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mpesa" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Enter your Safaricom M-Pesa number
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount-mpesa">Amount (USD)</Label>
                <Input
                  id="amount-mpesa"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="10000"
                />
                <div className="text-xs text-muted-foreground">
                  Minimum: $10, Maximum: $10,000
                </div>
              </div>

              {amount && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>USD Amount:</span>
                    <span>${amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>NOMA Tokens:</span>
                    <span>{mpesaService.formatTokenAmount(mpesaService.calculateTokenAmount(parseFloat(amount || '0')))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Token Price:</span>
                    <span>$0.0245</span>
                  </div>
                </div>
              )}

              {paymentStatus === 'waiting' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <Smartphone className="w-4 h-4" />
                    Check your phone for M-Pesa payment prompt
                  </div>
                </div>
              )}

              {paymentStatus === 'polling' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 text-sm">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Confirming payment...
                  </div>
                </div>
              )}

              {paymentStatus === 'completed' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Payment completed successfully!
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Payment failed. Please try again.
                  </div>
                </div>
              )}

              <Button
                onClick={handleMpesaPayment}
                disabled={isProcessing || paymentStatus === 'waiting' || paymentStatus === 'polling' || paymentStatus === 'completed'}
                className="w-full gradient-primary text-white"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" withLogo />
                    Initiating Payment...
                  </>
                ) : paymentStatus === 'waiting' ? (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Check Your Phone
                  </>
                ) : paymentStatus === 'polling' ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" withLogo />
                    Confirming Payment...
                  </>
                ) : paymentStatus === 'completed' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Payment Complete
                  </>
                ) : (
                  'Pay with M-Pesa'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4">
              {!isConnected && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Please connect your wallet first
                  </div>
                </div>
              )}

              {isConnected && !isCorrectNetwork && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Wrong network detected
                  </div>
                  <Button
                    size="sm"
                    onClick={switchToCorrectNetwork}
                    className="w-full"
                  >
                    Switch to BSC
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount-crypto">Amount (USD)</Label>
                <Input
                  id="amount-crypto"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={TOKEN_SALE_CONFIG.minPurchase}
                  max={TOKEN_SALE_CONFIG.maxPurchase}
                />
                <div className="text-xs text-muted-foreground">
                  Min: ${TOKEN_SALE_CONFIG.minPurchase} | Max: ${TOKEN_SALE_CONFIG.maxPurchase}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Token</Label>
                <Tabs value={selectedPaymentToken} onValueChange={(value) => setSelectedPaymentToken(value as 'BNB' | 'USDC' | 'USDT')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="BNB">BNB</TabsTrigger>
                    <TabsTrigger value="USDC">USDC</TabsTrigger>
                    <TabsTrigger value="USDT">USDT</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {amount && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>You will receive:</span>
                    <span className="font-medium">{calculatedTokens} NOMA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment required:</span>
                    <span className="font-medium">{paymentAmount} {selectedPaymentToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Token price:</span>
                    <span>${TOKEN_SALE_CONFIG.tokenPrice}</span>
                  </div>
                </div>
              )}

              {isConnected && hasInsufficientBalance() && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Insufficient {selectedPaymentToken} balance
                  </div>
                </div>
              )}

              <Button
                onClick={handleCryptoPayment}
                disabled={isProcessing || !isConnected || !isCorrectNetwork || hasInsufficientBalance()}
                className="w-full gradient-secondary text-white"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" withLogo />
                    Processing Payment...
                  </>
                ) : (
                  `Purchase with ${selectedPaymentToken}`
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-noma-success" />
            Step 3: Purchase Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">
              {(parseFloat(amount || '0') / 0.0245).toFixed(0)} NOMA
            </div>
            <div className="text-muted-foreground">
              ≈ ${amount || '0'} USD
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price per token:</span>
              <span>$0.0245</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Network fee:</span>
              <span>$2.50</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total:</span>
              <span>${(parseFloat(amount || '0') + 2.5).toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleTokenPurchase}
            disabled={isProcessing}
            className="w-full gradient-primary text-white"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" withLogo />
                Purchasing Tokens...
              </>
            ) : (
              'Complete Purchase'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}