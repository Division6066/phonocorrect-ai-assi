import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Download, Package, Globe, Smartphone, MonitorPlay } from "@phosphor-icons/react";

export const DeploymentPanel: React.FC = () => {
  const platforms = [
    { name: 'Web App', icon: Globe, status: 'ready', url: 'https://phonocorrect.ai' },
    { name: 'Desktop App', icon: MonitorPlay, status: 'building', progress: 75 },
    { name: 'Mobile App', icon: Smartphone, status: 'pending', version: 'v1.0.0-beta' },
    { name: 'Chrome Extension', icon: Package, status: 'ready', size: '2.1MB' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket size={20} />
            Deployment & Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Deploy PhonoCorrect AI across multiple platforms and manage distribution
          </p>

          {/* Platform Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Platform Status</h3>
            <div className="space-y-3">
              {platforms.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <platform.icon size={20} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{platform.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {platform.status === 'ready' && platform.url && (
                          <span>Available at {platform.url}</span>
                        )}
                        {platform.status === 'ready' && platform.size && (
                          <span>Size: {platform.size}</span>
                        )}
                        {platform.status === 'building' && (
                          <span>Building... {platform.progress}%</span>
                        )}
                        {platform.status === 'pending' && platform.version && (
                          <span>Version {platform.version} pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {platform.status === 'ready' && (
                      <Badge variant="outline" className="text-green-600">Ready</Badge>
                    )}
                    {platform.status === 'building' && (
                      <Badge variant="outline" className="text-blue-600">Building</Badge>
                    )}
                    {platform.status === 'pending' && (
                      <Badge variant="outline" className="text-yellow-600">Pending</Badge>
                    )}
                    {platform.status === 'ready' && (
                      <Button size="sm" variant="outline">
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build Actions */}
          <div className="space-y-3">
            <h3 className="font-medium">Build Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Build Desktop
              </Button>
              <Button variant="outline" size="sm">
                Build Mobile
              </Button>
              <Button variant="outline" size="sm">
                Package Extension
              </Button>
              <Button variant="outline" size="sm">
                Deploy Web
              </Button>
            </div>
          </div>

          {/* Distribution */}
          <div className="space-y-3">
            <h3 className="font-medium">Distribution</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>App Store (iOS)</span>
                <Badge variant="outline" className="text-muted-foreground">Pending Review</Badge>
              </div>
              <div className="flex justify-between">
                <span>Google Play (Android)</span>
                <Badge variant="outline" className="text-muted-foreground">Not Submitted</Badge>
              </div>
              <div className="flex justify-between">
                <span>Chrome Web Store</span>
                <Badge variant="outline" className="text-green-600">Published</Badge>
              </div>
              <div className="flex justify-between">
                <span>Microsoft Store</span>
                <Badge variant="outline" className="text-muted-foreground">Not Submitted</Badge>
              </div>
            </div>
          </div>

          {/* Release Management */}
          <div className="space-y-3">
            <h3 className="font-medium">Release Management</h3>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="text-sm">
                <div className="font-medium mb-1">Current Version: v1.0.0-beta</div>
                <div className="text-muted-foreground">
                  Last release: 2 days ago
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Create New Release
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};