import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Trash,
  Play,
  Stop,
  CircleNotch,
  Lightning,
  Cpu,
  Gauge,
  ArrowRight,
  ChartBar,
  Clock,
  Database,
  Sparkle,
  CloudArrowDown,
  HardDrives,
  Scales
} from "@phosphor-icons/react";
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Model quantization configurations
const QUANTIZATION_LEVELS = {
  '4bit': {
    name: '4-bit Quantization',
    description: 'Extremely compressed, fastest inference, lowest accuracy',
    compression: 8, // 8x smaller than FP32
    speed: 5, // 5x faster
    accuracy: 85,
    memoryUsage: 0.5, // GB
    fileSize: 400, // MB
    color: 'green',
    icon: Lightning,
    pros: ['Fastest inference', 'Lowest memory usage', 'Mobile-friendly'],
    cons: ['Reduced accuracy', 'Potential quality loss', 'Limited precision']
  },
  '8bit': {
    name: '8-bit Quantization', 
    description: 'Balanced compression and quality',
    compression: 4, // 4x smaller than FP32
    speed: 3, // 3x faster
    accuracy: 92,
    memoryUsage: 1.0, // GB
    fileSize: 800, // MB
    color: 'blue',
    icon: Scales,
    pros: ['Good balance', 'Reasonable accuracy', 'Moderate memory usage'],
    cons: ['Still some quality loss', 'Larger than 4-bit', 'Moderate speed']
  },
  '16bit': {
    name: '16-bit (Half Precision)',
    description: 'High quality with moderate compression',
    compression: 2, // 2x smaller than FP32
    speed: 1.5, // 1.5x faster
    accuracy: 97,
    memoryUsage: 2.0, // GB
    fileSize: 1600, // MB
    color: 'purple',
    icon: Sparkle,
    pros: ['High accuracy', 'Minimal quality loss', 'Good for production'],
    cons: ['Larger size', 'Higher memory usage', 'Slower than quantized']
  },
  'fp32': {
    name: '32-bit (Full Precision)',
    description: 'Original model quality, largest size',
    compression: 1, // Original size
    speed: 1, // Baseline speed
    accuracy: 100,
    memoryUsage: 4.0, // GB
    fileSize: 3200, // MB
    color: 'amber',
    icon: Database,
    pros: ['Maximum accuracy', 'Original quality', 'No precision loss'],
    cons: ['Largest size', 'Highest memory usage', 'Slowest inference']
  }
};

// Mock model configurations for different quantization levels
const MODEL_VARIANTS = {
  'gemma-2b': {
    name: 'Gemma 2B',
    type: 'Language Model',
    baseSize: 2.5 * 1024 * 1024 * 1024, // 2.5GB
    variants: Object.keys(QUANTIZATION_LEVELS)
  },
  'whisper-base': {
    name: 'Whisper Base',
    type: 'Speech-to-Text',
    baseSize: 290 * 1024 * 1024, // 290MB
    variants: Object.keys(QUANTIZATION_LEVELS)
  },
  'coqui-tts': {
    name: 'Coqui TTS',
    type: 'Text-to-Speech',
    baseSize: 150 * 1024 * 1024, // 150MB
    variants: Object.keys(QUANTIZATION_LEVELS)
  }
};

interface DownloadProgress {
  modelId: string;
  quantization: string;
  progress: number;
  speed: number; // MB/s
  estimatedTime: number; // seconds
  status: string;
}

interface BenchmarkResult {
  modelId: string;
  quantization: string;
  inferenceTime: number; // ms
  memoryUsage: number; // MB
  accuracy: number; // percentage
  throughput: number; // tokens/second
  timestamp: number;
}

