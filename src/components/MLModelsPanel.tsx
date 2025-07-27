import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cpu, Download, Check, Warning } from "@phosphor-icons/react";

export const MLModelsPanel: React.FC = () => {
  const models = [
    { name: 'Gemma-2B (Phonetic)', size: '1.2GB', status: 'ready', progress: 100 },
    { name: 'Whisper Tiny', size: '40MB', status: 'ready', progress: 100 },
    { name: 'Coqui TTS', size: '200MB', status: 'downloading', progress: 45 },
    { name: 'Tesseract OCR', size: '15MB', status: 'not-installed', progress: 0 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu size={20} />
            ML Models Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage on-device AI models for offline functionality
          </p>
          
          <div className="space-y-3">
            {models.map((model) => (
              <div key={model.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{model.name}</span>
                    <span className="text-xs text-muted-foreground">({model.size})</span>
                    {model.status === 'ready' && (
                      <Badge variant="outline" className="text-green-600">
                        <Check size={12} className="mr-1" />
                        Ready
                      </Badge>
                    )}
                    {model.status === 'downloading' && (
                      <Badge variant="outline" className="text-blue-600">
                        Downloading
                      </Badge>
                    )}
                    {model.status === 'not-installed' && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not Installed
                      </Badge>
                    )}
                  </div>
                  
                  {model.status === 'downloading' && (
                    <Progress value={model.progress} className="h-1 mt-2" />
                  )}
                </div>
                
                <div className="ml-4">
                  {model.status === 'not-installed' && (
                    <Button size="sm" variant="outline">
                      <Download size={14} className="mr-1" />
                      Install
                    </Button>
                  )}
                  {model.status === 'downloading' && (
                    <Button size="sm" variant="outline" disabled>
                      {model.progress}%
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Warning size={14} />
              <span>Total storage: 1.4GB of 4GB used</span>
            </div>
            <Progress value={35} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};