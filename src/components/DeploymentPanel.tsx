import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeployment } from "@/hooks/use-deployment";
import { 
  Smartphone, 
  ChromeLogo, 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ExternalLink,
  Settings,
  Package,
  Code
} from "@phosphor-icons/react";
import { toast } from "sonner";

export function DeploymentPanel() {
  const {
    deploymentState,
    deployiOSApp,
    deployAndroidApp,
    deployChromeExtension,
    deployAll,
    updateConfig,
    clearLogs,
    resetTarget,
    config
  } = useDeployment();

  const [showLogs, setShowLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'building':
      case 'deploying':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'building':
      case 'deploying':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleDeploy = async (platform: string) => {
    try {
      switch (platform) {
        case 'ios':
          await deployiOSApp();
          break;
        case 'android':
          await deployAndroidApp();
          break;
        case 'chrome':
          await deployChromeExtension();
          break;
        case 'all':
          await deployAll();
          break;
      }
    } catch (error) {
      toast.error(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
        return <Smartphone size={20} />;
      case 'android':
        return <Smartphone size={20} />;
      case 'chrome':
        return <ChromeLogo size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket size={20} />
            Deploy Mobile Apps & Chrome Extension
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Deploy PhonoCorrect AI to app stores and publish the Chrome extension to the Web Store.
          </p>
          
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={() => handleDeploy('all')}
              disabled={deploymentState.building}
              className="flex-1"
            >
              {deploymentState.building ? 'Deploying...' : 'Deploy All Platforms'}
            </Button>
            <Button 
              onClick={() => setShowLogs(!showLogs)}
              variant="outline"
              size="sm"
            >
              <Code size={14} className="mr-2" />
              {showLogs ? 'Hide' : 'Show'} Logs
            </Button>
            <Button 
              onClick={clearLogs}
              variant="outline"
              size="sm"
            >
              Clear Logs
            </Button>
          </div>

          {/* Build Progress */}
          {deploymentState.building && deploymentState.currentBuild && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">
                  Building {deploymentState.currentBuild}...
                </span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
          )}

          {/* Build Logs */}
          {showLogs && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Build Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-3 rounded-md font-mono text-xs max-h-60 overflow-y-auto">
                  {deploymentState.buildLogs.length === 0 ? (
                    <div className="text-gray-500">No build logs yet...</div>
                  ) : (
                    deploymentState.buildLogs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Deployment Targets */}
      <div className="grid md:grid-cols-3 gap-4">
        {deploymentState.targets.map((target) => (
          <Card key={target.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getPlatformIcon(target.platform)}
                {target.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(target.status)}
                <Badge 
                  variant="outline" 
                  className={getStatusColor(target.status)}
                >
                  {target.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Version</Label>
                <p className="text-sm font-medium">{target.version}</p>
              </div>
              
              {target.lastDeployed && (
                <div>
                  <Label className="text-xs">Last Deployed</Label>
                  <p className="text-sm">{target.lastDeployed.toLocaleString()}</p>
                </div>
              )}

              {target.error && (
                <div className="bg-red-50 border border-red-200 p-2 rounded-md">
                  <p className="text-xs text-red-600">{target.error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDeploy(target.platform)}
                  disabled={deploymentState.building || target.status === 'building'}
                  size="sm"
                  className="flex-1"
                >
                  {target.status === 'building' ? 'Building...' : 'Deploy'}
                </Button>
                
                {target.downloadUrl && (
                  <Button
                    onClick={() => window.open(target.downloadUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink size={14} />
                  </Button>
                )}
                
                {target.status === 'failed' && (
                  <Button
                    onClick={() => resetTarget(target.id)}
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings size={16} />
            Deployment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ios" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ios">iOS</TabsTrigger>
              <TabsTrigger value="android">Android</TabsTrigger>
              <TabsTrigger value="chrome">Chrome</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ios" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bundle ID</Label>
                  <Input
                    value={config.ios.bundleId}
                    onChange={(e) => updateConfig('ios', { bundleId: e.target.value })}
                    placeholder="com.example.app"
                  />
                </div>
                <div>
                  <Label>Team ID</Label>
                  <Input
                    value={config.ios.teamId}
                    onChange={(e) => updateConfig('ios', { teamId: e.target.value })}
                    placeholder="TEAM123456"
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={config.ios.version}
                    onChange={(e) => updateConfig('ios', { version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label>Build Number</Label>
                  <Input
                    value={config.ios.buildNumber}
                    onChange={(e) => updateConfig('ios', { buildNumber: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="android" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={config.android.packageName}
                    onChange={(e) => updateConfig('android', { packageName: e.target.value })}
                    placeholder="com.example.app"
                  />
                </div>
                <div>
                  <Label>Keystore</Label>
                  <Input
                    value={config.android.keystore}
                    onChange={(e) => updateConfig('android', { keystore: e.target.value })}
                    placeholder="release.keystore"
                  />
                </div>
                <div>
                  <Label>Version Name</Label>
                  <Input
                    value={config.android.versionName}
                    onChange={(e) => updateConfig('android', { versionName: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label>Version Code</Label>
                  <Input
                    type="number"
                    value={config.android.versionCode}
                    onChange={(e) => updateConfig('android', { versionCode: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="chrome" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Extension ID</Label>
                  <Input
                    value={config.chrome.extensionId}
                    onChange={(e) => updateConfig('chrome', { extensionId: e.target.value })}
                    placeholder="abcdefghijklmnopqrstuvwxyz123456"
                  />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={config.chrome.version}
                    onChange={(e) => updateConfig('chrome', { version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <Textarea
                  value={config.chrome.permissions.join('\n')}
                  onChange={(e) => updateConfig('chrome', { 
                    permissions: e.target.value.split('\n').filter(p => p.trim()) 
                  })}
                  placeholder="activeTab&#10;storage&#10;scripting"
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deployment Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deployment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {deploymentState.targets.filter(t => t.status === 'published').length}
              </div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {deploymentState.targets.filter(t => t.status === 'building').length}
              </div>
              <div className="text-xs text-muted-foreground">Building</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {deploymentState.targets.filter(t => t.status === 'failed').length}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {deploymentState.buildLogs.length}
              </div>
              <div className="text-xs text-muted-foreground">Log Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}