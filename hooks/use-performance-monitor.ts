"use client"

import { useEffect, useRef, useState } from 'react';
import { ANIMATION_CONFIG } from '@/lib/animation-config';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  isLowPerformance: boolean;
  shouldReduceAnimations: boolean;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    isLowPerformance: false,
    shouldReduceAnimations: false,
  });

  // Development override - disable aggressive monitoring in dev mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [devOverride, setDevOverride] = useState(false);

  useEffect(() => {
    if (isDevelopment) {
      // Check localStorage for dev override
      const override = localStorage.getItem('noma-dev-performance-override');
      setDevOverride(override === 'true');
    }
  }, [isDevelopment]);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let fpsHistory: number[] = [];
    
    const measurePerformance = () => {
      const now = performance.now();
      frameCountRef.current++;

      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        fpsHistory.push(fps);
        
        // Keep only last 5 seconds of FPS data
        if (fpsHistory.length > 5) {
          fpsHistory = fpsHistory.slice(-5);
        }

        const avgFps = fpsHistory.reduce((sum, f) => sum + f, 0) / fpsHistory.length;
        
        // Get memory usage if available (with better calculation)
        const memoryInfo = (performance as any).memory;
        let memoryUsage = 0;

        if (memoryInfo) {
          // Use configuration-based memory calculation
          const usedMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
          const totalMB = memoryInfo.totalJSHeapSize / (1024 * 1024);

          // Use config values for thresholds
          const isHighAbsolute = usedMB > ANIMATION_CONFIG.performance.memoryWarningMB;
          const isHighRelative = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) > 0.9;

          memoryUsage = isHighAbsolute || isHighRelative ?
            Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) :
            Math.min(50, Math.round((usedMB / ANIMATION_CONFIG.performance.memoryWarningMB) * 100));
        }

        // Use configuration-based performance thresholds with dev override
        const config = ANIMATION_CONFIG.performance;
        const isLowPerformance = !devOverride && (
          avgFps < config.lowPerformanceFPS ||
          (memoryInfo && memoryUsage > config.lowPerformanceMemory)
        );
        const shouldReduceAnimations = !devOverride && (
          avgFps < config.reducedAnimationsFPS ||
          (memoryInfo && memoryUsage > config.reducedAnimationsMemory)
        );

        setMetrics({
          fps: Math.round(avgFps),
          memoryUsage: Math.round(memoryUsage),
          isLowPerformance,
          shouldReduceAnimations,
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    };

    // Start monitoring
    animationFrameRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return metrics;
}

// Hook for adaptive animation settings based on performance
export function useAdaptiveAnimations() {
  const performance = usePerformanceMonitor();
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    intensity: 'medium' as 'low' | 'medium' | 'high',
    enableRain: true,
    enableFloating: true,
    enableParticles: true,
    maxConcurrentAnimations: 10,
  });

  useEffect(() => {
    if (performance.isLowPerformance) {
      setAdaptiveSettings({
        intensity: 'low',
        enableRain: false,
        enableFloating: true,
        enableParticles: false,
        maxConcurrentAnimations: 3,
      });
    } else if (performance.shouldReduceAnimations) {
      setAdaptiveSettings({
        intensity: 'medium',
        enableRain: true,
        enableFloating: true,
        enableParticles: true,
        maxConcurrentAnimations: 6,
      });
    } else {
      setAdaptiveSettings({
        intensity: 'high',
        enableRain: true,
        enableFloating: true,
        enableParticles: true,
        maxConcurrentAnimations: 10,
      });
    }
  }, [performance.isLowPerformance, performance.shouldReduceAnimations]);

  return {
    performance,
    adaptiveSettings,
  };
}

// Hook for intersection-based animation control
export function useIntersectionAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return {
    elementRef,
    isVisible,
  };
}
