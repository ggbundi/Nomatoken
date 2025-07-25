"use client"

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandedBackgroundProps {
  children: React.ReactNode;
  variant?: 'subtle' | 'prominent' | 'watermark';
  className?: string;
}

export function BrandedBackground({ 
  children, 
  variant = 'subtle', 
  className 
}: BrandedBackgroundProps) {
  const getLogoStyles = () => {
    switch (variant) {
      case 'prominent':
        return {
          opacity: 'opacity-20',
          size: 'w-32 h-32',
          position: 'top-4 right-4'
        };
      case 'watermark':
        return {
          opacity: 'opacity-5',
          size: 'w-64 h-64',
          position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        };
      default: // subtle
        return {
          opacity: 'opacity-10',
          size: 'w-24 h-24',
          position: 'bottom-4 right-4'
        };
    }
  };

  const logoStyles = getLogoStyles();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Logo */}
      <div className={cn("absolute pointer-events-none z-0", logoStyles.position)}>
        <Image
          src="/assets/nomacoin.png"
          alt=""
          width={256}
          height={256}
          className={cn(
            "object-contain",
            logoStyles.size,
            logoStyles.opacity
          )}
          aria-hidden="true"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
