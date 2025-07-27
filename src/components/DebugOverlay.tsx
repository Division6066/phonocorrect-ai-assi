import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  Lightning, 
  Eye, 
  EyeSlash,
  Gauge,
  Memory,
  Timer,
  Target
} from "@phosphor-icons/react";
import { usePerformanceOptimization } from '@/hooks/use-performance-optimization';

interface DebugOverlayProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  defaultVisible?: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ 
  position = 'bottom-right',
  defaultVisible = false 
}) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const { getCurrentStatus, performanceMetrics, formatBytes } = usePerformanceOptimization();
  
  const status = getCurrentStatus();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getAccelerationIcon = (accelerationId: string) => {
    switch (accelerationId) {
      case 'metal':
      case 'vulkan':
      case 'cuda':
      case 'webgpu':
        return <Lightning size={12} className="text-yellow-500" />;
      case 'cpu':
        return <Cpu size={12} className="text-gray-500" />;
      default:
        return <Cpu size={12} className="text-blue-500" />;
    }
  };

  const getAccelerationBadgeColor = (accelerationId: string) => {
    switch (accelerationId) {
      case 'metal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'vulkan':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cuda':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'webgpu':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'opencl':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'wasm-simd':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'cpu':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 70) return 'text-yellow-600';
    if (performance >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <Eye size={14} className="mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-xs`}>
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border">
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium">Performance Debug</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <EyeSlash size={12} />
            </Button>
          </div>

          {/* Acceleration Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getAccelerationIcon(status.accelerationId)}
              <Badge 
                variant="outline" 
                className={`text-xs ${getAccelerationBadgeColor(status.accelerationId)}`}
              >
                {status.acceleration}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div className={`font-medium ${getPerformanceColor(status.performance)}`}>
                {status.performance}% Performance
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Timer size={10} className="text-muted-foreground" />
                <span>Inference</span>
              </div>
              <span className="font-mono">
                {Math.round(performanceMetrics.inferenceTime)}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Memory size={10} className="text-muted-foreground" />
                <span>Memory</span>
              </div>
              <span className="font-mono">
                {formatBytes(performanceMetrics.memoryUsage * 1024 * 1024)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Target size={10} className="text-muted-foreground" />
                <span>Throughput</span>
              </div>
              <span className="font-mono">
                {Math.round(performanceMetrics.throughput)} tok/s
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Target size={10} className="text-muted-foreground" />
                <span>Accuracy</span>
              </div>
              <span className="font-mono">
                {Math.round(performanceMetrics.accuracy * 100)}%
              </span>
            </div>
          </div>

          {/* Real-time performance indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Real-time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};