"use client"

import { useState, useEffect, useCallback } from 'react';

interface SimpleAnimationSettings {
  rainEnabled: boolean;
  floatingEnabled: boolean;
  particlesEnabled: boolean;
  backgroundEnabled: boolean;
  intensity: 'low' | 'medium' | 'high';
  respectReducedMotion: boolean;
}

interface UseSimpleAnimationsReturn {
  settings: SimpleAnimationSettings;
  updateSettings: (newSettings: Partial<SimpleAnimationSettings>) => void;
  triggerParticles: () => void;
  isAnimationEnabled: boolean;
  particleTrigger: boolean;
  deviceType: 'mobile' | 'desktop';
  prefersReducedMotion: boolean;
}

// Device-based default settings
const getDefaultSettings = (isMobile: boolean): SimpleAnimationSettings => ({
  rainEnabled: true,
  floatingEnabled: true,
  particlesEnabled: true,
  backgroundEnabled: !isMobile, // Disable background on mobile for battery
  intensity: isMobile ? 'low' : 'medium',
  respectReducedMotion: true,
});

export function useSimpleAnimations(): UseSimpleAnimationsReturn {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(false);
  
  // Initialize settings based on device type
  const [settings, setSettings] = useState<SimpleAnimationSettings>(() => 
    getDefaultSettings(false) // Default to desktop until we detect
  );

  // Detect device type and reduced motion preference
  useEffect(() => {
    const checkDeviceAndMotion = () => {
      // Device detection
      const isMobile = window.innerWidth < 768 || 
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setDeviceType(isMobile ? 'mobile' : 'desktop');

      // Reduced motion detection
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      // Update settings based on device type if not customized
      const savedSettings = localStorage.getItem('noma-animation-settings');
      if (!savedSettings) {
        setSettings(getDefaultSettings(isMobile));
      }

      // Listen for reduced motion changes
      const handleMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleMotionChange);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    };

    const cleanup = checkDeviceAndMotion();
    
    // Listen for window resize to detect device type changes
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      cleanup?.();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load saved settings
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('noma-animation-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load animation settings:', error);
    }
  }, []);

  // Update settings with persistence
  const updateSettings = useCallback((newSettings: Partial<SimpleAnimationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('noma-animation-settings', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save animation settings:', error);
      }
      return updated;
    });
  }, []);

  // Trigger particle animation
  const triggerParticles = useCallback(() => {
    if (!isAnimationEnabled || !settings.particlesEnabled) return;
    
    setParticleTrigger(true);
    setTimeout(() => setParticleTrigger(false), 100);
  }, [settings.particlesEnabled]);

  // Determine if animations should be enabled
  const isAnimationEnabled = !prefersReducedMotion || !settings.respectReducedMotion;

  return {
    settings,
    updateSettings,
    triggerParticles,
    isAnimationEnabled,
    particleTrigger,
    deviceType,
    prefersReducedMotion,
  };
}

// Page-specific animation settings (simplified)
export function usePageAnimations(page: 'home' | 'about' | 'tokenomics' | 'launchpad') {
  const baseAnimations = useSimpleAnimations();
  
  // Page-specific overrides (much simpler than before)
  const pageSettings = {
    home: {
      rainEnabled: true,
      floatingEnabled: true,
      backgroundEnabled: baseAnimations.deviceType === 'desktop',
    },
    about: {
      rainEnabled: false,
      floatingEnabled: true,
      backgroundEnabled: false,
    },
    tokenomics: {
      rainEnabled: false,
      floatingEnabled: true,
      backgroundEnabled: false,
    },
    launchpad: {
      rainEnabled: true,
      floatingEnabled: true,
      backgroundEnabled: baseAnimations.deviceType === 'desktop',
    },
  };

  // Apply page-specific settings
  useEffect(() => {
    baseAnimations.updateSettings(pageSettings[page]);
  }, [page, baseAnimations.deviceType]);

  return baseAnimations;
}

// Simplified interaction particles (no performance checking)
export function useInteractionParticles() {
  const { triggerParticles, isAnimationEnabled } = useSimpleAnimations();

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
      // Multiple bursts for success
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
