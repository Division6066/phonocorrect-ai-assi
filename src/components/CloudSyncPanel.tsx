import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { 
  Cloud, 
  CloudOff, 
  User, 
  Crown, 
  Sync, 
  CheckCircle, 
  XCircle, 
  Loader2,
  CreditCard,
  Shield,
  Smartphone,
  FileText,
  HeadphonesIcon,
  Users
} from "@phosphor-icons/react";
import { toast } from "sonner";

export function CloudSyncPanel() {
  const {
    syncState,
    signIn,
    signUp,
    signOut,
    syncToCloud,
    pullFromCloud,
    upgradeToPremium,
    cancelSubscription,
    getPremiumFeatures,
    updateLocalData,
    localData
  } = useCloudSync();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const premiumFeatures = getPremiumFeatures();

  const handleAuth = async () => {
    if (!credentials.email || !credentials.password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsAuthenticating(true);
    try {
      if (authMode === 'signin') {
        await signIn(credentials.email, credentials.password);
        toast.success("Signed in successfully!");
      } else {
        await signUp(credentials.email, credentials.password);
        toast.success("Account created successfully!");
      }
      setCredentials({ email: '', password: '' });
    } catch (error) {
      // Error is already handled in the hook and displayed in syncState
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.info("Signed out successfully");
  };

  const handleSync = async () => {
    try {
      await syncToCloud();
      toast.success("Data synced to cloud!");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handlePull = async () => {
    try {
      await pullFromCloud();
      toast.success("Data pulled from cloud!");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      toast.success("Upgraded to Premium! 🎉");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast.info("Subscription canceled");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud size={20} />
            Cloud Sync & Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {syncState.connectionStatus === 'online' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-sm">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <CloudOff size={16} />
                  <span className="text-sm">Offline</span>
                </div>
              )}
            </div>
            
            {syncState.isAuthenticated && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User size={12} />
                {syncState.user?.email}
              </Badge>
            )}
            
            {syncState.user?.isPremium && (
              <Badge className="flex items-center gap-1 bg-yellow-500 text-yellow-50">
                <Crown size={12} />
                Premium
              </Badge>
            )}
          </div>

          {syncState.syncError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md mb-4">
              <XCircle size={16} />
              <span className="text-sm">{syncState.syncError}</span>
            </div>
          )}

          <p className="text-muted-foreground">
            Sync your preferences, documents, and settings across all devices with Firebase backend.
          </p>
        </CardContent>
      </Card>

      {/* Authentication */}
      {!syncState.isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={authMode === 'signin' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signin')}
                size="sm"
              >
                Sign In
              </Button>
              <Button
                variant={authMode === 'signup' ? 'default' : 'outline'}
                onClick={() => setAuthMode('signup')}
                size="sm"
              >
                Sign Up
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button 
              onClick={handleAuth}
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                authMode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <div className="text-xs text-muted-foreground">
              Test credentials: test@example.com / password123
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Account Information
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{syncState.user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {syncState.user?.isPremium ? 'Premium' : 'Free'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {syncState.user?.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(syncState.lastSync)}
                  </p>
                </div>
              </div>

              {syncState.user?.isPremium && syncState.user.subscriptionEnds && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Subscription Status</Label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      {syncState.user.subscriptionStatus} until {syncState.user.subscriptionEnds.toLocaleDateString()}
                    </span>
                    <Button onClick={handleCancelSubscription} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sync Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={handleSync}
                  disabled={syncState.syncing || syncState.connectionStatus === 'offline'}
                  size="sm"
                  className="flex-1"
                >
                  {syncState.syncing ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Sync size={14} className="mr-2" />
                      Push to Cloud
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handlePull}
                  disabled={syncState.syncing || syncState.connectionStatus === 'offline'}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Cloud size={14} className="mr-2" />
                  Pull from Cloud
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Auto-sync is {syncState.user?.isPremium ? 'enabled' : 'disabled'} 
                {syncState.user?.isPremium && ' (Premium feature)'}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown size={16} />
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!syncState.user?.isPremium && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} className="text-yellow-600" />
                <span className="font-medium text-yellow-800">Upgrade to Premium</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Unlock advanced features and cloud sync for $5/month
              </p>
              <Button 
                onClick={handleUpgrade}
                className="bg-yellow-600 hover:bg-yellow-700"
                size="sm"
              >
                <CreditCard size={14} className="mr-2" />
                Upgrade Now
              </Button>
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud size={14} />
                <span className="text-sm">Cloud Sync</span>
              </div>
              {premiumFeatures.cloudSync ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span className="text-sm">Advanced ML Models</span>
              </div>
              {premiumFeatures.advancedML ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={14} />
                <span className="text-sm">Multi-Device Support</span>
              </div>
              {premiumFeatures.multiDevice ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span className="text-sm">Export Formats</span>
              </div>
              {premiumFeatures.exportFormats ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeadphonesIcon size={14} />
                <span className="text-sm">Voice Cloning</span>
              </div>
              {premiumFeatures.voiceCloning ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span className="text-sm">Priority Support</span>
              </div>
              {premiumFeatures.prioritySupport ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}