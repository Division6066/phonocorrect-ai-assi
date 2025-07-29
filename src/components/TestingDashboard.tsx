import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TestTube, 
  DeviceMobile as Smartphone, 
  Globe, 
  PuzzlePiece as Puzzle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  Square,
  Cpu as Apple,
  Browser as Chrome, 
  Play,
  Download,
  GitBranch,
  Monitor,
  ChartLine,
  Bell
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { TestReportingDashboard } from "./TestReportingDashboard";
import { PerformanceRegressionAlerts } from "./PerformanceRegressionAlerts";

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  error?: string;
  platform: string;
  coverage?: number;
}

interface TestSuite {
  name: string;
  type: 'detox' | 'playwright' | 'jest';
  platform: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
}

export function TestingDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Mock test data
  useEffect(() => {
    const mockTestSuites: TestSuite[] = [
      {
        name: 'Mobile End-to-End Tests',
        type: 'detox',
        platform: 'mobile',
        totalTests: 12,
        passedTests: 11,
        failedTests: 1,
        coverage: 94,
        tests: [
          {
            name: 'Phonetic Correction: "fone" → "phone"',
            status: 'passed',
            duration: 2.3,
            platform: 'iOS 17'
          },
          {
            name: 'Keyboard Integration Test',
            status: 'passed',
            duration: 1.8,
            platform: 'iOS 16'
          },
          {
            name: 'Multi-language Input Handling',
            status: 'failed',
            duration: 3.1,
            platform: 'Android API 34',
            error: 'Timeout waiting for suggestion popup'
          },
          {
            name: 'Suggestion Acceptance Flow',
            status: 'passed',
            duration: 2.0,
            platform: 'Android API 26'
          }
        ]
      },
      {
        name: 'Web Application Tests',
        type: 'playwright',
        platform: 'web',
        totalTests: 18,
        passedTests: 17,
        failedTests: 1,
        coverage: 92,
        tests: [
          {
            name: 'Real-time Correction Display',
            status: 'passed',
            duration: 1.5,
            platform: 'Chromium'
          },
          {
            name: 'Language Switching',
            status: 'passed',
            duration: 0.9,
            platform: 'Firefox'
          },
          {
            name: 'Performance Optimization Panel',
            status: 'passed',
            duration: 2.1,
            platform: 'Safari'
          },
          {
            name: 'Model Quantization Comparison',
            status: 'failed',
            duration: 4.2,
            platform: 'Chromium',
            error: 'Chart rendering timeout'
          }
        ]
      },
      {
        name: 'Chrome Extension Tests',
        type: 'playwright',
        platform: 'extension',
        totalTests: 8,
        passedTests: 8,
        failedTests: 0,
        coverage: 96,
        tests: [
          {
            name: 'Popup Interface Loading',
            status: 'passed',
            duration: 0.7,
            platform: 'Chrome MV3'
          },
          {
            name: 'Content Script Injection',
            status: 'passed',
            duration: 1.2,
            platform: 'Chrome MV3'
          },
          {
            name: 'Cross-Site Correction',
            status: 'passed',
            duration: 1.8,
            platform: 'Chrome MV3'
          }
        ]
      },
      {
        name: 'Custom Rule Engine Tests',
        type: 'jest',
        platform: 'core',
        totalTests: 45,
        passedTests: 43,
        failedTests: 2,
        coverage: 98,
        tests: [
          {
            name: 'Phonetic Pattern Matching',
            status: 'passed',
            duration: 0.02,
            platform: 'Node.js'
          },
          {
            name: 'Custom Rule Priority',
            status: 'passed',
            duration: 0.03,
            platform: 'Node.js'
          },
          {
            name: 'Regex Rule Validation',
            status: 'failed',
            duration: 0.05,
            platform: 'Node.js',
            error: 'Invalid regex pattern for edge case'
          },
          {
            name: 'Multi-language Rule Sets',
            status: 'failed',
            duration: 0.04,
            platform: 'Node.js',
            error: 'Hebrew character set not loaded'
          }
        ]
      }
    ];

    setTestSuites(mockTestSuites);
  }, []);

  const runTestSuite = (suiteName: string) => {
    setIsRunning(true);
    toast.info(`Running ${suiteName}...`);
    
    // Simulate test execution
    setTimeout(() => {
      setIsRunning(false);
      toast.success(`${suiteName} completed`);
    }, 3000);
  };

  const runAllTests = () => {
    setIsRunning(true);
    toast.info('Running full test suite...');
    
    setTimeout(() => {
      setIsRunning(false);
      toast.success('All tests completed');
    }, 8000);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'running':
        return <Clock size={16} className="text-blue-600 animate-spin" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getTypeIcon = (type: TestSuite['type']) => {
    switch (type) {
      case 'detox':
        return <Smartphone size={16} />;
      case 'playwright':
        return <Globe size={16} />;
      case 'jest':
        return <Puzzle size={16} />;
      default:
        return <TestTube size={16} />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform.includes('iOS')) return <Apple size={14} />;
    if (platform.includes('Android')) return <Monitor size={14} />;
    if (platform.includes('Chrome')) return <Chrome size={14} />;
    return <Globe size={14} />;
  };

  const filteredSuites = selectedPlatform === 'all' 
    ? testSuites 
    : testSuites.filter(suite => suite.platform === selectedPlatform);

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const averageCoverage = testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube size={24} />
            Testing Dashboard
          </h2>
          <p className="text-muted-foreground">
            Comprehensive test coverage across mobile, web, and extension platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={runAllTests}
            disabled={isRunning}
          >
            <Play size={14} className="mr-1" />
            Run All Tests
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <div className="text-sm text-muted-foreground">Tests Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-muted-foreground">Tests Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalTests}</div>
            <div className="text-sm text-muted-foreground">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{Math.round(averageCoverage)}%</div>
            <div className="text-sm text-muted-foreground">Avg Coverage</div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2">
        {['all', 'mobile', 'web', 'extension', 'core'].map((platform) => (
          <Button
            key={platform}
            variant={selectedPlatform === platform ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPlatform(platform)}
          >
            {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Button>
        ))}
      </div>

      {/* Test Suites */}
      <div className="space-y-4">
        {filteredSuites.map((suite, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suite.type)}
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                  <Badge variant="outline">
                    {suite.type.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {suite.platform}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={suite.failedTests > 0 ? "destructive" : "default"}>
                    {suite.passedTests}/{suite.totalTests} passed
                  </Badge>
                  <Badge variant="outline">
                    {suite.coverage}% coverage
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => runTestSuite(suite.name)}
                    disabled={isRunning}
                  >
                    <Play size={14} />
                  </Button>
                </div>
              </div>
              <Progress 
                value={(suite.passedTests / suite.totalTests) * 100} 
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suite.tests.map((test, testIndex) => (
                  <div key={testIndex} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="text-sm font-medium">{test.name}</span>
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(test.platform)}
                        <span className="text-xs text-muted-foreground">{test.platform}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.duration && (
                        <span className="text-xs text-muted-foreground">
                          {test.duration}s
                        </span>
                      )}
                      {test.error && (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CI/CD Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch size={16} />
            CI/CD Test Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Matrix Testing Configured:</strong> Tests run across iOS 17 & 16, Android API 26 & 34, and Chromium stable.
                All platforms must pass before deployment.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Apple size={14} />
                  <span className="text-sm font-medium">iOS 17</span>
                </div>
                <div className="text-xs text-green-600">✓ 12/12 tests passed</div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Apple size={14} />
                  <span className="text-sm font-medium">iOS 16</span>
                </div>
                <div className="text-xs text-green-600">✓ 12/12 tests passed</div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor size={14} />
                  <span className="text-sm font-medium">Android API 34</span>
                </div>
                <div className="text-xs text-yellow-600">⚠ 11/12 tests passed</div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor size={14} />
                  <span className="text-sm font-medium">Android API 26</span>
                </div>
                <div className="text-xs text-green-600">✓ 12/12 tests passed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Tabs defaultValue="detox" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detox">Detox (Mobile)</TabsTrigger>
          <TabsTrigger value="playwright">Playwright (Web)</TabsTrigger>
          <TabsTrigger value="jest">Jest (Unit)</TabsTrigger>
        </TabsList>

        <TabsContent value="detox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile End-to-End Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>✓ iOS Simulator tests: iPhone 14 Pro (iOS 17), iPhone 12 (iOS 16)</div>
                  <div>✓ Android Emulator tests: API 34 (Android 14), API 26 (Android 8)</div>
                  <div>✓ Keyboard integration: Custom iOS keyboard + Android IME</div>
                  <div>✓ Core test: Type "fone" → expect "phone" suggestion</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tests run on actual device simulators/emulators to verify real-world keyboard behavior
                  and phonetic correction accuracy across different OS versions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playwright" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web & Extension Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>✓ Web app tests: Chromium, Firefox, Safari</div>
                  <div>✓ Chrome extension popup: MV3 compatibility</div>
                  <div>✓ Content script injection: Cross-site correction</div>
                  <div>✓ Performance testing: Model quantization comparison</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cross-browser testing ensures consistent behavior across different web engines,
                  with special focus on Chrome extension manifest V3 compatibility.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Test Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>✓ Custom rule engine: Pattern matching logic</div>
                  <div>✓ Phonetic algorithms: Correction confidence scoring</div>
                  <div>✓ Multi-language support: Rule precedence testing</div>
                  <div>✓ Performance benchmarks: Inference time validation</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comprehensive unit testing of the core correction algorithms ensures accuracy
                  and performance across different languages and custom user rules.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comprehensive Test Reporting Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={16} />
            Test Reporting & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TestReportingDashboard />
        </CardContent>
      </Card>

      {/* Performance Regression Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={16} />
            Performance Regression Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceRegressionAlerts />
        </CardContent>
      </Card>
    </div>
  );
}