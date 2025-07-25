"use client"

import Image from 'next/image';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withLogo?: boolean;
}

export function LoadingSpinner({ size = 'md', className, withLogo = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const logoSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (withLogo) {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500",
              logoSizeClasses[size]
            )}
          />
          <div className="absolute inset-2">
            <Image
              src="/assets/nomacoin.png"
              alt="NomaToken Coin"
              width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
              height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}