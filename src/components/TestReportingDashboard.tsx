import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendUp as TrendingUp, 
  TrendDown as TrendingDown, 
  Warning as AlertTriangle,
  ArrowClockwise as RefreshCw,
  Browser as Chrome,
  Download,
  Globe,
  Monitor,
  DeviceMobile as Smartphone
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface TestResult {
  id: string;
  platform: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  timestamp: Date;
  coverage: number;
  failureCount: number;
  totalTests: number;
  passedTests: number;
  environment: string;
  branch: string;
  commit: string;
}

interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  duration: number;
  trend: 'up' | 'down' | 'stable';
}

interface PlatformMetrics {
  platform: string;
  icon: React.ReactNode;
  summary: TestSummary;
  color: string;
  recentRuns: TestResult[];
}

export function TestReportingDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock test data - in real implementation, this would come from your CI/CD system
  const generateMockResults = (): TestResult[] => {
    const platforms = ['iOS', 'Android', 'Web', 'Chrome Extension', 'Desktop'];
    const suites = ['Unit Tests', 'Integration Tests', 'E2E Tests', 'Performance Tests', 'Accessibility Tests'];
    const environments = ['development', 'staging', 'production'];
    const results: TestResult[] = [];

    platforms.forEach(platform => {
      suites.forEach(suite => {
        const baseSuccess = platform === 'iOS' ? 0.95 : platform === 'Android' ? 0.92 : 0.97;
        const totalTests = Math.floor(Math.random() * 50) + 20;
        const passedTests = Math.floor(totalTests * (baseSuccess + (Math.random() - 0.5) * 0.1));
        const failedTests = Math.floor((totalTests - passedTests) * 0.8);

        results.push({
          id: `${platform}-${suite}-${Date.now()}`,
          platform,
          suite,
          status: failedTests > 0 ? 'failed' : passedTests === totalTests ? 'passed' : 'skipped',
          duration: Math.floor(Math.random() * 300) + 30,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          coverage: Math.floor(Math.random() * 20) + 80,
          failureCount: failedTests,
          totalTests,
          passedTests,
          environment: environments[Math.floor(Math.random() * environments.length)],
          branch: Math.random() > 0.8 ? 'feature/ml-improvements' : 'main',
          commit: Math.random().toString(36).substring(2, 8)
        });
      });
    });

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const [testResults, setTestResults] = useState<TestResult[]>(generateMockResults());

  const calculatePlatformMetrics = (): PlatformMetrics[] => {
    const platforms = ['iOS', 'Android', 'Web', 'Chrome Extension', 'Desktop'];
    const platformIcons = {
      'iOS': <Smartphone size={16} />,
      'Android': <Smartphone size={16} />,
      'Web': <Globe size={16} />,
      'Chrome Extension': <Chrome size={16} />,
      'Desktop': <Monitor size={16} />
    };
    const platformColors = {
      'iOS': 'bg-blue-100 text-blue-800',
      'Android': 'bg-green-100 text-green-800',
      'Web': 'bg-purple-100 text-purple-800',
      'Chrome Extension': 'bg-yellow-100 text-yellow-800',
      'Desktop': 'bg-gray-100 text-gray-800'
    };

    return platforms.map(platform => {
      const platformResults = testResults.filter(r => r.platform === platform);
      const totalTests = platformResults.reduce((sum, r) => sum + r.totalTests, 0);
      const passedTests = platformResults.reduce((sum, r) => sum + r.passedTests, 0);
      const failedTests = platformResults.reduce((sum, r) => sum + r.failureCount, 0);
      const skippedTests = totalTests - passedTests - failedTests;
      const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      const duration = platformResults.reduce((sum, r) => sum + r.duration, 0);

      return {
        platform,
        icon: platformIcons[platform as keyof typeof platformIcons],
        summary: {
          totalTests,
          passedTests,
          failedTests,
          skippedTests,
          successRate,
          duration,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
        },
        color: platformColors[platform as keyof typeof platformColors],
        recentRuns: platformResults.slice(0, 5)
      };
    });
  };

  const platformMetrics = calculatePlatformMetrics();
  const overallMetrics = {
    totalTests: testResults.reduce((sum, r) => sum + r.totalTests, 0),
    passedTests: testResults.reduce((sum, r) => sum + r.passedTests, 0),
    failedTests: testResults.reduce((sum, r) => sum + r.failureCount, 0),
    totalDuration: testResults.reduce((sum, r) => sum + r.duration, 0),
    averageCoverage: testResults.length > 0 
      ? testResults.reduce((sum, r) => sum + r.coverage, 0) / testResults.length 
      : 0
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTestResults(generateMockResults());
      setLastUpdated(new Date());
      setIsRefreshing(false);
      toast.success('Test data refreshed');
    }, 2000);
  };

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      timeframe: selectedTimeframe,
      overallMetrics,
      platformMetrics,
      detailedResults: testResults
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Test report downloaded');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-green-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      case 'skipped': return <Clock size={16} className="text-yellow-600" />;
      default: return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-green-600" />;
      case 'down': return <TrendingDown size={14} className="text-red-600" />;
      default: return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" />;
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Test Reporting Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadReport}>
            <Download size={14} className="mr-1" />
            Export Report
          </Button>
          <Button size="sm" variant="outline" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw size={14} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{overallMetrics.totalTests}</p>
              </div>
              <CheckCircle size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((overallMetrics.passedTests / overallMetrics.totalTests) * 100)}%
                </p>
              </div>
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Coverage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(overallMetrics.averageCoverage)}%
                </p>
              </div>
              <Globe size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{Math.round(overallMetrics.totalDuration / 60)}m</p>
              </div>
              <Clock size={24} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeframe Selection */}
      <div className="flex gap-2">
        {(['24h', '7d', '30d'] as const).map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe === '24h' ? 'Last 24 Hours' : timeframe === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList>
          <TabsTrigger value="platforms">Platform Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Tests</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4">
            {platformMetrics.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {platform.icon}
                      {platform.platform}
                      <Badge variant="outline" className={platform.color}>
                        {platform.summary.totalTests} tests
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(platform.summary.trend)}
                      <span className="text-sm font-medium">
                        {Math.round(platform.summary.successRate)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{Math.round(platform.summary.successRate)}% Success Rate</span>
                      <span>{platform.summary.duration}s</span>
                    </div>
                    <Progress value={platform.summary.successRate} className="h-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Passed</p>
                      <p className="font-medium text-green-600">{platform.summary.passedTests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Failed</p>
                      <p className="font-medium text-red-600">{platform.summary.failedTests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skipped</p>
                      <p className="font-medium text-yellow-600">{platform.summary.skippedTests}</p>
                    </div>
                  </div>
                  
                  {/* Recent Runs */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Recent Runs</p>
                    <div className="space-y-1">
                      {platform.recentRuns.slice(0, 3).map((run) => (
                        <div key={run.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            <span>{run.suite}</span>
                            <Badge variant="outline" className="text-xs">
                              {run.environment}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">
                            {run.duration}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.slice(0, 20).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium text-sm">{result.platform} - {result.suite}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleString()} • Branch: {result.branch}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.environment}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{result.coverage}%</div>
                      <div className="text-xs text-muted-foreground">{result.duration}s</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platformMetrics.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        <span className="text-sm">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(platform.summary.trend)}
                        <span className="text-sm font-medium">
                          {Math.round(platform.summary.successRate)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Duration</span>
                    <span className="text-sm font-medium">{Math.round(overallMetrics.totalDuration / testResults.length)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Coverage Target</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Flaky Tests</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.filter(r => r.status === 'failed').slice(0, 10).map((result) => (
                  <Alert key={result.id}>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <strong>{result.platform} - {result.suite}</strong>
                          <br />
                          <span className="text-sm">Failed {result.failureCount} of {result.totalTests} tests</span>
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Branch: {result.branch} • Commit: {result.commit}
                          </span>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {result.timestamp.toLocaleTimeString()}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}