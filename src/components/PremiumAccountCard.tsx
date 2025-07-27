import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Cloud } from "@phosphor-icons/react";

export const PremiumAccountCard: React.FC = () => {
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
            Free Plan
          </Badge>
          <p className="text-xs text-muted-foreground text-center">
            Upgrade for cloud sync and advanced features
          </p>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud size={12} />
            <span>Multi-device sync</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard size={12} />
            <span>Advanced ML models</span>
          </div>
        </div>
        
        <Button size="sm" className="w-full">
          Upgrade to Premium
        </Button>
      </CardContent>
    </Card>
  );
};