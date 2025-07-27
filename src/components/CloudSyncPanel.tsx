import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Cloud, CreditCard, ArrowsClockwise, Check, X, Warning, User, Upload, Download } from "@phosphor-icons/react";
import { useAuth } from '@/contexts/AuthContext-mock';
import { AuthDialog } from './AuthDialog';
import { createCheckoutSession, createPortalLink, PREMIUM_PRICE_ID } from '@/lib/stripe';
import { toast } from 'sonner';

interface SyncStats {
  lastSyncTime: Date | null;
  totalRules: number;
  syncedRules: number;
  totalLearningData: number;
  syncedLearningData: number;
}

export const CloudSyncPanel: React.FC = () => {
  const { user, userProfile, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    lastSyncTime: null,
    totalRules: 0,
    syncedRules: 0,
    totalLearningData: 0,
    syncedLearningData: 0
  });

  // Mock sync stats - in real implementation, this would come from your sync service
  useEffect(() => {
    if (isPremium) {
      setSyncStats({
        lastSyncTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        totalRules: 15,
        syncedRules: 15,
        totalLearningData: 342,
        syncedLearningData: 342
      });
    } else {
      setSyncStats({
        lastSyncTime: null,
        totalRules: 8,
        syncedRules: 0,
        totalLearningData: 156,
        syncedLearningData: 0
      });
    }
  }, [isPremium]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade to Premium');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckoutSession({
        priceId: PREMIUM_PRICE_ID,
        successUrl: window.location.origin + '?success=true',
        cancelUrl: window.location.origin + '?canceled=true'
      });

      if ((result.data as any)?.url) {
        window.open((result.data as any).url, '_blank');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await createPortalLink({
        returnUrl: window.location.origin
      });

      if ((result.data as any)?.url) {
        window.open((result.data as any).url, '_blank');
      } else {
        throw new Error('Failed to create portal link');
      }
    } catch (error) {
      console.error('Error creating portal link:', error);
      toast.error('Failed to open customer portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isPremium) {
      toast.error('Cloud sync requires Premium subscription');
      return;
    }

    setIsSyncing(true);
    try {
      // Mock sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStats(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        syncedRules: prev.totalRules,
        syncedLearningData: prev.totalLearningData
      }));
      toast.success('Data synced successfully');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Mock export operation
      const data = {
        customRules: [],
        learningData: {},
        preferences: {},
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phonocorrect-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getAccountStatusIcon = () => {
    if (!user) return <User size={16} className="text-muted-foreground" />;
    if (!isPremium) return <X size={16} className="text-red-500" />;
    
    switch (userProfile?.subscriptionStatus) {
      case 'active':
        return <Check size={16} className="text-green-500" />;
      case 'past_due':
        return <Warning size={16} className="text-yellow-500" />;
      default:
        return <X size={16} className="text-red-500" />;
    }
  };

  const getAccountStatusText = () => {
    if (!user) return 'Not signed in';
    if (!userProfile) return 'Loading...';
    
    switch (userProfile.subscriptionStatus) {
      case 'active':
        return 'Premium Active';
      case 'past_due':
        return 'Payment Required';
      case 'canceled':
        return 'Premium Canceled';
      default:
        return 'Free Plan';
    }
  };

  const getSyncProgress = () => {
    const totalItems = syncStats.totalRules + syncStats.totalLearningData;
    const syncedItems = syncStats.syncedRules + syncStats.syncedLearningData;
    return totalItems > 0 ? (syncedItems / totalItems) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud size={20} />
            Cloud Sync & Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Account Status</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getAccountStatusIcon()}
                <div>
                  <div className="font-medium">{getAccountStatusText()}</div>
                  <div className="text-sm text-muted-foreground">
                    {user ? `Signed in as ${userProfile?.displayName || 'User'}` : 'Local storage only'}
                  </div>
                </div>
              </div>
              <Badge variant={isPremium ? "default" : "outline"}>
                {isPremium ? 'Premium' : 'Free'}
              </Badge>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Sync Status</h3>
              {isPremium && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  <ArrowsClockwise size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}
            </div>
            
            <div className="p-3 border rounded-lg">
              {isPremium ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sync Progress</span>
                    <span>{Math.round(getSyncProgress())}%</span>
                  </div>
                  <Progress value={getSyncProgress()} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Custom Rules</div>
                      <div className="text-muted-foreground">
                        {syncStats.syncedRules}/{syncStats.totalRules} synced
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Learning Data</div>
                      <div className="text-muted-foreground">
                        {syncStats.syncedLearningData}/{syncStats.totalLearningData} synced
                      </div>
                    </div>
                  </div>
                  
                  {syncStats.lastSyncTime && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {syncStats.lastSyncTime.toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X size={14} />
                  <span>{user ? 'Cloud sync requires Premium' : 'Sign in for cloud sync'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Features */}
          <div className="space-y-3">
            <h3 className="font-medium">Premium Features</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPremium ? 
                    <Check size={16} className="text-green-500" /> : 
                    <X size={16} className="text-red-500" />
                  }
                  <span className="text-sm">Multi-device sync</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isPremium ? 'Active' : 'Requires Premium'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPremium ? 
                    <Check size={16} className="text-green-500" /> : 
                    <X size={16} className="text-red-500" />
                  }
                  <span className="text-sm">Cloud inference fallback</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isPremium ? 'Active' : 'Requires Premium'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPremium ? 
                    <Check size={16} className="text-green-500" /> : 
                    <X size={16} className="text-red-500" />
                  }
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isPremium ? 'Active' : 'Requires Premium'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!user ? (
              <div>
                <h3 className="font-medium mb-3">Get Started</h3>
                <div className="space-y-2">
                  <AuthDialog>
                    <Button className="w-full">
                      <User size={14} className="mr-2" />
                      Sign In
                    </Button>
                  </AuthDialog>
                  <AuthDialog defaultTab="signup">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </AuthDialog>
                </div>
              </div>
            ) : !isPremium ? (
              <div>
                <h3 className="font-medium mb-3">Upgrade to Premium</h3>
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="text-center space-y-3">
                    <div>
                      <div className="text-2xl font-bold">$5</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={isLoading}
                    >
                      <CreditCard size={14} className="mr-2" />
                      {isLoading ? 'Loading...' : 'Upgrade Now'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-3">Subscription Management</h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                >
                  <CreditCard size={14} className="mr-2" />
                  {isLoading ? 'Loading...' : 'Manage Subscription'}
                </Button>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="space-y-3">
            <h3 className="font-medium">Data Management</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleExportData}
              >
                <Download size={14} className="mr-2" />
                Export Learning Data
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Upload size={14} className="mr-2" />
                Import Learning Data
              </Button>
              <Button variant="destructive" size="sm" className="w-full">
                Clear Local Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};