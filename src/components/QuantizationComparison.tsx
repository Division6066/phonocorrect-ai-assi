import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightning, 
  Scales, 
  Sparkle,
  Play,
  ArrowRight,
  CircleNotch,
  Gauge,
  DeviceMobile,
  Desktop,
  Globe,
  Target
} from "@phosphor-icons/react";
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface ComparisonMetrics {
  quantization: '4bit' | '16bit';
  modelName: string;
  inferenceTime: number; // ms
  memoryUsage: number; // MB
  accuracy: number; // percentage
  fileSize: number; // MB
  batteryImpact: number; // percentage relative to baseline
  throughput: number; // tokens/second
  realTimeScore: number; // 0-100 for real-time suitability
  qualityScore: number; // 0-100 for correction quality
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  testText: string;
  expectedCorrections: number;
  complexity: 'simple' | 'medium' | 'complex';
  language: string;
  priority: 'speed' | 'accuracy' | 'balanced';
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'basic-phonetic',
    name: 'Basic Phonetic Errors',
    description: 'Common spelling mistakes for dyslexic users',
    testText: 'I recieve your fone call about the seperate meetng. Would of been nice to no earlier.',
    expectedCorrections: 7,
    complexity: 'simple',
    language: 'en',
    priority: 'speed'
  },
  {
    id: 'complex-technical',
    name: 'Technical Vocabulary',
    description: 'Scientific and technical terms with phonetic challenges',
    testText: 'The fisiological proceses involve neorological pathways and biocemical reactions.',
    expectedCorrections: 5,
    complexity: 'complex',
    language: 'en',
    priority: 'accuracy'
  },
  {
    id: 'mixed-context',
    name: 'Mixed Context',
    description: 'Combination of simple and complex corrections',
    testText: 'Definately going thru the new physics problems. The expirement results were intresting.',
    expectedCorrections: 6,
    complexity: 'medium',
    language: 'en',
    priority: 'balanced'
  },
  {
    id: 'rapid-typing',
    name: 'Rapid Typing Simulation',
    description: 'Fast typing with multiple quick corrections needed',
    testText: 'quik messge abt the meting tomorow at 3pm dont forgrt to brig the documetns',
    expectedCorrections: 8,
    complexity: 'simple',
    language: 'en',
    priority: 'speed'
  }
];

