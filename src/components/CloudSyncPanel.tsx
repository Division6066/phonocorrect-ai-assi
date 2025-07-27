import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Database,
  Calendar,
  Devices,
  Star,
  Timer,
  Warning,
  TrendUp
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
    updateProfile,
    getPremiumFeatures,
    updateLocalData,
    getStorageInfo,
    isTrialActive,
    getTrialDaysLeft,
    billingPlans,
    localData
  } = useCloudSync();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium_monthly');
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: syncState.user?.displayName || '',
    email: syncState.user?.email || ''
  });

  const premiumFeatures = getPremiumFeatures();
  const storageInfo = getStorageInfo();
  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

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

  const handleUpgrade = async (planId?: string) => {
    try {
      await upgradeToPremium(planId || selectedPlan);
      toast.success("Upgraded to Premium! 🎉");
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profileData);
      setProfileEditing(false);
      toast.success("Profile updated successfully!");
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
          <div className="flex items-center gap-4 mb-4 flex-wrap">
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

            {trialActive && (
              <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-600">
                <Timer size={12} />
                Trial: {trialDaysLeft} days left
              </Badge>
            )}

            {syncState.deviceCount > 1 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Devices size={12} />
                {syncState.deviceCount} devices
              </Badge>
            )}
          </div>

          {syncState.syncError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md mb-4">
              <XCircle size={16} />
              <span className="text-sm">{syncState.syncError}</span>
            </div>
          )}

          {/* Trial Warning */}
          {trialActive && trialDaysLeft <= 3 && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-md mb-4">
              <Warning size={16} />
              <span className="text-sm">
                Your trial expires in {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'}. 
                Upgrade now to keep your premium features!
              </span>
            </div>
          )}

          <p className="text-muted-foreground">
            Sync your preferences, documents, and settings across all devices with secure cloud storage.
          </p>
        </CardContent>
      </Card>

      {!syncState.isAuthenticated ? (
        /* Authentication Card */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Get Started</CardTitle>
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

            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <strong>Test accounts:</strong>
              </div>
              <div>Free: test@example.com / password123</div>
              <div>Premium: premium@example.com / premium123</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="sync">Sync & Storage</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Profile Information
                  <Button onClick={() => setProfileEditing(!profileEditing)} variant="outline" size="sm">
                    {profileEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} size="sm">
                        Save Changes
                      </Button>
                      <Button onClick={() => setProfileEditing(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Display Name</Label>
                      <p className="text-sm text-muted-foreground">
                        {syncState.user?.displayName || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{syncState.user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Type</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {syncState.user?.isPremium ? 'Premium' : 'Free'}
                        </p>
                        {trialActive && (
                          <Badge variant="outline" className="text-xs">Trial</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">
                        {syncState.user?.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Device Limit</Label>
                      <p className="text-sm text-muted-foreground">
                        {syncState.deviceCount}/{syncState.user?.deviceLimit} devices
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {syncState.user?.lastLogin?.toLocaleDateString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between">
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                  {!syncState.user?.isPremium && (
                    <Button onClick={() => handleUpgrade()} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      <Crown size={14} className="mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync & Storage Tab */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sync size={16} />
                  Sync Controls
                </CardTitle>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last Sync</span>
                    <span className="text-muted-foreground">
                      {formatDate(syncState.lastSync)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Auto-sync is {syncState.user?.isPremium ? 'enabled' : 'disabled'} 
                    {syncState.user?.isPremium ? ' (every 2 minutes)' : ' (Premium feature)'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database size={16} />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {storageInfo && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used Storage</span>
                        <span className="text-muted-foreground">
                          {storageInfo.isUnlimited ? 'Unlimited' : 
                            `${storageInfo.used.toFixed(1)} / ${storageInfo.limit} MB`}
                        </span>
                      </div>
                      {!storageInfo.isUnlimited && (
                        <Progress value={storageInfo.percentage} className="h-2" />
                      )}
                    </div>
                    
                    {storageInfo.percentage > 80 && !storageInfo.isUnlimited && (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded text-sm">
                        <Warning size={14} />
                        Storage almost full. Upgrade for unlimited space.
                      </div>
                    )}
                  </>
                )}

                <div className="text-xs text-muted-foreground">
                  Includes documents, preferences, and voice models
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Premium Features Tab */}
          <TabsContent value="premium" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown size={16} />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <Database size={14} />
                      <span className="text-sm">Unlimited Storage</span>
                    </div>
                    {premiumFeatures.unlimitedStorage ? (
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
                      <TrendUp size={14} />
                      <span className="text-sm">Batch Processing</span>
                    </div>
                    {premiumFeatures.batchProcessing ? (
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

                {!syncState.user?.isPremium && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => handleUpgrade()}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Crown size={14} className="mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            {!syncState.user?.isPremium ? (
              /* Pricing Plans */
              <div className="grid gap-4 md:grid-cols-3">
                {billingPlans.map((plan) => (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-yellow-500 shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-500 text-yellow-50">
                          <Star size={12} className="mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.interval}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      {plan.id !== 'free' && (
                        <Button 
                          onClick={() => handleUpgrade(plan.id)}
                          className={`w-full ${plan.popular ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                          variant={plan.popular ? 'default' : 'outline'}
                        >
                          <CreditCard size={14} className="mr-2" />
                          Choose Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Current Subscription */
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard size={16} />
                    Current Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Plan</Label>
                      <p className="text-sm text-muted-foreground">
                        Premium {syncState.user?.planType === 'yearly' ? 'Annual' : 'Monthly'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground capitalize">
                          {syncState.user?.subscriptionStatus}
                        </p>
                        {syncState.user?.subscriptionStatus === 'active' && (
                          <CheckCircle size={14} className="text-green-600" />
                        )}
                      </div>
                    </div>
                    {syncState.billingInfo?.nextBilling && (
                      <>
                        <div>
                          <Label className="text-sm font-medium">Next Billing</Label>
                          <p className="text-sm text-muted-foreground">
                            {syncState.billingInfo.nextBilling.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Amount</Label>
                          <p className="text-sm text-muted-foreground">
                            ${syncState.billingInfo.amount} {syncState.billingInfo.currency}
                          </p>
                        </div>
                      </>
                    )}
                    {syncState.billingInfo?.paymentMethod && (
                      <div>
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <p className="text-sm text-muted-foreground">
                          {syncState.billingInfo.paymentMethod}
                        </p>
                      </div>
                    )}
                    {syncState.user?.subscriptionEnds && (
                      <div>
                        <Label className="text-sm font-medium">
                          {syncState.user.subscriptionStatus === 'canceled' ? 'Access Ends' : 'Renews'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {syncState.user.subscriptionEnds.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {syncState.user?.subscriptionStatus === 'active' && (
                    <div className="border-t pt-4">
                      <Button 
                        onClick={handleCancelSubscription} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel Subscription
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        You'll keep premium features until {syncState.user?.subscriptionEnds?.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}