export const ModelQuantizationPanel: React.FC = () => {
  const [downloadedModels, setDownloadedModels] = useKV('downloaded-quantized-models', [] as string[]);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useKV('quantization-benchmarks', [] as BenchmarkResult[]);
  const [selectedModel, setSelectedModel] = useState<string>('gemma-2b');
  const [activeTab, setActiveTab] = useState('download');
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Download model with quantization
  const downloadModel = async (modelId: string, quantization: string) => {
    const modelConfig = MODEL_VARIANTS[modelId];
    const quantConfig = QUANTIZATION_LEVELS[quantization];
    const totalSize = Math.round(modelConfig.baseSize / quantConfig.compression);
    const downloadId = `${modelId}-${quantization}`;

    if (downloadedModels.includes(downloadId)) {
      toast.info('Model already downloaded');
      return;
    }

    setDownloadProgress({
      modelId: downloadId,
      quantization,
      progress: 0,
      speed: 0,
      estimatedTime: 0,
      status: 'Initializing download...'
    });

    // Simulate download progress
    const startTime = Date.now();
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (!prev) return null;
        
        const elapsed = (Date.now() - startTime) / 1000;
        const newProgress = Math.min(prev.progress + Math.random() * 3 + 1, 100);
        const bytesDownloaded = (newProgress / 100) * totalSize;
        const speed = bytesDownloaded / elapsed / 1024 / 1024; // MB/s
        const remaining = totalSize - bytesDownloaded;
        const estimatedTime = remaining / (speed * 1024 * 1024);

        return {
          ...prev,
          progress: newProgress,
          speed,
          estimatedTime,
          status: newProgress < 100 ? 'Downloading...' : 'Finalizing...'
        };
      });
    }, 200);

    // Complete download after simulation
    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(null);
      setDownloadedModels(prev => [...prev, downloadId]);
      toast.success(`${quantConfig.name} model downloaded successfully!`);
    }, 3000 + Math.random() * 2000);
  };

  // Delete model
  const deleteModel = (modelId: string) => {
    setDownloadedModels(prev => prev.filter(id => id !== modelId));
    toast.success('Model deleted');
  };

  // Run benchmark comparison
  const runBenchmark = async (modelId: string) => {
    setIsRunningBenchmark(true);
    
    // Get downloaded variants for this model
    const modelVariants = downloadedModels.filter(id => id.startsWith(modelId));
    
    if (modelVariants.length === 0) {
      toast.error('No models downloaded for benchmarking');
      setIsRunningBenchmark(false);
      return;
    }

    const newResults: BenchmarkResult[] = [];

    for (const variant of modelVariants) {
      const [model, quantization] = variant.split('-').slice(-1);
      const quantConfig = QUANTIZATION_LEVELS[quantization] || QUANTIZATION_LEVELS['8bit'];
      
      // Simulate benchmark
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: BenchmarkResult = {
        modelId: variant,
        quantization,
        inferenceTime: Math.round(50 + (Math.random() * 30) * (1 / quantConfig.speed)),
        memoryUsage: Math.round(quantConfig.memoryUsage * 1024 + Math.random() * 200),
        accuracy: Math.round(quantConfig.accuracy + (Math.random() - 0.5) * 5),
        throughput: Math.round(100 * quantConfig.speed + Math.random() * 20),
        timestamp: Date.now()
      };
      
      newResults.push(result);
    }

    setBenchmarkResults(prev => [
      ...prev.filter(r => !newResults.find(nr => nr.modelId === r.modelId)),
      ...newResults
    ]);
    
    setIsRunningBenchmark(false);
    toast.success('Benchmark completed!');
  };

  // Get model variants info
  const getModelInfo = (modelId: string) => {
    const variants = downloadedModels.filter(id => id.startsWith(modelId));
    const totalSize = variants.reduce((sum, variant) => {
      const [, quantization] = variant.split('-').slice(-1);
      const quantConfig = QUANTIZATION_LEVELS[quantization] || QUANTIZATION_LEVELS['8bit'];
      return sum + (MODEL_VARIANTS[modelId].baseSize / quantConfig.compression);
    }, 0);
    
    return {
      downloaded: variants.length,
      totalSize,
      variants
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scales size={20} />
            Model Quantization Comparison
            <Badge variant="outline" className="ml-2 text-xs">
              Performance Optimization
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(QUANTIZATION_LEVELS).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className={`p-3 border rounded-lg bg-${config.color}-50`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={`text-${config.color}-600`} />
                    <span className="font-medium text-sm">{config.name}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Size: {config.compression}x smaller</div>
                    <div>Speed: {config.speed}x faster</div>
                    <div>Accuracy: {config.accuracy}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="download" className="flex items-center gap-2">
            <CloudArrowDown size={14} />
            Download & Manage
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="flex items-center gap-2">
            <ChartBar size={14} />
            Benchmark
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Gauge size={14} />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="mt-6">
          <div className="space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Model</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(MODEL_VARIANTS).map(([id, model]) => {
                    const info = getModelInfo(id);
                    return (
                      <div
                        key={id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedModel === id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setSelectedModel(id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={16} />
                          <span className="font-medium">{model.name}</span>
                          {info.downloaded > 0 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              {info.downloaded} variants
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>{model.type}</div>
                          <div>Base size: {formatBytes(model.baseSize)}</div>
                          {info.downloaded > 0 && (
                            <div>Downloaded: {formatBytes(info.totalSize)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Download Progress */}
            {downloadProgress && (
              <Alert className="border-blue-200 bg-blue-50">
                <CloudArrowDown className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Downloading {downloadProgress.modelId}</span>
                      <span className="text-sm text-muted-foreground">{downloadProgress.status}</span>
                    </div>
                    <Progress value={downloadProgress.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{Math.round(downloadProgress.progress)}% complete</span>
                      <span>
                        {downloadProgress.speed > 0 && 
                          `${downloadProgress.speed.toFixed(1)} MB/s • ${Math.round(downloadProgress.estimatedTime)}s remaining`
                        }
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Quantization Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Download {MODEL_VARIANTS[selectedModel]?.name} Variants
                  <Badge variant="outline" className="text-xs">
                    {getModelInfo(selectedModel).downloaded} / {Object.keys(QUANTIZATION_LEVELS).length} downloaded
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(QUANTIZATION_LEVELS).map(([key, config]) => {
                    const modelId = `${selectedModel}-${key}`;
                    const isDownloaded = downloadedModels.includes(modelId);
                    const isDownloading = downloadProgress?.modelId === modelId;
                    const Icon = config.icon;
                    const modelSize = MODEL_VARIANTS[selectedModel]?.baseSize / config.compression;

                    return (
                      <div key={key} className={`p-4 border rounded-lg ${isDownloaded ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Icon size={20} className={`text-${config.color}-600`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{config.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {formatBytes(modelSize)}
                                </Badge>
                                {isDownloaded && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle size={10} className="mr-1" />
                                    Downloaded
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {config.description}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <Database size={10} />
                                  {config.compression}x compression
                                </span>
                                <span className="flex items-center gap-1">
                                  <Lightning size={10} />
                                  {config.speed}x speed
                                </span>
                                <span className="flex items-center gap-1">
                                  <Gauge size={10} />
                                  {config.accuracy}% accuracy
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            {!isDownloaded && !isDownloading && (
                              <Button
                                size="sm"
                                onClick={() => downloadModel(selectedModel, key)}
                                disabled={!!downloadProgress}
                              >
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                            )}
                            {isDownloading && (
                              <Button size="sm" variant="outline" disabled>
                                <CircleNotch size={14} className="mr-1 animate-spin" />
                                Downloading
                              </Button>
                            )}
                            {isDownloaded && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteModel(modelId)}
                              >
                                <Trash size={14} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Pros and Cons */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="font-medium text-green-700 mb-1">Advantages:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                              {config.pros.map((pro, idx) => (
                                <li key={idx}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="font-medium text-red-700 mb-1">Considerations:</div>
                            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                              {config.cons.map((con, idx) => (
                                <li key={idx}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="mt-6">
          <div className="space-y-6">
            {/* Benchmark Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  Performance Benchmarking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Run Comparison Benchmark</h3>
                      <p className="text-sm text-muted-foreground">
                        Test inference speed, memory usage, and accuracy across all downloaded model variants
                      </p>
                    </div>
                    <Button
                      onClick={() => runBenchmark(selectedModel)}
                      disabled={isRunningBenchmark || getModelInfo(selectedModel).downloaded === 0}
                    >
                      {isRunningBenchmark ? (
                        <>
                          <CircleNotch size={14} className="mr-1 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={14} className="mr-1" />
                          Start Benchmark
                        </>
                      )}
                    </Button>
                  </div>

                  {getModelInfo(selectedModel).downloaded === 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Download at least one model variant to run benchmarks
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Benchmark Progress */}
            {isRunningBenchmark && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benchmark in Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CircleNotch size={16} className="text-blue-600 animate-spin" />
                      <span>Testing model variants...</span>
                    </div>
                    <Progress value={70} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      This may take a few minutes depending on your hardware
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <div className="space-y-6">
            {/* Results Summary */}
            {benchmarkResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge size={20} />
                    Benchmark Results
                    <Badge variant="outline" className="text-xs">
                      {benchmarkResults.length} models tested
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Metrics Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-blue-600" />
                          <span className="font-medium text-sm">Inference Speed</span>
                        </div>
                        <div className="space-y-2">
                          {benchmarkResults.map(result => {
                            const [, quantization] = result.modelId.split('-').slice(-1);
                            const config = QUANTIZATION_LEVELS[quantization];
                            return (
                              <div key={result.modelId} className="flex items-center justify-between text-xs">
                                <span className={`text-${config?.color || 'gray'}-600`}>
                                  {quantization}
                                </span>
                                <span className="font-mono">{result.inferenceTime}ms</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrives size={14} className="text-green-600" />
                          <span className="font-medium text-sm">Memory Usage</span>
                        </div>
                        <div className="space-y-2">
                          {benchmarkResults.map(result => {
                            const [, quantization] = result.modelId.split('-').slice(-1);
                            const config = QUANTIZATION_LEVELS[quantization];
                            return (
                              <div key={result.modelId} className="flex items-center justify-between text-xs">
                                <span className={`text-${config?.color || 'gray'}-600`}>
                                  {quantization}
                                </span>
                                <span className="font-mono">{formatBytes(result.memoryUsage * 1024 * 1024)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkle size={14} className="text-purple-600" />
                          <span className="font-medium text-sm">Accuracy</span>
                        </div>
                        <div className="space-y-2">
                          {benchmarkResults.map(result => {
                            const [, quantization] = result.modelId.split('-').slice(-1);
                            const config = QUANTIZATION_LEVELS[quantization];
                            return (
                              <div key={result.modelId} className="flex items-center justify-between text-xs">
                                <span className={`text-${config?.color || 'gray'}-600`}>
                                  {quantization}
                                </span>
                                <span className="font-mono">{result.accuracy}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Results Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Quantization</th>
                            <th className="text-left p-3 text-sm font-medium">Inference Time</th>
                            <th className="text-left p-3 text-sm font-medium">Memory Usage</th>
                            <th className="text-left p-3 text-sm font-medium">Accuracy</th>
                            <th className="text-left p-3 text-sm font-medium">Throughput</th>
                            <th className="text-left p-3 text-sm font-medium">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarkResults.map((result, idx) => {
                            const [, quantization] = result.modelId.split('-').slice(-1);
                            const config = QUANTIZATION_LEVELS[quantization];
                            const score = Math.round((result.accuracy * result.throughput) / result.inferenceTime);
                            
                            return (
                              <tr key={result.modelId} className={idx % 2 === 0 ? 'bg-muted/25' : ''}>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {config && <config.icon size={14} className={`text-${config.color}-600`} />}
                                    <span className="font-medium">{quantization}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-sm">{result.inferenceTime}ms</td>
                                <td className="p-3 font-mono text-sm">{formatBytes(result.memoryUsage * 1024 * 1024)}</td>
                                <td className="p-3 font-mono text-sm">{result.accuracy}%</td>
                                <td className="p-3 font-mono text-sm">{result.throughput} t/s</td>
                                <td className="p-3">
                                  <Badge variant="outline" className="font-mono">
                                    {score}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium mb-2">Recommendations</h3>
                      <div className="space-y-2 text-sm">
                        {benchmarkResults.length > 0 && (
                          <>
                            <div className="flex items-center gap-2">
                              <Lightning size={14} className="text-green-600" />
                              <span>
                                <strong>Fastest:</strong> {benchmarkResults.reduce((fastest, result) => 
                                  result.inferenceTime < fastest.inferenceTime ? result : fastest
                                ).modelId.split('-').pop()} quantization
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkle size={14} className="text-purple-600" />
                              <span>
                                <strong>Most Accurate:</strong> {benchmarkResults.reduce((accurate, result) => 
                                  result.accuracy > accurate.accuracy ? result : accurate
                                ).modelId.split('-').pop()} quantization
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scales size={14} className="text-blue-600" />
                              <span>
                                <strong>Best Balance:</strong> 8-bit quantization offers good speed-accuracy tradeoff
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {benchmarkResults.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <ChartBar size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Benchmark Results</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download models and run benchmarks to see performance comparisons
                  </p>
                  <Button onClick={() => setActiveTab('download')}>
                    <ArrowRight size={14} className="mr-1" />
                    Download Models
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