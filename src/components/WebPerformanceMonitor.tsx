import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Square, Trash, Warning as AlertTriangle, CheckCircle, Clock, Lightning as Zap, HardDrives as MemoryStick } from "@phosphor-icons/react";
import { useWebPerformance } from "@/hooks/use-web-performance";

export function WebPerformanceMonitor() {
  const {
    vitals,
    profiles,
    isProfilerRunning,
    currentProfile,
    startProfiler,
    stopProfiler,
    markPerformance,
    measurePerformance,
    getPerformanceSnapshot,
    clearProfiles,
    getRecommendations
  } = useWebPerformance();

  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);

  // Update realtime metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setRealtimeMetrics(getPerformanceSnapshot());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [getPerformanceSnapshot]);

  // Mock ML inference timing
  useEffect(() => {
    if (isProfilerRunning) {
      const simulateInference = () => {
        markPerformance('inference_start');
        setTimeout(() => {
          markPerformance('inference_end');
          measurePerformance('ml_inference', 'inference_start', 'inference_end');
        }, Math.random() * 200 + 50);
      };

      const interval = setInterval(simulateInference, 2000);
      return () => clearInterval(interval);
    }
  }, [isProfilerRunning, markPerformance, measurePerformance]);

  const getVitalRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVitalIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle size={14} className="text-green-600" />;
      case 'needs-improvement': return <Clock size={14} className="text-yellow-600" />;
      case 'poor': return <AlertTriangle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Profiler Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={16} />
            Performance Profiler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={isProfilerRunning ? stopProfiler : startProfiler}
              variant={isProfilerRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isProfilerRunning ? (
                <>
                  <Square size={14} />
                  Stop Profiling
                </>
              ) : (
                <>
                  <Play size={14} />
                  Start Profiling
                </>
              )}
            </Button>
            
            {profiles.length > 0 && (
              <Button
                onClick={clearProfiles}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 size={14} />
                Clear ({profiles.length})
              </Button>
            )}

            {isProfilerRunning && currentProfile && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Recording: {formatDuration(Date.now() - currentProfile.timestamp)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vitals.map((vital) => (
              <div key={vital.name} className={`p-3 rounded-lg border ${getVitalRatingColor(vital.rating)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{vital.name}</span>
                  {getVitalIcon(vital.rating)}
                </div>
                <div className="text-lg font-bold">{Math.round(vital.value)}ms</div>
                <div className="text-xs opacity-75 capitalize">{vital.rating.replace('-', ' ')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick size={16} />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Navigation Timing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DOM Complete:</span>
                    <span>{formatDuration(realtimeMetrics.navigation.domComplete)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Byte:</span>
                    <span>{formatDuration(realtimeMetrics.navigation.firstByte)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Event:</span>
                    <span>{formatDuration(realtimeMetrics.navigation.load)}</span>
                  </div>
                </div>
              </div>

              {realtimeMetrics.memory && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Memory Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used:</span>
                      <span>{formatBytes(realtimeMetrics.memory.usedJSHeapSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span>{formatBytes(realtimeMetrics.memory.totalJSHeapSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Limit:</span>
                      <span>{formatBytes(realtimeMetrics.memory.jsHeapSizeLimit)}</span>
                    </div>
                    <Progress 
                      value={(realtimeMetrics.memory.usedJSHeapSize / realtimeMetrics.memory.jsHeapSizeLimit) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile History */}
      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profiling Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles.slice(-5).reverse().map((profile, index) => (
                <div key={profile.timestamp} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      Session {profiles.length - index}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        profile.energyImpact === 'high' ? 'text-red-600 bg-red-50' :
                        profile.energyImpact === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                        'text-green-600 bg-green-50'
                      }>
                        {profile.energyImpact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(profile.duration)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Marks:</span>
                      <span className="ml-1 font-medium">{Object.keys(profile.marks).length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Measures:</span>
                      <span className="ml-1 font-medium">{Object.keys(profile.measures).length}</span>
                    </div>
                    {profile.measures.ml_inference && (
                      <div>
                        <span className="text-muted-foreground">ML Inference:</span>
                        <span className="ml-1 font-medium">{formatDuration(profile.measures.ml_inference)}</span>
                      </div>
                    )}
                    {profile.memoryUsage && (
                      <div>
                        <span className="text-muted-foreground">Memory:</span>
                        <span className="ml-1 font-medium">{formatBytes(profile.memoryUsage.usedJSHeapSize)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Performance Recommendations:</strong>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}