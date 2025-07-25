"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoinParticles } from '@/components/atoms/coin-animations';
import { useInteractionParticles } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

interface SuccessMessageProps {
  title: string;
  message: string;
  transactionHash?: string;
  onClose?: () => void;
  className?: string;
}

export function SuccessMessage({
  title,
  message,
  transactionHash,
  onClose,
  className
}: SuccessMessageProps) {
  const { onSuccess, isAnimationEnabled } = useInteractionParticles();

  const handleViewTransaction = () => {
    if (transactionHash) {
      window.open(`https://bscscan.com/tx/${transactionHash}`, '_blank');
    }
  };

  // Trigger success particles when component mounts
  React.useEffect(() => {
    onSuccess();
  }, [onSuccess]);

  return (
    <div className="relative">
      {/* Success Particles */}
      {isAnimationEnabled && (
        <CoinParticles
          trigger={true}
          particleCount={8}
          intensity="high"
          className="absolute inset-0 pointer-events-none z-10"
          disabled={!isAnimationEnabled}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center space-y-4",
          className
        )}
      >
      {/* Logo and Success Icon */}
      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <Image
            src="/assets/nomacoin.png"
            alt="NomaToken Coin"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
          {title}
        </h3>
        <p className="text-emerald-700 dark:text-emerald-300 text-sm">
          {message}
        </p>
      </div>

      {/* Transaction Link */}
      {transactionHash && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewTransaction}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Transaction
        </Button>
      )}

      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
        >
          Close
        </Button>
      )}
      </motion.div>
    </div>
  );
}
