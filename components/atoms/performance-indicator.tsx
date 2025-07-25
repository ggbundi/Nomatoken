"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { cn } from '@/lib/utils';

interface PerformanceIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  className,
  showDetails = false,
  compact = true
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const metrics = usePerformanceMonitor();

  const getStatusColor = () => {
    if (metrics.isLowPerformance) return 'text-red-500';
    if (metrics.shouldReduceAnimations) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (metrics.isLowPerformance) return AlertTriangle;
    if (metrics.shouldReduceAnimations) return Info;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (metrics.isLowPerformance) return 'Low Performance';
    if (metrics.shouldReduceAnimations) return 'Reduced Animations';
    return 'Optimal Performance';
  };

  const StatusIcon = getStatusIcon();

  if (compact && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn("p-2", className)}
        aria-label="Performance status"
      >
        <StatusIcon className={cn("w-4 h-4", getStatusColor())} />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: compact ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: compact ? -10 : 0 }}
            className={compact ? "absolute top-full right-0 mt-2 z-50" : ""}
          >
            <Card className="w-64 shadow-lg border">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Performance</span>
                  </div>
                  {compact && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="p-1 h-auto"
                    >
                      ×
                    </Button>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("w-4 h-4", getStatusColor())} />
                  <span className="text-sm">{getStatusText()}</span>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">FPS</span>
                    <Badge 
                      variant={metrics.fps >= 45 ? "default" : metrics.fps >= 30 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {metrics.fps}
                    </Badge>
                  </div>
                  
                  {metrics.memoryUsage > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Memory</span>
                      <Badge 
                        variant={metrics.memoryUsage < 60 ? "default" : metrics.memoryUsage < 80 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {metrics.memoryUsage}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Performance Tips */}
                {(metrics.isLowPerformance || metrics.shouldReduceAnimations) && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    {metrics.isLowPerformance ? (
                      <p>Animations have been disabled to improve performance.</p>
                    ) : (
                      <p>Some animations have been reduced for better performance.</p>
                    )}
                  </div>
                )}

                {/* Animation Status */}
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <div className="flex justify-between">
                    <span>Coin Rain:</span>
                    <span className={metrics.isLowPerformance ? "text-red-500" : "text-green-500"}>
                      {metrics.isLowPerformance ? "Disabled" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Particles:</span>
                    <span className={metrics.shouldReduceAnimations ? "text-yellow-500" : "text-green-500"}>
                      {metrics.shouldReduceAnimations ? "Reduced" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Development Controls */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs border-t pt-2 space-y-2">
                    <div className="font-medium text-blue-600">Development Controls</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-6"
                      onClick={() => {
                        const current = localStorage.getItem('noma-dev-performance-override') === 'true';
                        localStorage.setItem('noma-dev-performance-override', (!current).toString());
                        window.location.reload();
                      }}
                    >
                      {localStorage.getItem('noma-dev-performance-override') === 'true'
                        ? 'Disable Override'
                        : 'Override Performance Limits'
                      }
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Override disables performance-based animation limiting
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Development-only performance overlay
export const PerformanceOverlay: React.FC = () => {
  const metrics = usePerformanceMonitor();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <PerformanceIndicator showDetails compact={false} />
    </div>
  );
};
