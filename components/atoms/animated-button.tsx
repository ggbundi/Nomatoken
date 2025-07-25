"use client"

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { CoinParticles } from '@/components/atoms/coin-animations';
import { useInteractionParticles } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  particleEffect?: 'hover' | 'click' | 'both' | 'none';
  particleIntensity?: 'low' | 'medium' | 'high';
  glowEffect?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  particleEffect = 'both',
  particleIntensity = 'medium',
  glowEffect = true,
  className,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { onHover, onClick: onParticleClick, isAnimationEnabled } = useInteractionParticles();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    if (particleEffect === 'hover' || particleEffect === 'both') {
      onHover();
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (particleEffect === 'click' || particleEffect === 'both') {
      onParticleClick();
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }
    onClick?.(e);
  };

  const getParticleCount = () => {
    switch (particleIntensity) {
      case 'low': return 3;
      case 'medium': return 5;
      case 'high': return 8;
      default: return 5;
    }
  };

  return (
    <div className="relative inline-block">
      {/* Particle Effect */}
      {isAnimationEnabled && showParticles && particleEffect !== 'none' && (
        <CoinParticles
          trigger={showParticles}
          particleCount={getParticleCount()}
          intensity={particleIntensity}
          className="absolute inset-0 pointer-events-none"
          disabled={!isAnimationEnabled}
        />
      )}
      
      {/* Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          ref={buttonRef}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            glowEffect && isHovered && "shadow-lg shadow-primary/25",
            glowEffect && "hover:shadow-xl hover:shadow-primary/30",
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          {...props}
        >
          {/* Glow effect overlay */}
          {glowEffect && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '100%' } : { x: '-100%' }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
          
          {/* Button content */}
          <span className="relative z-10">
            {children}
          </span>
        </Button>
      </motion.div>
    </div>
  );
};

// Convenience components for common use cases
export const PrimaryAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="default" {...props} />
);

export const SecondaryAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton variant="outline" particleEffect="hover" glowEffect={false} {...props} />
);

export const SuccessAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant' | 'particleEffect'>> = (props) => (
  <AnimatedButton variant="default" particleEffect="click" particleIntensity="high" {...props} />
);
