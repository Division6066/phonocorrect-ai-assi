import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ModelConfig } from "@/hooks/use-performance-optimization";
import { 
  Brain, 
  Download, 
  CheckCircle, 
  XCircle, 
  Warning as AlertTriangle,
  Info,
  Trash,
  Play,
  CircleNotch,
  Lightning,
  Cpu,
  Gauge
} from "@phosphor-icons/react";
import { useMLModels } from '@/hooks/use-ml-models';
import { usePerformanceOptimization } from '@/hooks/use-performance-optimization';

export const MLModelsPanel: React.FC = () => {
  const {
    modelState,
    loadWhisperModel,
    loadGemmaModel,
    updateWhisperConfig,
    updateGemmaConfig,
    getMLCoreStatus,
    whisperConfig,
    gemmaConfig
  } = useMLModels();

  const {
    downloadProgress,
    downloadedModels,
    modelConfigs,
    downloadModel,
    deleteModel,
    formatBytes,
    getCurrentStatus
  } = usePerformanceOptimization();

  const currentStatus = getCurrentStatus();

  const models = [
    {
      id: 'gemma-2b',
      name: 'Gemma 2B',
      type: 'Language Model',
      config: modelConfigs.gemma,
      state: modelState.gemma,
      loadFunction: loadGemmaModel,
      updateConfig: updateGemmaConfig,
      currentConfig: gemmaConfig,
      description: 'Optimized for phonetic correction and text enhancement'
    },
    {
      id: 'whisper-base',
      name: 'Whisper Base',
      type: 'Speech-to-Text',
      config: modelConfigs.whisper,
      state: modelState.whisper,
      loadFunction: loadWhisperModel,
      updateConfig: updateWhisperConfig,
      currentConfig: whisperConfig,
      description: 'Multilingual speech recognition with high accuracy'
    }
  ];

  const getStatusIcon = (state: any) => {
    if (state.loading) return <CircleNotch size={16} className="text-blue-600 animate-spin" />;
    if (state.loaded) return <CheckCircle size={16} className="text-green-600" />;
    if (state.error) return <XCircle size={16} className="text-red-600" />;
    return <Download size={16} className="text-muted-foreground" />;
  };

  const getStatusBadge = (state: any) => {
    if (state.loading) return <Badge className="bg-blue-100 text-blue-800">Loading</Badge>;
    if (state.loaded) return <Badge className="bg-green-100 text-green-800">Loaded</Badge>;
    if (state.error) return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    return <Badge variant="outline">Not Loaded</Badge>;
  };

  const getAccelerationIcon = () => {
    if (currentStatus.accelerationId.includes('gpu') || 
        currentStatus.accelerationId.includes('metal') || 
        currentStatus.accelerationId.includes('vulkan') ||
        currentStatus.accelerationId.includes('cuda')) {
      return <Lightning size={14} className="text-yellow-500" />;
    }
    return <Cpu size={14} className="text-gray-500" />;
  };

  const mlCoreStatus = getMLCoreStatus();

  return (
    <div className="space-y-6">
      {/* ML Core Status */}
      <Alert className={mlCoreStatus.available ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              {mlCoreStatus.available ? (
                <span>ML Core initialized (v{mlCoreStatus.version}) with hardware acceleration</span>
              ) : (
                <span>ML Core not available - using fallback implementations</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getAccelerationIcon()}
              <Badge variant="outline" className="text-xs">
                {currentStatus.acceleration}
              </Badge>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            ML Models Management
            <Badge variant="outline" className="ml-2 text-xs">
              <Gauge size={10} className="mr-1" />
              {Math.round(currentStatus.inferenceTime)}ms
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Status */}
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Performance</span>
              <div className="flex items-center gap-2">
                {getAccelerationIcon()}
                <span className="text-sm text-muted-foreground">{currentStatus.acceleration}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="font-mono text-lg">{Math.round(currentStatus.inferenceTime)}ms</div>
                <div className="text-muted-foreground">Inference</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-lg">{formatBytes(currentStatus.memoryUsage * 1024 * 1024)}</div>
                <div className="text-muted-foreground">Memory</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-lg">{Math.round(currentStatus.accuracy * 100)}%</div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Active Models Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Model Status</h3>
            <div className="grid gap-3">
              {models.map((model) => (
                <div key={model.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                  model.state.loaded ? 'bg-green-50' : model.state.loading ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(model.state)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{model.name}</span>
                        {getStatusBadge(model.state)}
                        <Badge variant="outline" className="text-xs">
                          {model.config.quantization}
                        </Badge>
                        {model.config.optimizations.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50">
                            <Lightning size={8} className="mr-1" />
                            Optimized
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {model.type} • {formatBytes(model.config.fileSize)}
                        {model.config.optimizations.length > 0 && (
                          <span className="ml-2">• {model.config.optimizations.join(', ')}</span>
                        )}
                      </div>
                      {model.state.error && (
                        <div className="text-xs text-red-600 mt-1">{model.state.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!model.state.loaded && !model.state.loading && (
                      <Button 
                        size="sm" 
                        onClick={model.loadFunction}
                        disabled={model.state.loading}
                      >
                        <Play size={14} className="mr-1" />
                        Load
                      </Button>
                    )}
                    {model.state.loaded && (
                      <Button size="sm" variant="outline" disabled>
                        <CheckCircle size={14} className="mr-1" />
                        Ready
                      </Button>
                    )}
                    {model.state.loading && (
                      <Button size="sm" variant="outline" disabled>
                        <CircleNotch size={14} className="mr-1 animate-spin" />
                        Loading
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Cpu size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Model Downloads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Model Downloads</h3>
              <Badge variant="outline" className="text-xs">
                {downloadedModels.length} downloaded
              </Badge>
            </div>

            {/* Download Progress */}
            {downloadProgress && (
              <div className="p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CircleNotch size={14} className="text-blue-600 animate-spin" />
                    <span className="font-medium text-sm">{downloadProgress.modelName} model</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {downloadProgress.status}
                  </span>
                </div>
                <Progress value={downloadProgress.progress} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatBytes(downloadProgress.bytesDownloaded)} / {formatBytes(downloadProgress.totalBytes)}
                  </span>
                  <span>{Math.round(downloadProgress.progress)}%</span>
                </div>
              </div>
            )}

            {/* Available Downloads */}
            <div className="space-y-2">
              {Object.entries(modelConfigs).map(([type, config]) => {
                const typedConfig = config as ModelConfig;
                const modelId = `${typedConfig.name}-${typedConfig.size}-${typedConfig.quantization}`;
                const isDownloaded = downloadedModels.includes(modelId);
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">{typedConfig.name}</span>
                        <Badge variant="outline" className="text-xs">{typedConfig.size}</Badge>
                        <Badge variant="outline" className="text-xs">{typedConfig.quantization}</Badge>
                        {isDownloaded && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Downloaded</Badge>
                        )}
                        {typedConfig.optimizations && typedConfig.optimizations.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-yellow-50">
                            <Lightning size={8} className="mr-1" />
                            {typedConfig.optimizations.length} opts
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Size: {formatBytes(typedConfig.fileSize)}
                        {typedConfig.optimizations && typedConfig.optimizations.length > 0 && (
                          <span className="ml-2">
                            Optimizations: {typedConfig.optimizations.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {!isDownloaded ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadModel(typedConfig)}
                          disabled={!!downloadProgress}
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                      ) : (
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
                );
              })}
            </div>
          </div>

          {/* Storage Information */}
          <div className="space-y-3">
            <h3 className="font-medium">Storage Information</h3>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Model Storage</span>
                <span className="text-sm text-muted-foreground">
                  {downloadedModels.length > 0 ? 
                    `${formatBytes(downloadedModels.length * 1.2 * 1024 * 1024 * 1024)} used` : 
                    'No models downloaded'
                  }
                </span>
              </div>
              <Progress value={downloadedModels.length * 10} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                Downloaded models are stored locally and optimized for your device
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="space-y-3">
            <h3 className="font-medium">Performance Tips</h3>
            <div className="space-y-2">
              {!modelState.mlCore.available && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
                  <AlertTriangle size={14} className="text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium">ML Core not available</div>
                    <div className="text-xs text-muted-foreground">
                      Using fallback implementations - performance may be limited
                    </div>
                  </div>
                </div>
              )}
              
              {currentStatus.accelerationId === 'cpu' && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                  <Info size={14} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Hardware acceleration available</div>
                    <div className="text-xs text-muted-foreground">
                      Enable GPU acceleration in Hardware settings for faster inference
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2 p-2 bg-green-50 rounded text-sm">
                <CheckCircle size={14} className="text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Models optimized for your device</div>
                  <div className="text-xs text-muted-foreground">
                    Quantization and platform-specific optimizations are automatically applied
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};