"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAdaptiveAnimations } from './use-performance-monitor';

interface CoinAnimationSettings {
  rainEnabled: boolean;
  floatingEnabled: boolean;
  particlesEnabled: boolean;
  backgroundEnabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  respectReducedMotion: boolean;
}

interface UseCoinAnimationsReturn {
  settings: CoinAnimationSettings;
  updateSettings: (newSettings: Partial<CoinAnimationSettings>) => void;
  triggerParticles: () => void;
  isAnimationEnabled: boolean;
  particleTrigger: boolean;
  performance?: any;
}

const DEFAULT_SETTINGS: CoinAnimationSettings = {
  rainEnabled: true,
  floatingEnabled: true,
  particlesEnabled: true,
  backgroundEnabled: true,
  intensity: 'medium',
  respectReducedMotion: true,
};

export function useCoinAnimations(
  initialSettings?: Partial<CoinAnimationSettings>
): UseCoinAnimationsReturn {
  const [settings, setSettings] = useState<CoinAnimationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(false);
  const { performance, adaptiveSettings } = useAdaptiveAnimations();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('noma-coin-animations');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load coin animation settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<CoinAnimationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('noma-coin-animations', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save coin animation settings:', error);
      }
      return updated;
    });
  }, []);

  // Trigger particle animation
  const triggerParticles = useCallback(() => {
    if (!isAnimationEnabled || !settings.particlesEnabled) return;
    
    setParticleTrigger(true);
    // Reset trigger after a short delay
    setTimeout(() => setParticleTrigger(false), 100);
  }, [settings.particlesEnabled]);

  // Determine if animations should be enabled with performance consideration
  const isAnimationEnabled = (!prefersReducedMotion || !settings.respectReducedMotion) &&
                             !performance.isLowPerformance;

  // Apply adaptive settings based on performance
  useEffect(() => {
    if (performance.shouldReduceAnimations) {
      updateSettings({
        intensity: adaptiveSettings.intensity,
        rainEnabled: settings.rainEnabled && adaptiveSettings.enableRain,
        floatingEnabled: settings.floatingEnabled && adaptiveSettings.enableFloating,
        particlesEnabled: settings.particlesEnabled && adaptiveSettings.enableParticles,
      });
    }
  }, [performance.shouldReduceAnimations, adaptiveSettings]);

  return {
    settings,
    updateSettings,
    triggerParticles,
    isAnimationEnabled,
    particleTrigger,
    performance,
  };
}

// Hook for page-specific animation settings
export function usePageAnimations(page: 'home' | 'about' | 'tokenomics' | 'launchpad') {
  const baseSettings = useCoinAnimations();
  
  // Page-specific intensity and feature settings
  const pageConfigs = {
    home: {
      rainEnabled: true,
      floatingEnabled: true,
      backgroundEnabled: true,
      intensity: 'medium' as const,
    },
    about: {
      rainEnabled: false,
      floatingEnabled: true,
      backgroundEnabled: true,
      intensity: 'low' as const,
    },
    tokenomics: {
      rainEnabled: false,
      floatingEnabled: true,
      backgroundEnabled: false,
      intensity: 'low' as const,
    },
    launchpad: {
      rainEnabled: true,
      floatingEnabled: true,
      backgroundEnabled: true,
      intensity: 'high' as const,
    },
  };

  useEffect(() => {
    baseSettings.updateSettings(pageConfigs[page]);
  }, [page, baseSettings]);

  return baseSettings;
}

// Hook for interaction-based particle triggers
export function useInteractionParticles() {
  const { triggerParticles, isAnimationEnabled } = useCoinAnimations();

  const onHover = useCallback(() => {
    if (isAnimationEnabled) {
      triggerParticles();
    }
  }, [triggerParticles, isAnimationEnabled]);

  const onClick = useCallback(() => {
    if (isAnimationEnabled) {
      triggerParticles();
    }
  }, [triggerParticles, isAnimationEnabled]);

  const onSuccess = useCallback(() => {
    if (isAnimationEnabled) {
      // Trigger multiple particle bursts for success
      triggerParticles();
      setTimeout(() => triggerParticles(), 200);
      setTimeout(() => triggerParticles(), 400);
    }
  }, [triggerParticles, isAnimationEnabled]);

  return {
    onHover,
    onClick,
    onSuccess,
    isAnimationEnabled,
  };
}
