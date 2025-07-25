"use client"

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceBadgeProps {
  price: string;
  change: number;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceBadge({ 
  price, 
  change, 
  symbol = 'NOMA',
  size = 'md',
  className 
}: PriceBadgeProps) {
  const isPositive = change >= 0;

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full bg-card border shadow-sm transition-all duration-300",
      sizeClasses[size],
      className
    )}>
      <span className="font-poppins font-semibold">
        ${price}
      </span>
      <div className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-noma-success" : "text-noma-error"
      )}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(change).toFixed(2)}%
      </div>
      <span className="text-xs text-muted-foreground font-mono">
        {symbol}
      </span>
    </div>
  );
}