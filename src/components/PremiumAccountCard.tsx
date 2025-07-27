import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCloudSync } from "@/hooks/use-cloud-sync";
import { 
  Crown, 
  CreditCard, 
  Calendar,
  TrendUp,
  Star,
  CheckCircle,
  Database,
  Devices,
  Timer,
  Gift
} from "@phosphor-icons/react";
import { toast } from "sonner";

export function PremiumAccountCard() {
  const {
    syncState,
    upgradeToPremium,
    cancelSubscription,
    getStorageInfo,
    isTrialActive,
    getTrialDaysLeft,
    billingPlans
  } = useCloudSync();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium_monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const storageInfo = getStorageInfo();
  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const user = syncState.user;

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      await upgradeToPremium(planId);
      setUpgradeDialogOpen(false);
      toast.success("Successfully upgraded to Premium! 🎉");
    } catch (error) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      toast.info("Subscription canceled. You'll keep premium features until your current period ends.");
    } catch (error) {
      toast.error("Failed to cancel subscription. Please contact support.");
    }
  };

  if (!user) return null;

  return (
    <Card className={user.isPremium ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={20} className={user.isPremium ? "text-yellow-600" : "text-muted-foreground"} />
            Account Status
          </div>
          {user.isPremium && (
            <Badge className="bg-yellow-500 text-yellow-50">
              <Star size={12} className="mr-1" />
              Premium
            </Badge>
          )}
          {trialActive && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Timer size={12} className="mr-1" />
              Trial
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Account Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Plan Type</h4>
            <p className="text-sm text-muted-foreground">
              {user.isPremium 
                ? `Premium ${user.planType === 'yearly' ? 'Annual' : 'Monthly'}`
                : 'Free'
              }
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Device Usage</h4>
            <p className="text-sm text-muted-foreground">
              {syncState.deviceCount}/{user.deviceLimit} devices
            </p>
          </div>
        </div>

        {/* Storage Usage */}
        {storageInfo && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Database size={14} />
                Storage
              </h4>
              <span className="text-xs text-muted-foreground">
                {storageInfo.isUnlimited ? 'Unlimited' : 
                  `${storageInfo.used.toFixed(1)}/${storageInfo.limit} MB`}
              </span>
            </div>
            {!storageInfo.isUnlimited && (
              <Progress value={storageInfo.percentage} className="h-2" />
            )}
          </div>
        )}

        <Separator />

        {/* Trial Information */}
        {trialActive && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={16} className="text-blue-600" />
              <span className="font-medium text-blue-800">Free Trial Active</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} remaining in your premium trial
            </p>
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Upgrade Now
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown size={20} />
                    Choose Your Premium Plan
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  {billingPlans.filter(plan => plan.id !== 'free').map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                      } ${plan.popular ? 'border-yellow-500' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="bg-yellow-500 text-yellow-50 text-center py-1 text-sm font-medium">
                          Most Popular
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
                        {plan.interval === 'year' && (
                          <Badge variant="outline" className="text-green-600">
                            Save 17%
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade(selectedPlan)}
                    disabled={isUpgrading}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} className="mr-2" />
                        Upgrade to Premium
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Premium Benefits */}
        {user.isPremium && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={16} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">Premium Benefits Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-yellow-700">
                <CheckCircle size={12} />
                Unlimited storage
              </div>
              <div className="flex items-center gap-1 text-yellow-700">
                <CheckCircle size={12} />
                5 device sync
              </div>
              <div className="flex items-center gap-1 text-yellow-700">
                <CheckCircle size={12} />
                Advanced ML models
              </div>
              <div className="flex items-center gap-1 text-yellow-700">
                <CheckCircle size={12} />
                Priority support
              </div>
            </div>
            
            {user.subscriptionEnds && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-yellow-700">
                      {user.subscriptionStatus === 'canceled' ? 'Access ends' : 'Next billing'}: {' '}
                      {user.subscriptionEnds.toLocaleDateString()}
                    </p>
                  </div>
                  {user.subscriptionStatus === 'active' && (
                    <Button 
                      onClick={handleCancel}
                      variant="outline" 
                      size="sm"
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Free Account CTA */}
        {!user.isPremium && !trialActive && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">Upgrade to Premium</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Unlock unlimited storage, advanced ML models, and multi-device sync
            </p>
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  <CreditCard size={14} className="mr-2" />
                  View Plans
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Crown size={20} />
                    Choose Your Premium Plan
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  {billingPlans.filter(plan => plan.id !== 'free').map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                      } ${plan.popular ? 'border-yellow-500' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="bg-yellow-500 text-yellow-50 text-center py-1 text-sm font-medium">
                          Most Popular
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
                        {plan.interval === 'year' && (
                          <Badge variant="outline" className="text-green-600">
                            Save 17%
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleUpgrade(selectedPlan)}
                    disabled={isUpgrading}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} className="mr-2" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}