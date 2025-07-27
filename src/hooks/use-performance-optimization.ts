import { useState, useCallback, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export interface DeviceSpecs {
  platform: 'ios' | 'android' | 'desktop' | 'web';
  architecture: 'arm64' | 'x86_64' | 'wasm';
  memoryGB: number;
  cores: number;
  gpuVendor?: 'apple' | 'nvidia' | 'amd' | 'intel' | 'qualcomm';
  accelerationSupport: {
    metal: boolean;
    vulkan: boolean;
    cuda: boolean;
    opencl: boolean;
    neon: boolean;
    avx2: boolean;
    avx512: boolean;
    webgpu: boolean;
    simd: boolean;
  };
}

export interface ModelConfig {
  name: string;
  size: 'tiny' | 'small' | 'base' | 'large';
  quantization: '4bit' | '8bit' | '16bit' | 'fp32';
  optimizations: string[];
  downloadUrl: string;
  fileSize: number;
  checksum: string;
}

export interface AccelerationMethod {
  id: string;
  name: string;
  status: 'active' | 'available' | 'not-available' | 'loading';
  performance: number;
  memoryUsage: number;
  inferenceTime: number;
  supported: boolean;
  priority: number;
}

export interface PerformanceMetrics {
  inferenceTime: number;
  memoryUsage: number;
  throughput: number;
  accuracy: number;
  powerConsumption?: number;
}

export interface ModelDownloadProgress {
  modelName: string;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number;
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'verifying';
  error?: string;
}

const detectDeviceSpecs = (): DeviceSpecs => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (() => {
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('electron')) return 'desktop';
    return 'web';
  })();

  const architecture = (() => {
    if (userAgent.includes('arm64') || userAgent.includes('aarch64')) return 'arm64';
    if (userAgent.includes('x86_64') || userAgent.includes('amd64')) return 'x86_64';
    return 'wasm';
  })();

  // Estimate memory from device info
  const memoryGB = (() => {
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }
    // Fallback estimates based on platform
    if (platform === 'ios') return 6;
    if (platform === 'android') return 4;
    if (platform === 'desktop') return 16;
    return 8;
  })();

  const cores = navigator.hardwareConcurrency || 4;

  const gpuVendor = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_GL).toLowerCase();
        if (renderer.includes('apple')) return 'apple';
        if (renderer.includes('nvidia')) return 'nvidia';
        if (renderer.includes('amd') || renderer.includes('radeon')) return 'amd';
        if (renderer.includes('intel')) return 'intel';
        if (renderer.includes('qualcomm') || renderer.includes('adreno')) return 'qualcomm';
      }
    }
    return undefined;
  })();

  return {
    platform,
    architecture,
    memoryGB,
    cores,
    gpuVendor,
    accelerationSupport: {
      metal: platform === 'ios' || (platform === 'desktop' && gpuVendor === 'apple'),
      vulkan: platform === 'android' || (platform === 'desktop' && ['nvidia', 'amd'].includes(gpuVendor || '')),
      cuda: platform === 'desktop' && gpuVendor === 'nvidia',
      opencl: true, // Most modern devices support OpenCL
      neon: architecture === 'arm64',
      avx2: architecture === 'x86_64',
      avx512: architecture === 'x86_64' && platform === 'desktop',
      webgpu: 'gpu' in navigator,
      simd: 'WebAssembly' in window && 'simd' in WebAssembly
    }
  };
};

const getOptimalModelConfigs = (deviceSpecs: DeviceSpecs): { whisper: ModelConfig; gemma: ModelConfig } => {
  const memoryClass = deviceSpecs.memoryGB >= 8 ? 'high' : deviceSpecs.memoryGB >= 4 ? 'medium' : 'low';
  
  const whisperConfig: ModelConfig = {
    name: 'whisper',
    size: memoryClass === 'high' ? 'base' : memoryClass === 'medium' ? 'small' : 'tiny',
    quantization: memoryClass === 'high' ? '16bit' : '4bit',
    optimizations: [],
    downloadUrl: '',
    fileSize: 0,
    checksum: ''
  };

  const gemmaConfig: ModelConfig = {
    name: 'gemma',
    size: memoryClass === 'high' ? 'base' : 'small',
    quantization: memoryClass === 'high' ? '8bit' : '4bit',
    optimizations: [],
    downloadUrl: '',
    fileSize: 0,
    checksum: ''
  };

  // Add platform-specific optimizations
  if (deviceSpecs.accelerationSupport.metal) {
    whisperConfig.optimizations.push('metal', 'accelerate_blas');
    gemmaConfig.optimizations.push('metal', 'accelerate_blas');
  }
  
  if (deviceSpecs.accelerationSupport.vulkan) {
    whisperConfig.optimizations.push('vulkan');
    gemmaConfig.optimizations.push('vulkan');
  }
  
  if (deviceSpecs.accelerationSupport.neon) {
    whisperConfig.optimizations.push('neon');
    gemmaConfig.optimizations.push('neon');
  }
  
  if (deviceSpecs.accelerationSupport.avx2) {
    whisperConfig.optimizations.push('avx2');
    gemmaConfig.optimizations.push('avx2');
  }
  
  if (deviceSpecs.accelerationSupport.avx512) {
    whisperConfig.optimizations.push('avx512');
    gemmaConfig.optimizations.push('avx512');
  }

  // Set download URLs and sizes (mock values)
  const baseUrl = 'https://models.phonocorrect.ai';
  whisperConfig.downloadUrl = `${baseUrl}/whisper-${whisperConfig.size}-${whisperConfig.quantization}-${deviceSpecs.platform}.onnx`;
  whisperConfig.fileSize = whisperConfig.size === 'tiny' ? 39 * 1024 * 1024 : whisperConfig.size === 'small' ? 244 * 1024 * 1024 : 483 * 1024 * 1024;
  
  gemmaConfig.downloadUrl = `${baseUrl}/gemma-${gemmaConfig.size}-${gemmaConfig.quantization}-${deviceSpecs.platform}.onnx`;
  gemmaConfig.fileSize = gemmaConfig.size === 'small' ? 1.2 * 1024 * 1024 * 1024 : 2.8 * 1024 * 1024 * 1024;

  return { whisper: whisperConfig, gemma: gemmaConfig };
};

