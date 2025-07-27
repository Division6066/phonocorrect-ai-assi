import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cpu, 
  Zap, 
  Activity, 
  HardDrive, 
  Monitor, 
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "@phosphor-icons/react";

interface HardwareCapabilities {
  cpu: {
    cores: number;
    hasAVX: boolean;
    hasAVX2: boolean;
    hasAVX512: boolean;
    hasFMA: boolean;
    hasF16C: boolean;
    hasNEON: boolean;
    hasArmBF16: boolean;
  };
  gpu: {
    hasOpenCL: boolean;
    hasVulkan: boolean;
    hasDirectX: boolean;
    hasMetal: boolean;
    supportsFloat16: boolean;
    memoryMB: number;
    directXFeatureLevel: number;
    maxThreadsPerGroup: number;
  };
  neural: {
    hasCoreML: boolean;
    hasNeuralEngine: boolean;
    hasNNAPI: boolean;
    nnApiVersion: number;
  };
}

interface PerformanceMetrics {
  inferenceTimeMs: number;
  memoryUsageMB: number;
  accelerationType: string;
  totalProcessingTime?: number;
}

export function HardwareAccelerationPanel() {
  const [capabilities, setCapabilities] = useState<HardwareCapabilities | null>(null);
  const [bestAccelType, setBestAccelType] = useState<string>('CPU_BASIC');
  const [currentAccelType, setCurrentAccelType] = useState<string>('Not initialized');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Load hardware acceleration module
  const loadHardwareAcceleration = async () => {
    try {
      let HardwareAcceleration: any = null;

      if (typeof window !== 'undefined') {
        // Web environment
        const { HardwareAcceleration: WebAccel } = await import('../../packages/ml-core/src/web/HardwareAcceleration');
        HardwareAcceleration = WebAccel;
      } else if (typeof process !== 'undefined' && process.versions?.electron) {
        // Electron environment
        const { HardwareAcceleration: ElectronAccel } = await import('../../packages/ml-core/src/electron/HardwareAcceleration');
        HardwareAcceleration = ElectronAccel;
      }

      if (HardwareAcceleration) {
        setIsSupported(true);
        const caps = HardwareAcceleration.detectCapabilities();
        const bestType = HardwareAcceleration.getBestAccelerationType();
        
        setCapabilities(caps);
        setBestAccelType(bestType);
        
        if (HardwareAcceleration.isInitialized()) {
          setIsInitialized(true);
          setCurrentAccelType(bestType);
          
          // Get performance metrics if available
          try {
            const metrics = HardwareAcceleration.getPerformanceMetrics();
            setPerformanceMetrics(metrics);
          } catch (error) {
            console.warn('Performance metrics not available:', error);
          }
        }
      }
      
      return HardwareAcceleration;
    } catch (error) {
      console.error('Failed to load hardware acceleration:', error);
      setInitError(`Failed to load: ${error}`);
      return null;
    }
  };

  useEffect(() => {
    loadHardwareAcceleration();
  }, []);

  const initializeAcceleration = async (accelType?: string) => {
    setIsInitializing(true);
    setInitError(null);

    try {
      const HardwareAcceleration = await loadHardwareAcceleration();
      if (!HardwareAcceleration) {
        throw new Error('Hardware acceleration not available');
      }

      const targetType = accelType || bestAccelType;
      await HardwareAcceleration.initializeAcceleration(targetType);
      
      setIsInitialized(true);
      setCurrentAccelType(targetType);
      
      // Get initial metrics
      const metrics = HardwareAcceleration.getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      
    } catch (error) {
      setInitError(`Initialization failed: ${error}`);
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const getAccelerationIcon = (type: string) => {
    switch (type) {
      case 'NEURAL_ENGINE':
      case 'COREML':
      case 'NNAPI':
        return <Smartphone size={16} className="text-purple-600" />;
      case 'METAL':
      case 'DIRECTX':
      case 'VULKAN':
      case 'OPENCL':
      case 'WEBGPU':
        return <Monitor size={16} className="text-blue-600" />;
      case 'CPU_AVX512':
      case 'CPU_AVX2':
      case 'CPU_NEON':
        return <Cpu size={16} className="text-green-600" />;
      default:
        return <Cpu size={16} className="text-gray-600" />;
    }
  };

  const getAccelerationBadgeVariant = (type: string) => {
    if (type.includes('NEURAL') || type.includes('COREML')) return 'default';
    if (type.includes('GPU') || type.includes('METAL') || type.includes('DIRECTX')) return 'secondary';
    if (type.includes('AVX') || type.includes('NEON')) return 'outline';
    return 'secondary';
  };

  const getPerformanceColor = (timeMs: number) => {
    if (timeMs <= 10) return 'text-green-600';
    if (timeMs <= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            Hardware Acceleration Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hardware acceleration is not supported on this platform. 
            The app will use CPU-based inference.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} />
            Hardware Acceleration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Mode:</span>
            <div className="flex items-center gap-2">
              {getAccelerationIcon(currentAccelType)}
              <Badge variant={getAccelerationBadgeVariant(currentAccelType)}>
                {currentAccelType}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-2">
              {isInitialized ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : initError ? (
                <XCircle size={16} className="text-red-500" />
              ) : (
                <AlertCircle size={16} className="text-yellow-500" />
              )}
              <span className="text-sm">
                {isInitialized ? 'Ready' : initError ? 'Error' : 'Not initialized'}
              </span>
            </div>
          </div>

          {bestAccelType !== currentAccelType && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recommended:</span>
              <div className="flex items-center gap-2">
                {getAccelerationIcon(bestAccelType)}
                <Badge variant="outline">{bestAccelType}</Badge>
              </div>
            </div>
          )}

          {initError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{initError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => initializeAcceleration()}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <RefreshCw size={14} className="animate-spin mr-2" />
              ) : (
                <Zap size={14} className="mr-2" />
              )}
              {isInitialized ? 'Reinitialize' : 'Initialize'}
            </Button>
            
            {bestAccelType !== currentAccelType && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => initializeAcceleration(bestAccelType)}
                disabled={isInitializing}
              >
                Use {bestAccelType}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium">Inference Time</div>
                <div className={`text-lg font-bold ${getPerformanceColor(performanceMetrics.inferenceTimeMs)}`}>
                  {performanceMetrics.inferenceTimeMs.toFixed(1)}ms
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Memory Usage</div>
                <div className="text-lg font-bold text-blue-600">
                  {performanceMetrics.memoryUsageMB.toFixed(1)}MB
                </div>
              </div>
            </div>
            
            {performanceMetrics.totalProcessingTime && (
              <div>
                <div className="text-sm font-medium">Total Processing Time</div>
                <div className="text-lg font-bold text-purple-600">
                  {performanceMetrics.totalProcessingTime.toFixed(1)}ms
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hardware Capabilities */}
      {capabilities && (
        <Card>
          <CardHeader>
            <CardTitle>Hardware Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cpu" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cpu">CPU</TabsTrigger>
                <TabsTrigger value="gpu">GPU</TabsTrigger>
                <TabsTrigger value="neural">Neural</TabsTrigger>
              </TabsList>

              <TabsContent value="cpu" className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Cores: {capabilities.cpu.cores}</div>
                  <div>AVX: {capabilities.cpu.hasAVX ? '✅' : '❌'}</div>
                  <div>AVX2: {capabilities.cpu.hasAVX2 ? '✅' : '❌'}</div>
                  <div>AVX-512: {capabilities.cpu.hasAVX512 ? '✅' : '❌'}</div>
                  <div>FMA: {capabilities.cpu.hasFMA ? '✅' : '❌'}</div>
                  <div>F16C: {capabilities.cpu.hasF16C ? '✅' : '❌'}</div>
                  <div>NEON: {capabilities.cpu.hasNEON ? '✅' : '❌'}</div>
                  <div>ARM BF16: {capabilities.cpu.hasArmBF16 ? '✅' : '❌'}</div>
                </div>
              </TabsContent>

              <TabsContent value="gpu" className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Memory: {capabilities.gpu.memoryMB}MB</div>
                  <div>Float16: {capabilities.gpu.supportsFloat16 ? '✅' : '❌'}</div>
                  <div>OpenCL: {capabilities.gpu.hasOpenCL ? '✅' : '❌'}</div>
                  <div>Vulkan: {capabilities.gpu.hasVulkan ? '✅' : '❌'}</div>
                  <div>DirectX: {capabilities.gpu.hasDirectX ? '✅' : '❌'}</div>
                  <div>Metal: {capabilities.gpu.hasMetal ? '✅' : '❌'}</div>
                  {capabilities.gpu.maxThreadsPerGroup > 0 && (
                    <div className="col-span-2">
                      Max Work Group: {capabilities.gpu.maxThreadsPerGroup}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="neural" className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>CoreML: {capabilities.neural.hasCoreML ? '✅' : '❌'}</div>
                  <div>Neural Engine: {capabilities.neural.hasNeuralEngine ? '✅' : '❌'}</div>
                  <div>NNAPI: {capabilities.neural.hasNNAPI ? '✅' : '❌'}</div>
                  {capabilities.neural.nnApiVersion > 0 && (
                    <div>NNAPI Version: {capabilities.neural.nnApiVersion}</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}