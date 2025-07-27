import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PerformanceMetrics {
  inferenceTime: number;
  memoryUsage: number;
  modelAccuracy: number;
  coldStartTime: number;
  gpuUtilization: number;
  batteryImpact: number;
}

interface PerformanceBaseline {
  metric: keyof PerformanceMetrics;
  baseline: number;
  threshold: number;
  unit: string;
}

interface PerformanceAlert {
  id: string;
  metric: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  regressionPercent: number;
  resolved: boolean;
}

const PERFORMANCE_BASELINES: PerformanceBaseline[] = [
  { metric: 'inferenceTime', baseline: 60, threshold: 100, unit: 'ms' },
  { metric: 'memoryUsage', baseline: 380, threshold: 500, unit: 'MB' },
  { metric: 'modelAccuracy', baseline: 0.94, threshold: 0.85, unit: '%' },
  { metric: 'coldStartTime', baseline: 0.8, threshold: 2.0, unit: 's' },
  { metric: 'gpuUtilization', baseline: 85, threshold: 60, unit: '%' },
  { metric: 'batteryImpact', baseline: 8, threshold: 15, unit: '%/hr' }
];

export function usePerformanceMonitoring() {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    inferenceTime: 85,
    memoryUsage: 420,
    modelAccuracy: 0.91,
    coldStartTime: 1.2,
    gpuUtilization: 75,
    batteryImpact: 12
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alertThresholds, setAlertThresholds] = useState({
    warning: 15, // 15% regression triggers warning
    critical: 30 // 30% regression triggers critical alert
  });

  // Simulate performance data collection
  const collectMetrics = useCallback(() => {
    if (!isMonitoring) return;

    // Simulate realistic performance variations
    setCurrentMetrics(prev => ({
      inferenceTime: prev.inferenceTime + (Math.random() - 0.5) * 10,
      memoryUsage: prev.memoryUsage + (Math.random() - 0.5) * 20,
      modelAccuracy: Math.max(0.8, Math.min(0.98, prev.modelAccuracy + (Math.random() - 0.5) * 0.02)),
      coldStartTime: Math.max(0.5, prev.coldStartTime + (Math.random() - 0.5) * 0.2),
      gpuUtilization: Math.max(50, Math.min(95, prev.gpuUtilization + (Math.random() - 0.5) * 5)),
      batteryImpact: Math.max(5, prev.batteryImpact + (Math.random() - 0.5) * 2)
    }));
  }, [isMonitoring]);

  // Check for performance regressions
  const checkForRegressions = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    PERFORMANCE_BASELINES.forEach(baseline => {
      const currentValue = metrics[baseline.metric];
      const regressionPercent = Math.abs((currentValue - baseline.baseline) / baseline.baseline) * 100;

      if (regressionPercent >= alertThresholds.warning) {
        const severity = regressionPercent >= alertThresholds.critical ? 'critical' : 'warning';
        
        // Check if we already have an unresolved alert for this metric
        const existingAlert = alerts.find(alert => 
          alert.metric === baseline.metric && !alert.resolved
        );

        if (!existingAlert) {
          const alert: PerformanceAlert = {
            id: `${baseline.metric}-${Date.now()}`,
            metric: baseline.metric,
            severity,
            message: `${baseline.metric} has regressed by ${regressionPercent.toFixed(1)}% from baseline (${baseline.baseline}${baseline.unit} → ${currentValue}${baseline.unit})`,
            timestamp: new Date(),
            regressionPercent,
            resolved: false
          };

          newAlerts.push(alert);
        }
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      
      // Show toast notifications for new alerts
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical') {
          toast.error(`Critical regression detected: ${alert.metric}`, {
            description: `Performance degraded by ${alert.regressionPercent.toFixed(1)}%`,
            duration: 10000
          });
        } else {
          toast.warning(`Performance warning: ${alert.metric}`, {
            description: `Performance degraded by ${alert.regressionPercent.toFixed(1)}%`,
            duration: 5000
          });
        }
      });
    }
  }, [alerts, alertThresholds]);

  // Resolve an alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success('Performance alert resolved');
  }, []);

  // Auto-resolve alerts when performance improves
  const autoResolveAlerts = useCallback((metrics: PerformanceMetrics) => {
    setAlerts(prev =>
      prev.map(alert => {
        if (alert.resolved) return alert;

        const baseline = PERFORMANCE_BASELINES.find(b => b.metric === alert.metric);
        if (!baseline) return alert;

        const currentValue = metrics[baseline.metric];
        const currentRegression = Math.abs((currentValue - baseline.baseline) / baseline.baseline) * 100;

        // Auto-resolve if regression is now below warning threshold
        if (currentRegression < alertThresholds.warning) {
          toast.info(`Performance improved: ${alert.metric} alert auto-resolved`);
          return { ...alert, resolved: true };
        }

        return alert;
      })
    );
  }, [alertThresholds]);

  // Generate performance report
  const generatePerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date(),
      metrics: currentMetrics,
      baselines: PERFORMANCE_BASELINES,
      activeAlerts: alerts.filter(alert => !alert.resolved),
      resolvedAlerts: alerts.filter(alert => alert.resolved),
      overallHealth: calculateOverallHealth(currentMetrics)
    };

    return report;
  }, [currentMetrics, alerts]);

  // Calculate overall performance health score
  const calculateOverallHealth = useCallback((metrics: PerformanceMetrics) => {
    let healthScore = 100;
    let issues = 0;

    PERFORMANCE_BASELINES.forEach(baseline => {
      const currentValue = metrics[baseline.metric];
      const regressionPercent = Math.abs((currentValue - baseline.baseline) / baseline.baseline) * 100;

      if (regressionPercent >= alertThresholds.critical) {
        healthScore -= 25;
        issues++;
      } else if (regressionPercent >= alertThresholds.warning) {
        healthScore -= 10;
        issues++;
      }
    });

    return {
      score: Math.max(0, healthScore),
      issues,
      status: healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : healthScore >= 50 ? 'fair' : 'poor'
    };
  }, [alertThresholds]);

  // Start/stop monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
    toast.info(`Performance monitoring ${!isMonitoring ? 'started' : 'paused'}`);
  }, [isMonitoring]);

  // Update alert thresholds
  const updateAlertThresholds = useCallback((newThresholds: { warning: number; critical: number }) => {
    setAlertThresholds(newThresholds);
    toast.success('Alert thresholds updated');
  }, []);

  // Set up monitoring interval
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      collectMetrics();
    }, 5000); // Collect metrics every 5 seconds

    return () => clearInterval(interval);
  }, [collectMetrics, isMonitoring]);

  // Check for regressions when metrics change
  useEffect(() => {
    checkForRegressions(currentMetrics);
    autoResolveAlerts(currentMetrics);
  }, [currentMetrics, checkForRegressions, autoResolveAlerts]);

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);
  const healthScore = calculateOverallHealth(currentMetrics);

  return {
    // State
    currentMetrics,
    alerts,
    activeAlerts,
    resolvedAlerts,
    isMonitoring,
    alertThresholds,
    healthScore,

    // Actions
    resolveAlert,
    toggleMonitoring,
    updateAlertThresholds,
    generatePerformanceReport,

    // Computed values
    baselines: PERFORMANCE_BASELINES,
    totalAlerts: alerts.length,
    criticalAlerts: activeAlerts.filter(alert => alert.severity === 'critical').length,
    warningAlerts: activeAlerts.filter(alert => alert.severity === 'warning').length
  };
}