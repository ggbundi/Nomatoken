"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Eye, EyeOff, Zap, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useCoinAnimations } from '@/hooks/use-coin-animations';
import { cn } from '@/lib/utils';

interface AnimationControlsProps {
  className?: string;
  compact?: boolean;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  className,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, isAnimationEnabled } = useCoinAnimations();

  const intensityOptions = [
    { value: 'low', label: 'Low', description: 'Minimal animations' },
    { value: 'medium', label: 'Medium', description: 'Balanced experience' },
    { value: 'high', label: 'High', description: 'Full animations' }
  ];

  const handleIntensityChange = (value: string) => {
    updateSettings({ intensity: value as 'low' | 'medium' | 'high' });
  };

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          aria-label="Animation settings"
        >
          {isAnimationEnabled ? (
            <Zap className="w-4 h-4" />
          ) : (
            <ZapOff className="w-4 h-4" />
          )}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="w-64 shadow-lg border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Animation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimationControlContent 
                    settings={settings}
                    updateSettings={updateSettings}
                    isAnimationEnabled={isAnimationEnabled}
                    intensityOptions={intensityOptions}
                    handleIntensityChange={handleIntensityChange}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Animation Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimationControlContent 
          settings={settings}
          updateSettings={updateSettings}
          isAnimationEnabled={isAnimationEnabled}
          intensityOptions={intensityOptions}
          handleIntensityChange={handleIntensityChange}
        />
      </CardContent>
    </Card>
  );
};

interface AnimationControlContentProps {
  settings: any;
  updateSettings: (settings: any) => void;
  isAnimationEnabled: boolean;
  intensityOptions: Array<{ value: string; label: string; description: string }>;
  handleIntensityChange: (value: string) => void;
}

const AnimationControlContent: React.FC<AnimationControlContentProps> = ({
  settings,
  updateSettings,
  isAnimationEnabled,
  intensityOptions,
  handleIntensityChange
}) => {
  return (
    <>
      {/* Reduced Motion Respect */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="reduced-motion" className="text-sm font-medium">
            Respect System Preferences
          </Label>
          <p className="text-xs text-muted-foreground">
            Follow your device's motion settings
          </p>
        </div>
        <Switch
          id="reduced-motion"
          checked={settings.respectReducedMotion}
          onCheckedChange={(checked) => 
            updateSettings({ respectReducedMotion: checked })
          }
        />
      </div>

      {/* Animation Status */}
      <div className="flex items-center gap-2">
        <Badge variant={isAnimationEnabled ? "default" : "secondary"}>
          {isAnimationEnabled ? (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Animations On
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Animations Off
            </>
          )}
        </Badge>
      </div>

      {/* Animation Types */}
      {isAnimationEnabled && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Animation Types</Label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="rain" className="text-sm">Coin Rain</Label>
              <Switch
                id="rain"
                checked={settings.rainEnabled}
                onCheckedChange={(checked) => 
                  updateSettings({ rainEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="floating" className="text-sm">Floating Coins</Label>
              <Switch
                id="floating"
                checked={settings.floatingEnabled}
                onCheckedChange={(checked) => 
                  updateSettings({ floatingEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="particles" className="text-sm">Interaction Particles</Label>
              <Switch
                id="particles"
                checked={settings.particlesEnabled}
                onCheckedChange={(checked) => 
                  updateSettings({ particlesEnabled: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="background" className="text-sm">Background Effects</Label>
              <Switch
                id="background"
                checked={settings.backgroundEnabled}
                onCheckedChange={(checked) => 
                  updateSettings({ backgroundEnabled: checked })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Intensity Control */}
      {isAnimationEnabled && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Animation Intensity</Label>
          <div className="grid grid-cols-3 gap-2">
            {intensityOptions.map((option) => (
              <Button
                key={option.value}
                variant={settings.intensity === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleIntensityChange(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {intensityOptions.find(opt => opt.value === settings.intensity)?.description}
          </p>
        </div>
      )}
    </>
  );
};
