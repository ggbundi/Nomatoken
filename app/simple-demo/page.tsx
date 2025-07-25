"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CoinRain, FloatingCoins, CoinParticles } from '@/components/atoms/coin-animations';
import { AnimatedButton } from '@/components/atoms/animated-button';
import { SimpleAnimationControls } from '@/components/atoms/simple-animation-controls';
import { useSimpleAnimations } from '@/hooks/use-simple-animations';
import { CheckCircle, Smartphone, Monitor, Eye, EyeOff } from 'lucide-react';

export default function SimplifiedAnimationDemo() {
  const [particleTrigger, setParticleTrigger] = useState(false);
  const { 
    settings, 
    isAnimationEnabled, 
    deviceType, 
    prefersReducedMotion,
    triggerParticles 
  } = useSimpleAnimations();

  const handleParticleTrigger = () => {
    setParticleTrigger(true);
    setTimeout(() => setParticleTrigger(false), 100);
    triggerParticles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Simplified Animations - No Performance Monitoring */}
      {isAnimationEnabled && settings.rainEnabled && (
        <CoinRain 
          intensity={settings.intensity} 
          className="z-0" 
          disabled={!isAnimationEnabled}
        />
      )}
      
      {isAnimationEnabled && settings.floatingEnabled && (
        <FloatingCoins 
          intensity={settings.intensity} 
          className="z-0" 
          disabled={!isAnimationEnabled}
        />
      )}

      {isAnimationEnabled && settings.particlesEnabled && (
        <CoinParticles
          trigger={particleTrigger}
          particleCount={deviceType === 'mobile' ? 6 : 10}
          intensity={settings.intensity}
          className="z-10"
          disabled={!isAnimationEnabled}
        />
      )}

      {/* Header */}
      <div className="relative z-20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Simplified Animation System</h1>
          <div className="flex gap-2">
            <SimpleAnimationControls compact />
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
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Simplified
            </span>
            <br />
            Animation System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No performance monitoring. Device-based settings. User control. Professional reliability.
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                Device Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{deviceType}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {deviceType === 'mobile' 
                  ? 'Optimized for battery life' 
                  : 'Full animation experience'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {isAnimationEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Animation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={isAnimationEnabled ? "default" : "secondary"}>
                  {isAnimationEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {prefersReducedMotion 
                  ? 'System prefers reduced motion' 
                  : 'Ready for animations'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Intensity:</span>
                  <Badge variant="outline" className="text-xs">
                    {settings.intensity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Rain:</span>
                  <span className={settings.rainEnabled ? "text-green-600" : "text-gray-400"}>
                    {settings.rainEnabled ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Particles:</span>
                  <span className={settings.particlesEnabled ? "text-green-600" : "text-gray-400"}>
                    {settings.particlesEnabled ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatedButton
                className="w-full gradient-primary text-white"
                particleEffect="both"
                particleIntensity="high"
                onClick={handleParticleTrigger}
              >
                Investment Button (Hover & Click)
              </AnimatedButton>
              
              <Button
                className="w-full"
                onClick={handleParticleTrigger}
                variant="outline"
              >
                Trigger Particles Manually
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Simplified System Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Reliability
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Predictable behavior across sessions</li>
                  <li>• No false positives from monitoring</li>
                  <li>• Consistent user experience</li>
                  <li>• Professional appearance maintained</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Simplicity
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Device-based optimization</li>
                  <li>• User accessibility preferences</li>
                  <li>• Easy manual controls</li>
                  <li>• Reduced code complexity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Animation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleAnimationControls />
          </CardContent>
        </Card>

        {/* Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Approach Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-red-600">❌ Performance Monitoring</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complex FPS/memory tracking</li>
                  <li>• Unpredictable behavior</li>
                  <li>• False positive disabling</li>
                  <li>• Maintenance overhead</li>
                  <li>• User confusion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-600">✅ Simplified System</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Device-type detection</li>
                  <li>• Accessibility compliance</li>
                  <li>• User preference controls</li>
                  <li>• Predictable behavior</li>
                  <li>• Professional reliability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
