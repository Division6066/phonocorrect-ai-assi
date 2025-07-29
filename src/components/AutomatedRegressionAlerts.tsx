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
  Pulse as Activity,
  Bell,
  Download,
  ArrowClockwise as RefreshCw
} from "@phosphor-icons/react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { toast } from "sonner";

export function AutomatedRegressionAlerts() {
  const {
    currentMetrics,
    activeAlerts,
    resolvedAlerts,
    isMonitoring,
    alertThresholds,
    healthScore,
    resolveAlert,
    toggleMonitoring,
    updateAlertThresholds,
    generatePerformanceReport,
    baselines,
    criticalAlerts,
    warningAlerts
  } = usePerformanceMonitoring();

  const exportReport = () => {
    const report = generatePerformanceReport();
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Performance report exported');
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMetricStatus = (metricName: string, currentValue: number) => {
    const baseline = baselines.find(b => b.metric === metricName);
    if (!baseline) return 'unknown';

    const regressionPercent = Math.abs((currentValue - baseline.baseline) / baseline.baseline) * 100;
    
    if (regressionPercent >= alertThresholds.critical) return 'critical';
    if (regressionPercent >= alertThresholds.warning) return 'warning';
    return 'good';
  };

  return (
    <div className="space-y-6">
      {/* Performance Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getHealthColor(healthScore.score).split(' ')[0]}`}>
                  {healthScore.score}%
                </div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
              <Badge variant="outline" className={getHealthColor(healthScore.score)}>
                {healthScore.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
              </div>
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{warningAlerts}</div>
                <div className="text-sm text-muted-foreground">Warning Alerts</div>
              </div>
              <Bell size={24} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
                <div className="text-sm text-muted-foreground">Resolved Today</div>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity size={16} />
              Automated Performance Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "outline"}>
                {isMonitoring ? "Active" : "Paused"}
              </Badge>
              <Button size="sm" variant="outline" onClick={toggleMonitoring}>
                <RefreshCw size={14} className="mr-1" />
                {isMonitoring ? "Pause" : "Resume"}
              </Button>
              <Button size="sm" variant="outline" onClick={exportReport}>
                <Download size={14} className="mr-1" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warning Threshold ({alertThresholds.warning}%)</label>
              <input
                type="range"
                min="5"
                max="50"
                value={alertThresholds.warning}
                onChange={(e) => updateAlertThresholds({ ...alertThresholds, warning: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Trigger alerts when performance regresses by this percentage
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Critical Threshold ({alertThresholds.critical}%)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={alertThresholds.critical}
                onChange={(e) => updateAlertThresholds({ ...alertThresholds, critical: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Trigger critical alerts when performance regresses by this percentage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle size={16} />
              Active Performance Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <Alert 
                  key={alert.id} 
                  className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}
                >
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
                          <span className="text-xs font-mono">
                            -{alert.regressionPercent.toFixed(1)}%
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

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={16} />
            Real-time Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentMetrics).map(([key, value]) => {
              const baseline = baselines.find(b => b.metric === key);
              if (!baseline) return null;

              const status = getMetricStatus(key, value);
              const regressionPercent = Math.abs((value - baseline.baseline) / baseline.baseline) * 100;
              const isRegression = value > baseline.baseline;

              return (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-1">
                      {isRegression ? (
                        <TrendingUp size={12} className="text-red-500" />
                      ) : (
                        <TrendingDown size={12} className="text-green-500" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={
                          status === 'critical' ? 'text-red-600 bg-red-100' :
                          status === 'warning' ? 'text-yellow-600 bg-yellow-100' :
                          'text-green-600 bg-green-100'
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-mono">
                        {typeof value === 'number' && value < 1 && baseline.unit === '%' 
                          ? `${(value * 100).toFixed(1)}%` 
                          : `${value}${baseline.unit}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Baseline</span>
                      <span className="font-mono">
                        {typeof baseline.baseline === 'number' && baseline.baseline < 1 && baseline.unit === '%' 
                          ? `${(baseline.baseline * 100).toFixed(1)}%` 
                          : `${baseline.baseline}${baseline.unit}`
                        }
                      </span>
                    </div>
                    
                    <Progress 
                      value={Math.min(100, regressionPercent)} 
                      className="h-2"
                    />
                    
                    <div className="text-xs text-muted-foreground">
                      {isRegression ? 'Regression' : 'Improvement'}: {regressionPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
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
                    <span className="text-sm capitalize">
                      {alert.metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline" className="text-green-600 bg-green-100">
                      Resolved
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      -{alert.regressionPercent.toFixed(1)}%
                    </span>
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