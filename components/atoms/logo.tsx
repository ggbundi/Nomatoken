"use client"

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Image
          src="/assets/NOMA CHAIN LOGO Compressed.svg"
          alt="NomaToken Logo"
          width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
          className={cn("object-contain", sizeClasses[size])}
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          "font-poppins font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          Noma Token
        </span>
      )}
    </div>
  );
}