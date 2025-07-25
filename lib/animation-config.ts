// Simplified Animation Configuration
// Device-based settings without performance monitoring

export const SIMPLE_ANIMATION_CONFIG = {
  // Cleanup and maintenance
  maintenance: {
    cleanupInterval: 5000,      // Cleanup coins every 5 seconds (less aggressive)
    maxCoinAge: 30000,          // Remove coins after 30 seconds max
  },
  
  // Simple device-based limits
  limits: {
    coinRain: {
      desktop: 6,    // Slightly more generous
      mobile: 3,
    },
    floating: {
      desktop: 5,    // Slightly more generous
      mobile: 3,
    },
    particles: {
      desktop: 10,   // More generous for interactions
      mobile: 6,
    },
    background: {
      desktop: 3,
      mobile: 0,     // Disabled on mobile for battery
    },
  },
  
  // Animation Timing
  timing: {
    // Coin rain intervals (ms)
    rainInterval: {
      low: 8000,
      medium: 6000,
      high: 4000,
    },
    
    // Animation durations (seconds)
    coinFall: {
      min: 8,
      max: 15,
    },
    coinFloat: {
      min: 15,
      max: 25,
    },
    particles: {
      min: 1,
      max: 2,
    },
  },
  
  // Browser compatibility
  compatibility: {
    // Disable animations on very old browsers
    disableOnOldBrowsers: true,
    minimumBrowsers: {
      chrome: 60,
      firefox: 55,
      safari: 12,
      edge: 79,
    },
  },
};

// Export ANIMATION_CONFIG as an alias for backward compatibility
export const ANIMATION_CONFIG = {
  ...SIMPLE_ANIMATION_CONFIG,
  performance: {
    lowPerformanceFPS: 30,
    reducedAnimationsFPS: 45,
    lowPerformanceMemory: 100,
    reducedAnimationsMemory: 80,
    memoryWarningMB: 150,
  },
};

// Helper function to check browser compatibility
export function isBrowserSupported(): boolean {
  if (typeof window === 'undefined') return true;

  const { compatibility } = SIMPLE_ANIMATION_CONFIG;
  if (!compatibility.disableOnOldBrowsers) return true;

  const userAgent = navigator.userAgent;

  // Simple browser detection (could be enhanced)
  if (userAgent.includes('Chrome/')) {
    const version = parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0');
    return version >= compatibility.minimumBrowsers.chrome;
  }

  if (userAgent.includes('Firefox/')) {
    const version = parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || '0');
    return version >= compatibility.minimumBrowsers.firefox;
  }

  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    const version = parseInt(userAgent.match(/Version\/(\d+)/)?.[1] || '0');
    return version >= compatibility.minimumBrowsers.safari;
  }

  if (userAgent.includes('Edge/')) {
    const version = parseInt(userAgent.match(/Edge\/(\d+)/)?.[1] || '0');
    return version >= compatibility.minimumBrowsers.edge;
  }

  // Default to supported for unknown browsers
  return true;
}

// Helper function to check if device is mobile
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Helper function to get appropriate limits for current device (simplified)
export function getSimpleDeviceLimits() {
  const isMobile = isMobileDevice();
  const limits = SIMPLE_ANIMATION_CONFIG.limits;

  return {
    coinRain: isMobile ? limits.coinRain.mobile : limits.coinRain.desktop,
    floating: isMobile ? limits.floating.mobile : limits.floating.desktop,
    particles: isMobile ? limits.particles.mobile : limits.particles.desktop,
    background: isMobile ? limits.background.mobile : limits.background.desktop,
  };
}
