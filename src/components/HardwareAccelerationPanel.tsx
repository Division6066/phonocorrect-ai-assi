import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Cpu, CheckCircle, AlertTriangle, Info } from "@phosphor-icons/react";

export const HardwareAccelerationPanel: React.FC = () => {
  const accelerationMethods = [
    { name: 'CPU (Fallback)', status: 'active', performance: 45, supported: true },
    { name: 'Metal (Apple Silicon)', status: 'available', performance: 95, supported: true },
    { name: 'CUDA (NVIDIA)', status: 'not-available', performance: 0, supported: false },
    { name: 'OpenCL', status: 'available', performance: 70, supported: true },
    { name: 'WebAssembly SIMD', status: 'active', performance: 60, supported: true }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} />
            Hardware Acceleration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Optimize AI inference performance using available hardware acceleration
          </p>

          {/* Current Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Current Configuration</h3>
            <div className="p-3 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium text-sm">WebAssembly SIMD Active</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Inference time: 45ms | Memory usage: 128MB
              </div>
            </div>
          </div>

          {/* Available Methods */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Acceleration Methods</h3>
            <div className="space-y-3">
              {accelerationMethods.map((method) => (
                <div key={method.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{method.name}</span>
                      {method.status === 'active' && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle size={12} className="mr-1" />
                          Active
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
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Performance: {method.performance}%
                        </div>
                        <Progress value={method.performance} className="h-1" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {method.status === 'available' && (
                      <Button size="sm" variant="outline">
                        Enable
                      </Button>
                    )}
                    {method.status === 'active' && (
                      <Button size="sm" variant="outline" disabled>
                        Active
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h3 className="font-medium">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">45ms</div>
                <div className="text-xs text-muted-foreground">Inference Time</div>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">128MB</div>
                <div className="text-xs text-muted-foreground">Memory Usage</div>
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="space-y-3">
            <h3 className="font-medium">Optimization Tips</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-sm">
                <Info size={14} className="text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Enable Metal acceleration</div>
                  <div className="text-xs text-muted-foreground">
                    For Apple Silicon devices, enable Metal for 2x faster inference
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm">
                <AlertTriangle size={14} className="text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium">Memory optimization</div>
                  <div className="text-xs text-muted-foreground">
                    Close other apps to free up memory for better performance
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-3">
            <h3 className="font-medium">System Information</h3>
            <div className="p-3 border rounded-lg bg-muted/50 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Platform:</span> Web Browser
                </div>
                <div>
                  <span className="font-medium">Cores:</span> 8
                </div>
                <div>
                  <span className="font-medium">Memory:</span> 16GB
                </div>
                <div>
                  <span className="font-medium">GPU:</span> Available
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};