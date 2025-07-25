"use client"

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PurchaseWizardStep } from './purchase-wizard-step';
import { BrandedBackground } from '@/components/atoms/branded-background';
import { useWeb3 } from '@/components/providers/web3-provider';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentModal({ isOpen, onClose }: InvestmentModalProps) {
  const [purchaseStep, setPurchaseStep] = useState<1 | 2 | 3>(1);
  const { isConnected } = useWeb3();

  const handleStepComplete = (nextStep: number) => {
    if (nextStep > 3) {
      // Purchase completed, close modal and reset
      onClose();
      setPurchaseStep(1);
    } else {
      setPurchaseStep(nextStep as 1 | 2 | 3);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset to step 1 when modal is closed
    setPurchaseStep(1);
  };

  // Determine initial step based on wallet connection status
  const getInitialStep = (): 1 | 2 | 3 => {
    if (!isConnected) {
      return 1; // Start with wallet connection
    }
    return 2; // Skip to payment method selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <BrandedBackground variant="subtle">
          <DialogHeader>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/assets/nomacoin.png"
                alt="NomaToken Coin"
                width={32}
                height={32}
                className="object-contain"
              />
              <DialogTitle className="text-center">
                Start Your Investment Journey
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Purchase NOMA tokens and start building your real estate portfolio
            </div>
            <PurchaseWizardStep
              step={isConnected && purchaseStep === 1 ? getInitialStep() : purchaseStep}
              onStepComplete={handleStepComplete}
            />
          </div>
        </BrandedBackground>
      </DialogContent>
    </Dialog>
  );
}
