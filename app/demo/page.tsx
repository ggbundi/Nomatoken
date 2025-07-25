"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoinRain, FloatingCoins, CoinParticles } from '@/components/atoms/coin-animations';
import { AnimatedButton } from '@/components/atoms/animated-button';
import { AnimationControls } from '@/components/atoms/animation-controls';
import { PerformanceIndicator } from '@/components/atoms/performance-indicator';
import { useCoinAnimations } from '@/hooks/use-coin-animations';

export default function AnimationDemo() {
  const [particleTrigger, setParticleTrigger] = useState(false);
  const { settings, isAnimationEnabled } = useCoinAnimations();

  const triggerParticles = () => {
    setParticleTrigger(true);
    setTimeout(() => setParticleTrigger(false), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Coin Rain */}
      {isAnimationEnabled && (
        <CoinRain 
          intensity="medium" 
          className="z-0" 
          disabled={!isAnimationEnabled}
        />
      )}
      
      {/* Floating Coins */}
      {isAnimationEnabled && (
        <FloatingCoins 
          intensity="low" 
          className="z-0" 
          disabled={!isAnimationEnabled}
        />
      )}

      {/* Particle Effect */}
      {isAnimationEnabled && (
        <CoinParticles
          trigger={particleTrigger}
          particleCount={8}
          intensity="high"
          className="z-10"
          disabled={!isAnimationEnabled}
        />
      )}

      {/* Header */}
      <div className="relative z-20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">NOMA Token Animation Demo</h1>
          <div className="flex gap-2">
            <PerformanceIndicator compact />
            <AnimationControls compact />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-bold">
            Experience{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              NOMA Token
            </span>
            <br />
            Animations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch the elegant coin animations that enhance the user experience while maintaining professional aesthetics.
          </p>
        </motion.div>

        {/* Animation Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatedButton
                className="w-full gradient-primary text-white"
                particleEffect="both"
                particleIntensity="high"
                onClick={triggerParticles}
              >
                Investment Button (Hover & Click)
              </AnimatedButton>
              
              <AnimatedButton
                variant="outline"
                className="w-full"
                particleEffect="hover"
                particleIntensity="medium"
                glowEffect={false}
              >
                Secondary Button (Hover Only)
              </AnimatedButton>
              
              <Button
                className="w-full"
                onClick={triggerParticles}
              >
                Trigger Particles Manually
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Animation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimationControls />
            </CardContent>
          </Card>
        </div>

        {/* Performance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Performance Monitor
              {process.env.NODE_ENV === 'development' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem('noma-dev-performance-override', 'true');
                    window.location.reload();
                  }}
                >
                  Enable All Animations
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceIndicator showDetails compact={false} />
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Development Mode</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  If animations are disabled due to performance monitoring, click "Enable All Animations"
                  to override the performance limits for testing purposes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Animation Types Demo */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden h-64">
            <div className="absolute inset-0">
              <CoinRain intensity="low" disabled={!isAnimationEnabled} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle>Coin Rain</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Coins fall from the top of the screen with smooth animations.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden h-64">
            <div className="absolute inset-0">
              <FloatingCoins intensity="medium" disabled={!isAnimationEnabled} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle>Floating Coins</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground">
                Gentle floating animations that move across the screen.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden h-64">
            <CardHeader className="relative z-10">
              <CardTitle>Particle Effects</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-2">
              <p className="text-sm text-muted-foreground">
                Interactive particles triggered by user actions.
              </p>
              <Button 
                size="sm" 
                onClick={triggerParticles}
                className="relative"
              >
                Trigger Particles
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Animation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Performance Optimized</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Viewport-based rendering</li>
                  <li>• Automatic performance monitoring</li>
                  <li>• Adaptive quality settings</li>
                  <li>• Memory management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Accessibility</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Respects reduced motion preferences</li>
                  <li>• User-controllable settings</li>
                  <li>• High contrast support</li>
                  <li>• Keyboard navigation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