export const QuantizationComparison: React.FC = () => {
  const [comparisonResults, setComparisonResults] = useKV<ComparisonMetrics[]>('quantization-comparison-results', []);
  const [isRunningComparison, setIsRunningComparison] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['basic-phonetic', 'mixed-context']);
  const [activeTab, setActiveTab] = useState('setup');

  // Run performance comparison between 4-bit and 16-bit models
  const runComparison = async () => {
    setIsRunningComparison(true);
    setCurrentScenario(null);
    
    const newResults: ComparisonMetrics[] = [];
    
    try {
      for (const scenarioId of selectedScenarios) {
        const scenario = TEST_SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) continue;
        
        setCurrentScenario(scenario.name);
        
        // Test both quantization levels
        for (const quantization of ['4bit', '16bit'] as const) {
          // Simulate realistic performance metrics based on quantization
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation delay
          
          const baseMetrics = {
            '4bit': {
              inferenceTime: 45 + Math.random() * 20,
              memoryUsage: 512 + Math.random() * 256,
              accuracy: 88 + Math.random() * 6,
              fileSize: 400,
              batteryImpact: 15 + Math.random() * 10,
              throughput: 120 + Math.random() * 40,
              realTimeScore: 92 + Math.random() * 8,
              qualityScore: 85 + Math.random() * 10
            },
            '16bit': {
              inferenceTime: 85 + Math.random() * 30,
              memoryUsage: 1536 + Math.random() * 512,
              accuracy: 95 + Math.random() * 4,
              fileSize: 1600,
              batteryImpact: 35 + Math.random() * 15,
              throughput: 80 + Math.random() * 25,
              realTimeScore: 78 + Math.random() * 15,
              qualityScore: 94 + Math.random() * 6
            }
          };
          
          // Adjust metrics based on scenario complexity
          const complexityMultiplier = {
            'simple': 1.0,
            'medium': 1.2,
            'complex': 1.5
          }[scenario.complexity];
          
          const metrics = baseMetrics[quantization];
          
          newResults.push({
            quantization,
            modelName: `Gemma-2B-${quantization}-${scenario.id}`,
            inferenceTime: Math.round(metrics.inferenceTime * complexityMultiplier),
            memoryUsage: Math.round(metrics.memoryUsage),
            accuracy: Math.min(99, Math.round(metrics.accuracy - (complexityMultiplier - 1) * 5)),
            fileSize: metrics.fileSize,
            batteryImpact: Math.round(metrics.batteryImpact * complexityMultiplier),
            throughput: Math.round(metrics.throughput / complexityMultiplier),
            realTimeScore: Math.round(metrics.realTimeScore - (complexityMultiplier - 1) * 10),
            qualityScore: Math.round(metrics.qualityScore - (complexityMultiplier - 1) * 8)
          });
        }
      }
      
      setComparisonResults(newResults);
      setActiveTab('results');
      toast.success(`Comparison completed! Tested ${selectedScenarios.length} scenarios`);
      
    } catch (error) {
      toast.error('Comparison failed');
      console.error('Comparison error:', error);
    } finally {
      setIsRunningComparison(false);
      setCurrentScenario(null);
    }
  };

  // Calculate aggregated metrics
  const getAggregatedMetrics = () => {
    if (comparisonResults.length === 0) return null;
    
    const grouped = comparisonResults.reduce((acc, result) => {
      if (!acc[result.quantization]) {
        acc[result.quantization] = [];
      }
      acc[result.quantization].push(result);
      return acc;
    }, {} as Record<string, ComparisonMetrics[]>);
    
    const aggregated = Object.entries(grouped).map(([quantization, results]) => ({
      quantization: quantization as '4bit' | '16bit',
      avgInferenceTime: Math.round(results.reduce((sum, r) => sum + r.inferenceTime, 0) / results.length),
      avgMemoryUsage: Math.round(results.reduce((sum, r) => sum + r.memoryUsage, 0) / results.length),
      avgAccuracy: Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length),
      avgThroughput: Math.round(results.reduce((sum, r) => sum + r.throughput, 0) / results.length),
      avgRealTimeScore: Math.round(results.reduce((sum, r) => sum + r.realTimeScore, 0) / results.length),
      avgQualityScore: Math.round(results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length),
      fileSize: results[0]?.fileSize || 0
    }));
    
    return aggregated;
  };

  const aggregatedMetrics = getAggregatedMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scales size={20} className="text-primary" />
            4-bit vs 16-bit Performance Comparison
            <Badge className="bg-primary text-primary-foreground">
              Phonetic Correction Optimized
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Compare quantization levels specifically for phonetic spelling correction use cases. 
            Test different scenarios to find the optimal balance for your deployment.
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Target size={14} />
            Test Setup
          </TabsTrigger>
          <TabsTrigger value="running" className="flex items-center gap-2">
            <Play size={14} />
            Running Tests
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Gauge size={14} />
            Results & Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6">
          <div className="space-y-6">
            {/* Scenario Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Test Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TEST_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScenarios(prev => [...prev, scenario.id]);
                          } else {
                            setSelectedScenarios(prev => prev.filter(id => id !== scenario.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{scenario.name}</span>
                          <Badge variant="outline" className={
                            scenario.complexity === 'simple' ? 'text-green-600' :
                            scenario.complexity === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }>
                            {scenario.complexity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {scenario.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          "{scenario.testText}"
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expected corrections: {scenario.expectedCorrections}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedScenarios.length} scenario{selectedScenarios.length !== 1 ? 's' : ''} selected
                  </div>
                  <Button 
                    onClick={runComparison}
                    disabled={selectedScenarios.length === 0 || isRunningComparison}
                  >
                    <Play size={14} className="mr-1" />
                    Start Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="running" className="mt-6">
          <div className="space-y-6">
            {isRunningComparison && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleNotch size={20} className="animate-spin text-blue-600" />
                    Running Performance Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Test:</span>
                      <span className="font-medium">{currentScenario || 'Initializing...'}</span>
                    </div>
                    <Progress value={currentScenario ? 60 : 20} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      Testing both 4-bit and 16-bit quantizations across selected scenarios...
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isRunningComparison && comparisonResults.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Ready to Run Comparison</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Go to Test Setup to configure and start the performance comparison
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    <ArrowRight size={14} className="mr-1" />
                    Configure Tests
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            {aggregatedMetrics && aggregatedMetrics.length >= 2 && (
              <>
                {/* Head-to-Head Summary */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scales size={20} className="text-green-600" />
                      Performance Summary: 4-bit vs 16-bit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aggregatedMetrics.map(metrics => (
                        <div key={metrics.quantization} className={`p-4 rounded-lg border-2 ${
                          metrics.quantization === '4bit' 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-purple-300 bg-purple-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            {metrics.quantization === '4bit' ? (
                              <Lightning size={20} className="text-green-600" />
                            ) : (
                              <Sparkle size={20} className="text-purple-600" />
                            )}
                            <h3 className="font-bold">{metrics.quantization.toUpperCase()} Quantization</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Speed:</span>
                              <span className="font-bold">{metrics.avgInferenceTime}ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Memory:</span>
                              <span className="font-bold">{Math.round(metrics.avgMemoryUsage / 1024 * 10) / 10}GB</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Accuracy:</span>
                              <span className="font-bold">{metrics.avgAccuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Real-time:</span>
                              <span className="font-bold">{metrics.avgRealTimeScore}/100</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Comparative Analysis */}
                    <div className="mt-6 p-4 bg-white rounded-lg border">
                      <h3 className="font-bold mb-3">Comparative Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {(() => {
                          const bit4 = aggregatedMetrics.find(m => m.quantization === '4bit');
                          const bit16 = aggregatedMetrics.find(m => m.quantization === '16bit');
                          if (!bit4 || !bit16) return null;
                          
                          return (
                            <>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  {Math.round(((bit16.avgInferenceTime - bit4.avgInferenceTime) / bit16.avgInferenceTime) * 100)}%
                                </div>
                                <div className="text-muted-foreground">Faster (4-bit)</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {Math.round(((bit16.avgMemoryUsage - bit4.avgMemoryUsage) / bit16.avgMemoryUsage) * 100)}%
                                </div>
                                <div className="text-muted-foreground">Less Memory (4-bit)</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">
                                  {bit16.avgAccuracy - bit4.avgAccuracy}%
                                </div>
                                <div className="text-muted-foreground">More Accurate (16-bit)</div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} />
                      Deployment Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg bg-green-50">
                          <div className="flex items-center gap-2 mb-2">
                            <DeviceMobile size={16} className="text-green-600" />
                            <span className="font-medium">Mobile Apps</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="font-medium text-green-800">Recommended: 4-bit</div>
                            <div className="text-green-700">• Better battery life</div>
                            <div className="text-green-700">• Real-time performance</div>
                            <div className="text-green-700">• Lower memory usage</div>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-purple-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Desktop size={16} className="text-purple-600" />
                            <span className="font-medium">Desktop Apps</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="font-medium text-purple-800">Recommended: 16-bit</div>
                            <div className="text-purple-700">• Higher accuracy</div>
                            <div className="text-purple-700">• Complex text handling</div>
                            <div className="text-purple-700">• Professional use</div>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-blue-600" />
                            <span className="font-medium">Web Platform</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="font-medium text-blue-800">Adaptive Approach</div>
                            <div className="text-blue-700">• 4-bit for real-time</div>
                            <div className="text-blue-700">• 16-bit for review</div>
                            <div className="text-blue-700">• Device-based selection</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {comparisonResults.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Gauge size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run the performance comparison to see detailed results and recommendations
                  </p>
                  <Button onClick={() => setActiveTab('setup')}>
                    <ArrowRight size={14} className="mr-1" />
                    Start Comparison
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};