export function usePerformanceOptimization() {
  const [deviceSpecs] = useState<DeviceSpecs>(() => detectDeviceSpecs());
  const [currentAcceleration, setCurrentAcceleration] = useKV<string>('current-acceleration', 'cpu');
  const [downloadedModels, setDownloadedModels] = useKV<string[]>('downloaded-models', []);
  const [modelConfigs, setModelConfigs] = useKV<{ whisper: ModelConfig; gemma: ModelConfig }>('model-configs', () => getOptimalModelConfigs(deviceSpecs));
  
  const [accelerationMethods, setAccelerationMethods] = useState<AccelerationMethod[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    inferenceTime: 0,
    memoryUsage: 0,
    throughput: 0,
    accuracy: 0
  });
  const [downloadProgress, setDownloadProgress] = useState<ModelDownloadProgress | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const downloadController = useRef<AbortController | null>(null);

  // Initialize acceleration methods based on device capabilities
  useEffect(() => {
    const methods: AccelerationMethod[] = [
      {
        id: 'cpu',
        name: 'CPU (Baseline)',
        status: 'active',
        performance: 30,
        memoryUsage: 512,
        inferenceTime: 150,
        supported: true,
        priority: 1
      }
    ];

    if (deviceSpecs.accelerationSupport.metal) {
      methods.push({
        id: 'metal',
        name: 'Metal (Apple Silicon)',
        status: currentAcceleration === 'metal' ? 'active' : 'available',
        performance: 95,
        memoryUsage: 256,
        inferenceTime: 35,
        supported: true,
        priority: 10
      });
    }

    if (deviceSpecs.accelerationSupport.vulkan) {
      methods.push({
        id: 'vulkan',
        name: 'Vulkan',
        status: currentAcceleration === 'vulkan' ? 'active' : 'available',
        performance: 85,
        memoryUsage: 384,
        inferenceTime: 45,
        supported: true,
        priority: 8
      });
    }

    if (deviceSpecs.accelerationSupport.cuda) {
      methods.push({
        id: 'cuda',
        name: 'CUDA (NVIDIA)',
        status: currentAcceleration === 'cuda' ? 'active' : 'available',
        performance: 98,
        memoryUsage: 512,
        inferenceTime: 25,
        supported: true,
        priority: 9
      });
    }

    if (deviceSpecs.accelerationSupport.opencl) {
      methods.push({
        id: 'opencl',
        name: 'OpenCL',
        status: currentAcceleration === 'opencl' ? 'active' : 'available',
        performance: 65,
        memoryUsage: 384,
        inferenceTime: 75,
        supported: true,
        priority: 6
      });
    }

    if (deviceSpecs.accelerationSupport.webgpu) {
      methods.push({
        id: 'webgpu',
        name: 'WebGPU',
        status: currentAcceleration === 'webgpu' ? 'active' : 'available',
        performance: 80,
        memoryUsage: 256,
        inferenceTime: 50,
        supported: true,
        priority: 7
      });
    }

    if (deviceSpecs.accelerationSupport.simd) {
      methods.push({
        id: 'wasm-simd',
        name: 'WebAssembly SIMD',
        status: currentAcceleration === 'wasm-simd' ? 'active' : 'available',
        performance: 55,
        memoryUsage: 384,
        inferenceTime: 95,
        supported: true,
        priority: 4
      });
    }

    // Sort by priority (highest first)
    methods.sort((a, b) => b.priority - a.priority);
    setAccelerationMethods(methods);

    // Update performance metrics for current acceleration
    const currentMethod = methods.find(m => m.id === currentAcceleration);
    if (currentMethod) {
      setPerformanceMetrics({
        inferenceTime: currentMethod.inferenceTime,
        memoryUsage: currentMethod.memoryUsage,
        throughput: 1000 / currentMethod.inferenceTime,
        accuracy: 0.94 + (currentMethod.performance / 1000) // Higher performance = slightly better accuracy
      });
    }
  }, [deviceSpecs, currentAcceleration]);

  const switchAcceleration = useCallback(async (methodId: string) => {
    const method = accelerationMethods.find(m => m.id === methodId);
    if (!method || !method.supported) {
      toast.error('Acceleration method not supported');
      return;
    }

    setIsOptimizing(true);
    toast.info(`Switching to ${method.name}...`);

    try {
      // Update acceleration methods status
      setAccelerationMethods(prev => prev.map(m => ({
        ...m,
        status: m.id === methodId ? 'loading' : (m.status === 'active' ? 'available' : m.status)
      })));

      // Simulate initialization time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update current acceleration
      setCurrentAcceleration(methodId);
      
      // Update status and metrics
      setAccelerationMethods(prev => prev.map(m => ({
        ...m,
        status: m.id === methodId ? 'active' : (m.status === 'active' ? 'available' : m.status)
      })));

      setPerformanceMetrics({
        inferenceTime: method.inferenceTime,
        memoryUsage: method.memoryUsage,
        throughput: 1000 / method.inferenceTime,
        accuracy: 0.94 + (method.performance / 1000)
      });

      toast.success(`Switched to ${method.name}`);
    } catch (error) {
      toast.error(`Failed to switch to ${method.name}`);
      console.error('Acceleration switch error:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [accelerationMethods, setCurrentAcceleration]);

  const downloadModel = useCallback(async (modelConfig: ModelConfig) => {
    if (downloadController.current) {
      downloadController.current.abort();
    }

    downloadController.current = new AbortController();
    const { signal } = downloadController.current;

    setDownloadProgress({
      modelName: modelConfig.name,
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: modelConfig.fileSize,
      speed: 0,
      status: 'downloading'
    });

    try {
      // Simulate model download with realistic progress
      const chunks = 100;
      const chunkSize = modelConfig.fileSize / chunks;
      let downloaded = 0;
      const startTime = Date.now();

      for (let i = 0; i < chunks; i++) {
        if (signal.aborted) throw new Error('Download cancelled');
        
        // Simulate variable download speed
        const delay = 50 + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        downloaded += chunkSize;
        const progress = (i + 1) / chunks * 100;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = downloaded / elapsed;

        setDownloadProgress(prev => prev ? {
          ...prev,
          progress,
          bytesDownloaded: downloaded,
          speed
        } : null);
      }

      // Verify download
      setDownloadProgress(prev => prev ? { ...prev, status: 'verifying' } : null);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as completed
      setDownloadProgress(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
      setDownloadedModels(prev => [...prev, `${modelConfig.name}-${modelConfig.size}-${modelConfig.quantization}`]);
      
      toast.success(`${modelConfig.name} model downloaded successfully`);
      
      // Clear progress after a delay
      setTimeout(() => setDownloadProgress(null), 2000);

    } catch (error) {
      if (error instanceof Error && error.message === 'Download cancelled') {
        setDownloadProgress(prev => prev ? { ...prev, status: 'idle' } : null);
        toast.info('Download cancelled');
      } else {
        setDownloadProgress(prev => prev ? { 
          ...prev, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Download failed' 
        } : null);
        toast.error('Download failed');
      }
    }
  }, [setDownloadedModels]);

  const cancelDownload = useCallback(() => {
    if (downloadController.current) {
      downloadController.current.abort();
    }
  }, []);

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      setDownloadedModels(prev => prev.filter(id => id !== modelId));
      toast.success('Model deleted successfully');
    } catch (error) {
      toast.error('Failed to delete model');
    }
  }, [setDownloadedModels]);

  const optimizeForDevice = useCallback(async () => {
    setIsOptimizing(true);
    toast.info('Optimizing models for your device...');

    try {
      // Get optimal configurations
      const optimal = getOptimalModelConfigs(deviceSpecs);
      setModelConfigs(optimal);

      // Auto-select best acceleration method
      const bestMethod = accelerationMethods
        .filter(m => m.supported && m.status !== 'not-available')
        .sort((a, b) => b.priority - a.priority)[0];

      if (bestMethod && bestMethod.id !== currentAcceleration) {
        await switchAcceleration(bestMethod.id);
      }

      toast.success('Device optimization completed');
    } catch (error) {
      toast.error('Optimization failed');
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [deviceSpecs, accelerationMethods, currentAcceleration, switchAcceleration, setModelConfigs]);

  const getCurrentStatus = useCallback(() => {
    const currentMethod = accelerationMethods.find(m => m.status === 'active');
    return {
      acceleration: currentMethod?.name || 'CPU',
      accelerationId: currentMethod?.id || 'cpu',
      performance: currentMethod?.performance || 30,
      ...performanceMetrics
    };
  }, [accelerationMethods, performanceMetrics]);

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatSpeed = useCallback((bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  }, [formatBytes]);

  return {
    deviceSpecs,
    accelerationMethods,
    performanceMetrics,
    downloadProgress,
    downloadedModels,
    modelConfigs,
    isOptimizing,
    switchAcceleration,
    downloadModel,
    cancelDownload,
    deleteModel,
    optimizeForDevice,
    getCurrentStatus,
    formatBytes,
    formatSpeed
  };
}