import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Cloud, Lightning, Brain } from "@phosphor-icons/react";
import { useAuth } from '@/contexts/AuthContext-mock';
import { AuthDialog } from './AuthDialog';
import { createCheckoutSession, createPortalLink, PREMIUM_PRICE_ID } from '@/lib/stripe';
import { toast } from 'sonner';

export const PremiumAccountCard: React.FC = () => {
  const { user, userProfile, isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

  const getSubscriptionBadge = () => {
    if (!userProfile) return null;

    switch (userProfile.subscriptionStatus) {
      case 'active':
        return (
          <Badge className="w-full justify-center bg-green-100 text-green-800">
            <Crown size={12} className="mr-1" />
            Premium Active
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="destructive" className="w-full justify-center">
            Payment Required
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="w-full justify-center">
            Premium Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="w-full justify-center">
            Free Plan
          </Badge>
        );
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Crown size={16} className="text-yellow-600" />
            Premium Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Badge variant="outline" className="w-full justify-center">
              Not Signed In
            </Badge>
            <p className="text-xs text-muted-foreground text-center">
              Sign in to access Premium features
            </p>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud size={12} />
              <span>Multi-device sync</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain size={12} />
              <span>Advanced ML models</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lightning size={12} />
              <span>Cloud inference fallback</span>
            </div>
          </div>
          
          <AuthDialog>
            <Button size="sm" className="w-full">
              <Crown size={14} className="mr-2" />
              Sign In for Premium
            </Button>
          </AuthDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Crown size={16} className="text-yellow-600" />
          Premium Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {getSubscriptionBadge()}
          
          {!isPremium && (
            <p className="text-xs text-muted-foreground text-center">
              Upgrade for cloud sync and advanced features
            </p>
          )}

          {isPremium && (
            <p className="text-xs text-green-600 text-center">
              All premium features are active
            </p>
          )}
        </div>
        
        <div className="space-y-2 text-xs">
          <div className={`flex items-center gap-2 ${isPremium ? 'text-green-600' : 'text-muted-foreground'}`}>
            <Cloud size={12} />
            <span>Multi-device sync</span>
          </div>
          <div className={`flex items-center gap-2 ${isPremium ? 'text-green-600' : 'text-muted-foreground'}`}>
            <Brain size={12} />
            <span>Advanced ML models</span>
          </div>
          <div className={`flex items-center gap-2 ${isPremium ? 'text-green-600' : 'text-muted-foreground'}`}>
            <Lightning size={12} />
            <span>Cloud inference fallback</span>
          </div>
        </div>
        
        {!isPremium ? (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-lg font-bold">$5</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              <Crown size={14} className="mr-2" />
              {isLoading ? 'Loading...' : 'Upgrade to Premium'}
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            <CreditCard size={14} className="mr-2" />
            {isLoading ? 'Loading...' : 'Manage Subscription'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};