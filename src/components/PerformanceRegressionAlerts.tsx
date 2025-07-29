import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Warning as AlertTriangle, 
  CheckCircle, 
  TrendDown as TrendingDown, 
  TrendUp as TrendingUp, 
  Clock, 
  Brain,
  Lightning as Zap,
  Eye,
  Bell,
  Pulse as Activity
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface PerformanceMetric {
  name: string;
  current: number;
  baseline: number;
  threshold: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  history: number[];
}

interface RegressionAlert {
  id: string;
  metric: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  regressionPercent: number;
}

export function PerformanceRegressionAlerts() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<RegressionAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alertThresholds, setAlertThresholds] = useState({
    warning: 15, // 15% regression triggers warning
    critical: 30 // 30% regression triggers critical alert
  });

  // Mock performance baselines
  const performanceBaselines: PerformanceMetric[] = [
    {
      name: 'Inference Time',
      current: 85,
      baseline: 60,
      threshold: 100,
      unit: 'ms',
      trend: 'up',
      status: 'warning',
      history: [60, 62, 58, 65, 72, 78, 85]
    },
    {
      name: 'Memory Usage',
      current: 420,
      baseline: 380,
      threshold: 500,
      unit: 'MB',
      trend: 'up',
      status: 'warning',
      history: [380, 385, 390, 395, 405, 415, 420]
    },
    {
      name: 'Model Accuracy',
      current: 0.91,
      baseline: 0.94,
      threshold: 0.85,
      unit: '%',
      trend: 'down',
      status: 'warning',
      history: [0.94, 0.93, 0.92, 0.91, 0.91, 0.91, 0.91]
    },
    {
      name: 'Cold Start Time',
      current: 1.2,
      baseline: 0.8,
      threshold: 2.0,
      unit: 's',
      trend: 'up',
      status: 'critical',
      history: [0.8, 0.85, 0.9, 1.0, 1.1, 1.15, 1.2]
    },
    {
      name: 'GPU Utilization',
      current: 75,
      baseline: 85,
      threshold: 60,
      unit: '%',
      trend: 'down',
      status: 'good',
      history: [85, 83, 80, 78, 76, 75, 75]
    },
    {
      name: 'Battery Impact',
      current: 12,
      baseline: 8,
      threshold: 15,
      unit: '%/hr',
      trend: 'up',
      status: 'warning',
      history: [8, 9, 10, 11, 11.5, 12, 12]
    }
  ];

  useEffect(() => {
    setMetrics(performanceBaselines);
    checkForRegressions(performanceBaselines);
  }, []);

  const checkForRegressions = (currentMetrics: PerformanceMetric[]) => {
    const newAlerts: RegressionAlert[] = [];

    currentMetrics.forEach(metric => {
      const regressionPercent = Math.abs((metric.current - metric.baseline) / metric.baseline) * 100;
      
      if (regressionPercent >= alertThresholds.warning) {
        const severity = regressionPercent >= alertThresholds.critical ? 'critical' : 'warning';
        
        newAlerts.push({
          id: `${metric.name}-${Date.now()}`,
          metric: metric.name,
          severity,
          message: `${metric.name} has regressed by ${regressionPercent.toFixed(1)}% from baseline (${metric.baseline}${metric.unit} → ${metric.current}${metric.unit})`,
          timestamp: new Date(),
          resolved: false,
          regressionPercent
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical') {
          toast.error(`Critical regression: ${alert.metric}`);
        } else {
          toast.warning(`Performance warning: ${alert.metric}`);
        }
      });
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success('Alert marked as resolved');
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'inference time':
      case 'cold start time':
        return <Clock size={16} />;
      case 'memory usage':
        return <Brain size={16} />;
      case 'model accuracy':
        return <Eye size={16} />;
      case 'gpu utilization':
        return <Zap size={16} />;
      case 'battery impact':
        return <Activity size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-red-500" />;
      case 'down':
        return <TrendingDown size={12} className="text-green-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
    }
  };

  const calculateProgress = (current: number, baseline: number, threshold: number) => {
    const range = Math.abs(threshold - baseline);
    const progress = Math.abs(current - baseline) / range * 100;
    return Math.min(progress, 100);
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="space-y-6">
      {/* Alert Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Performance Regression Alerts</h2>
            <p className="text-sm text-muted-foreground">
              Automated monitoring for performance degradation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "outline"}>
            {isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            <Settings size={14} className="mr-1" />
            Configure
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle size={16} />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                        className="ml-4"
                      >
                        Resolve
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={16} />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    <span className="font-medium text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <Badge variant="outline" className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-mono">{metric.current}{metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Baseline</span>
                    <span className="font-mono">{metric.baseline}{metric.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Threshold</span>
                    <span className="font-mono">{metric.threshold}{metric.unit}</span>
                  </div>
                  
                  <Progress 
                    value={calculateProgress(metric.current, metric.baseline, metric.threshold)}
                    className="h-2"
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    Regression: {Math.abs((metric.current - metric.baseline) / metric.baseline * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={16} />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warning Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={alertThresholds.warning}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, warning: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12">{alertThresholds.warning}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trigger warning when performance regresses by this percentage
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Critical Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={alertThresholds.critical}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, critical: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12">{alertThresholds.critical}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trigger critical alert when performance regresses by this percentage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={16} />
              Recently Resolved ({resolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-sm">{alert.metric}</span>
                    <Badge variant="outline" className="text-green-600 bg-green-100">
                      Resolved
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}