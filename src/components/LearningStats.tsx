import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendUp, Check, X } from "@phosphor-icons/react";

interface LearningStatsProps {
  preferences: {
    acceptedSuggestions: number;
    rejectedSuggestions: number;
    learnedPatterns: string[];
  };
}

export const LearningStats: React.FC<LearningStatsProps> = ({ preferences }) => {
  const total = preferences.acceptedSuggestions + preferences.rejectedSuggestions;
  const accuracy = total > 0 ? (preferences.acceptedSuggestions / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendUp size={16} />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Accuracy</span>
            <span>{Math.round(accuracy)}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-green-600" />
            <div>
              <div className="font-medium">{preferences.acceptedSuggestions}</div>
              <div className="text-muted-foreground text-xs">Accepted</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <X size={14} className="text-red-600" />
            <div>
              <div className="font-medium">{preferences.rejectedSuggestions}</div>
              <div className="text-muted-foreground text-xs">Rejected</div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-1">Learned Patterns</div>
          <div className="text-muted-foreground text-xs">
            {preferences.learnedPatterns.length} patterns learned
          </div>
        </div>
      </CardContent>
    </Card>
  );
};