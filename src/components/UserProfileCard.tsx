import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { User, SignOut, Crown, Settings, CreditCard } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const UserProfileCard: React.FC = () => {
  const { user, userProfile, logout, isPremium } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const getSubscriptionBadge = () => {
    if (!userProfile) return null;

    switch (userProfile.subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Premium</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Payment Required</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">Free Plan</Badge>;
    }
  };

  if (!user || !userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User size={16} />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in to sync your learning data across devices and access premium features.
          </p>
          
          <div className="space-y-2">
            <AuthDialog>
              <Button className="w-full">
                Sign In
              </Button>
            </AuthDialog>
            
            <AuthDialog defaultTab="signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </AuthDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User size={16} />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
            <AvatarFallback>
              {userProfile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userProfile.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
          </div>
        </div>

        <Separator />

        {/* Subscription Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription</span>
            {getSubscriptionBadge()}
          </div>
          
          {isPremium ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Crown size={14} />
              <span>Premium features active</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Upgrade to Premium for cloud sync and advanced features
            </p>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          {!isPremium && (
            <AuthDialog>
              <Button size="sm" className="w-full">
                <Crown size={14} className="mr-2" />
                Upgrade to Premium
              </Button>
            </AuthDialog>
          )}
          
          {isPremium && (
            <Button size="sm" variant="outline" className="w-full">
              <CreditCard size={14} className="mr-2" />
              Manage Subscription
            </Button>
          )}
          
          <Button size="sm" variant="outline" className="w-full">
            <Settings size={14} className="mr-2" />
            Account Settings
          </Button>
          
          <Button size="sm" variant="outline" onClick={handleSignOut} className="w-full">
            <SignOut size={14} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};