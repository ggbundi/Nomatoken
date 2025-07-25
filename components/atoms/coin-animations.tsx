"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getSimpleDeviceLimits, SIMPLE_ANIMATION_CONFIG, isBrowserSupported } from '@/lib/animation-config';
import { cn } from '@/lib/utils';

interface CoinProps {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'fall' | 'float' | 'particle' | 'glow';
  onComplete?: () => void;
}

interface CoinAnimationsProps {
  type: 'rain' | 'floating' | 'particles' | 'background';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  trigger?: boolean;
  particleCount?: number;
  disabled?: boolean;
}

// Individual coin component
const AnimatedCoin: React.FC<CoinProps> = ({ 
  id, 
  x, 
  y, 
  size, 
  duration, 
  delay, 
  type, 
  onComplete 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getAnimationClass = () => {
    if (prefersReducedMotion) return 'coin-static';
    
    switch (type) {
      case 'fall': return 'coin-fall';
      case 'float': return 'coin-float';
      case 'particle': return 'coin-particle';
      case 'glow': return 'coin-glow';
      default: return '';
    }
  };

  const coinStyle = {
    left: `${x}%`,
    top: type === 'fall' ? '-100px' : `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    zIndex: type === 'particle' ? 50 : 1,
  };

  useEffect(() => {
    if (type === 'fall' || type === 'particle') {
      const timer = setTimeout(() => {
        onComplete?.();
      }, (duration + delay) * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [duration, delay, type, onComplete]);

  if (prefersReducedMotion && type !== 'glow') {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute pointer-events-none select-none",
        getAnimationClass()
      )}
      style={coinStyle}
    >
      <Image
        src="/assets/nomacoin.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
        priority={false}
        loading="lazy"
        aria-hidden="true"
        style={{
          willChange: type === 'fall' || type === 'particle' ? 'transform' : 'auto'
        }}
      />
    </div>
  );
};

// Main coin animations component
export const CoinAnimations: React.FC<CoinAnimationsProps> = ({
  type,
  intensity = 'medium',
  className,
  trigger = false,
  particleCount = 5,
  disabled = false
}) => {
  const [coins, setCoins] = useState<CoinProps[]>([]);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simple visibility check (no complex intersection observer)
  const [isVisible, setIsVisible] = useState(true);

  const maxCoins = useMemo(() => {
    // Check browser support first
    if (!isBrowserSupported()) return 0;

    const limits = getSimpleDeviceLimits();
    const typeMap = {
      'rain': limits.coinRain,
      'floating': limits.floating,
      'particles': limits.particles,
      'background': limits.background
    };

    return typeMap[type] || 3;
  }, [type]);

  // Configuration based on type and intensity
  const config = useMemo(() => {
    const baseConfig = {
      rain: {
        low: { count: 3, interval: 8000, size: [20, 30], duration: [8, 12] },
        medium: { count: 5, interval: 6000, size: [25, 35], duration: [10, 15] },
        high: { count: 8, interval: 4000, size: [30, 40], duration: [12, 18] }
      },
      floating: {
        low: { count: 2, interval: 0, size: [30, 40], duration: [15, 20] },
        medium: { count: 4, interval: 0, size: [35, 45], duration: [20, 25] },
        high: { count: 6, interval: 0, size: [40, 50], duration: [25, 30] }
      },
      particles: {
        low: { count: 3, interval: 0, size: [15, 25], duration: [1, 1.5] },
        medium: { count: 5, interval: 0, size: [20, 30], duration: [1.2, 1.8] },
        high: { count: 8, interval: 0, size: [25, 35], duration: [1.5, 2] }
      },
      background: {
        low: { count: 1, interval: 0, size: [100, 120], duration: [30, 40] },
        medium: { count: 2, interval: 0, size: [120, 150], duration: [40, 50] },
        high: { count: 3, interval: 0, size: [150, 200], duration: [50, 60] }
      }
    };
    
    return baseConfig[type][intensity];
  }, [type, intensity]);

  const generateCoin = useCallback((index: number = 0): CoinProps => {
    const sizeRange = config.size;
    const durationRange = config.duration;
    
    return {
      id: `coin-${Date.now()}-${Math.random()}`,
      x: Math.random() * 100,
      y: type === 'floating' ? Math.random() * 80 + 10 : Math.random() * 100,
      size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
      duration: Math.random() * (durationRange[1] - durationRange[0]) + durationRange[0],
      delay: type === 'rain' ? Math.random() * 2 : index * 0.2,
      type: type === 'rain' ? 'fall' : 
            type === 'floating' ? 'float' : 
            type === 'particles' ? 'particle' : 'glow',
      onComplete: () => removeCoin
    };
  }, [config, type]);

  const removeCoin = useCallback((coinId: string) => {
    setCoins(prev => prev.filter(coin => coin.id !== coinId));
  }, []);

  // Performance optimization: Clean up old coins
  const cleanupOldCoins = useCallback(() => {
    setCoins(prev => {
      if (prev.length > maxCoins) {
        return prev.slice(-maxCoins);
      }
      return prev;
    });
  }, [maxCoins]);

  // Initialize floating and background coins
  useEffect(() => {
    if (disabled) return;
    
    if (type === 'floating' || type === 'background') {
      const initialCoins = Array.from({ length: config.count }, (_, i) => generateCoin(i));
      setCoins(initialCoins);
      setIsActive(true);
    }
  }, [type, config.count, generateCoin, disabled]);

  // Handle rain animation (simplified - no performance monitoring)
  useEffect(() => {
    if (disabled || type !== 'rain' || maxCoins === 0) return;

    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setCoins(prev => {
        // Limit coins for performance
        if (prev.length >= maxCoins) {
          return prev;
        }
        const newCoin = generateCoin();
        return [...prev, newCoin];
      });
    }, config.interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [type, config.interval, generateCoin, disabled, maxCoins]);

  // Simple cleanup (less aggressive)
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      cleanupOldCoins();
    }, SIMPLE_ANIMATION_CONFIG.maintenance.cleanupInterval);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanupOldCoins]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setCoins([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Handle particle trigger
  useEffect(() => {
    if (disabled || type !== 'particles' || !trigger) return;
    
    const particles = Array.from({ length: particleCount }, (_, i) => generateCoin(i));
    setCoins(prev => [...prev, ...particles]);
  }, [trigger, type, particleCount, generateCoin, disabled]);

  // Don't render if disabled, inactive, or browser not supported
  if (disabled || !isActive || maxCoins === 0) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <AnimatePresence>
        {coins.map((coin) => (
          <AnimatedCoin
            key={coin.id}
            {...coin}
            onComplete={() => removeCoin(coin.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Convenience components for specific use cases
export const CoinRain: React.FC<Omit<CoinAnimationsProps, 'type'>> = (props) => (
  <CoinAnimations {...props} type="rain" />
);

export const FloatingCoins: React.FC<Omit<CoinAnimationsProps, 'type'>> = (props) => (
  <CoinAnimations {...props} type="floating" />
);

export const CoinParticles: React.FC<Omit<CoinAnimationsProps, 'type'>> = (props) => (
  <CoinAnimations {...props} type="particles" />
);

export const BackgroundCoins: React.FC<Omit<CoinAnimationsProps, 'type'>> = (props) => (
  <CoinAnimations {...props} type="background" />
);
