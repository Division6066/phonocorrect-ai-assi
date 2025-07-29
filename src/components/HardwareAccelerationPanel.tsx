import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Lightning, 
  Check, 
  Warning, 
  Info, 
  Cpu, 
  Download,
  X,
  Trash,
  Rocket,
  CircleNotch,
  CheckCircle,
  XCircle
} from "@phosphor-icons/react";
import { usePerformanceOptimization } from '@/hooks/use-performance-optimization';

export const HardwareAccelerationPanel: React.FC = () => {
  const {
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
  } = usePerformanceOptimization();

  const currentStatus = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* Performance Status Chip */}
      <Alert className="border-green-200 bg-green-50">
        <Cpu className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {currentStatus.acceleration}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {Math.round(currentStatus.inferenceTime)}ms inference
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatBytes(currentStatus.memoryUsage * 1024 * 1024)} memory
              </div>
            </div>
            <Button size="sm" onClick={optimizeForDevice} disabled={isOptimizing}>
              {isOptimizing ? (
                <CircleNotch size={14} className="mr-1 animate-spin" />
              ) : (
                <Rocket size={14} className="mr-1" />
              )}
              Optimize
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning size={20} />
            Hardware Acceleration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Optimize AI inference performance using available hardware acceleration methods
          </p>

          {/* Available Methods */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Acceleration Methods</h3>
            <div className="space-y-3">
              {accelerationMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{method.name}</span>
                      {method.status === 'active' && (
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          <Check size={12} className="mr-1" />
                          Active
                        </Badge>
                      )}
                      {method.status === 'loading' && (
                        <Badge variant="outline" className="text-blue-600">
                          <CircleNotch size={12} className="mr-1 animate-spin" />
                          Loading
                        </Badge>
                      )}
                      {method.status === 'available' && (
                        <Badge variant="outline" className="text-blue-600">
                          Available
                        </Badge>
                      )}
                      {method.status === 'not-available' && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Available
                        </Badge>
                      )}
                    </div>
                    
                    {method.supported && method.performance > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Performance: {method.performance}%</span>
                          <span>{method.inferenceTime}ms inference</span>
                        </div>
                        <Progress value={method.performance} className="h-1" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {method.status === 'available' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => switchAcceleration(method.id)}
                        disabled={isOptimizing}
                      >
                        Enable
                      </Button>
                    )}
                    {method.status === 'active' && (
                      <Button size="sm" variant="outline" disabled>
                        <Check size={14} className="mr-1" />
                        Active
                      </Button>
                    )}
                    {method.status === 'loading' && (
                      <Button size="sm" variant="outline" disabled>
                        <CircleNotch size={14} className="mr-1 animate-spin" />
                        Loading
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Model Downloads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Optimized Models</h3>
              <Badge variant="outline" className="text-xs">
                {downloadedModels.length} downloaded
              </Badge>
            </div>

            {/* Download Progress */}
            {downloadProgress && (
              <div className="p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {downloadProgress.status === 'downloading' && (
                      <CircleNotch size={14} className="text-blue-600 animate-spin" />
                    )}
                    {downloadProgress.status === 'verifying' && (
                      <CircleNotch size={14} className="text-amber-600 animate-spin" />
                    )}
                    {downloadProgress.status === 'completed' && (
                      <CheckCircle size={14} className="text-green-600" />
                    )}
                    {downloadProgress.status === 'error' && (
                      <XCircle size={14} className="text-red-600" />
                    )}
                    <span className="font-medium text-sm">
                      {downloadProgress.modelName} model
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {downloadProgress.status === 'downloading' && 'Downloading...'}
                      {downloadProgress.status === 'verifying' && 'Verifying...'}
                      {downloadProgress.status === 'completed' && 'Completed'}
                      {downloadProgress.status === 'error' && 'Failed'}
                    </span>
                  </div>
                  {downloadProgress.status === 'downloading' && (
                    <Button size="sm" variant="ghost" onClick={cancelDownload}>
                      <X size={14} />
                    </Button>
                  )}
                </div>
                
                <Progress value={downloadProgress.progress} className="mb-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatBytes(downloadProgress.bytesDownloaded)} / {formatBytes(downloadProgress.totalBytes)}
                  </span>
                  {downloadProgress.speed > 0 && (
                    <span>{formatSpeed(downloadProgress.speed)}</span>
                  )}
                </div>
                
                {downloadProgress.error && (
                  <div className="mt-2 text-xs text-red-600">{downloadProgress.error}</div>
                )}
              </div>
            )}

            {/* Model Configs */}
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
                        <Badge variant="outline" className="text-xs">
                          {typedConfig.size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typedConfig.quantization}
                        </Badge>
                        {isDownloaded && (
                          <Badge variant="outline" className="text-green-600 bg-green-50 text-xs">
                            <Check size={10} className="mr-1" />
                            Downloaded
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

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="font-medium">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(performanceMetrics.inferenceTime)}ms
                </div>
                <div className="text-xs text-muted-foreground">Inference Time</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatBytes(performanceMetrics.memoryUsage * 1024 * 1024)}
                </div>
                <div className="text-xs text-muted-foreground">Memory Usage</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(performanceMetrics.throughput)}
                </div>
                <div className="text-xs text-muted-foreground">Tokens/sec</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(performanceMetrics.accuracy * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="space-y-3">
            <h3 className="font-medium">Optimization Tips</h3>
            <div className="space-y-2">
              {deviceSpecs.accelerationSupport.metal && currentStatus.accelerationId !== 'metal' && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                  <Info size={14} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Enable Metal acceleration</div>
                    <div className="text-xs text-muted-foreground">
                      Your device supports Metal which can provide up to 3x faster inference
                    </div>
                  </div>
                </div>
              )}
              
              {deviceSpecs.memoryGB < 4 && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
                  <Warning size={14} className="text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Limited memory detected</div>
                    <div className="text-xs text-muted-foreground">
                      Consider using smaller models or close other apps to free up memory
                    </div>
                  </div>
                </div>
              )}
              
              {downloadedModels.length === 0 && (
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded text-sm">
                  <Download size={14} className="text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Download optimized models</div>
                    <div className="text-xs text-muted-foreground">
                      Download models optimized for your device to improve performance
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-3">
            <h3 className="font-medium">System Information</h3>
            <div className="p-3 border rounded-lg bg-muted/50 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Platform:</span> {deviceSpecs.platform}
                </div>
                <div>
                  <span className="font-medium">Architecture:</span> {deviceSpecs.architecture}
                </div>
                <div>
                  <span className="font-medium">Cores:</span> {deviceSpecs.cores}
                </div>
                <div>
                  <span className="font-medium">Memory:</span> {deviceSpecs.memoryGB}GB
                </div>
                {deviceSpecs.gpuVendor && (
                  <div>
                    <span className="font-medium">GPU:</span> {deviceSpecs.gpuVendor}
                  </div>
                )}
                <div>
                  <span className="font-medium">Accelerations:</span> {Object.entries(deviceSpecs.accelerationSupport).filter(([_, supported]) => supported).length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};