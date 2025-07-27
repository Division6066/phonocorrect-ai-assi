import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, CreditCard, ArrowsClockwise, Check, X } from "@phosphor-icons/react";

export const CloudSyncPanel: React.FC = () => {
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
              <div>
                <div className="font-medium">Free Plan</div>
                <div className="text-sm text-muted-foreground">Local storage only</div>
              </div>
              <Badge variant="outline">Free</Badge>
            </div>
          </div>

          {/* Premium Features */}
          <div className="space-y-3">
            <h3 className="font-medium">Premium Features</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-sm">Multi-device sync</span>
                </div>
                <span className="text-xs text-muted-foreground">Requires Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-sm">Cloud inference fallback</span>
                </div>
                <span className="text-xs text-muted-foreground">Requires Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <span className="text-xs text-muted-foreground">Requires Premium</span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Sync Status</h3>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowsClockwise size={14} />
                <span>Local storage only (no sync)</span>
              </div>
            </div>
          </div>

          {/* Upgrade Section */}
          <div className="space-y-3">
            <h3 className="font-medium">Upgrade to Premium</h3>
            <div className="p-4 border rounded-lg bg-primary/5">
              <div className="text-center space-y-3">
                <div>
                  <div className="text-2xl font-bold">$5</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <Button className="w-full">
                  <CreditCard size={14} className="mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-3">
            <h3 className="font-medium">Data Management</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Export Learning Data
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Clear Local Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};