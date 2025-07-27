import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendUp, CheckCircle, XCircle } from "@phosphor-icons/react";
import { UserPreference } from "@/lib/phoneticEngine";

interface LearningStatsProps {
  preferences: UserPreference[];
}

export function LearningStats({ preferences }: LearningStatsProps) {
  const totalInteractions = preferences.reduce((sum, pref) => sum + pref.accepted + pref.rejected, 0);
  const totalAccepted = preferences.reduce((sum, pref) => sum + pref.accepted, 0);
  const totalRejected = preferences.reduce((sum, pref) => sum + pref.rejected, 0);
  
  const acceptanceRate = totalInteractions > 0 ? (totalAccepted / totalInteractions) * 100 : 0;
  
  // Find patterns with significant interactions
  const learnedPatterns = preferences.filter(pref => {
    const total = pref.accepted + pref.rejected;
    return total >= 3; // At least 3 interactions to be considered "learned"
  });

  const getPatternAcceptanceRate = (pref: UserPreference) => {
    const total = pref.accepted + pref.rejected;
    return total > 0 ? (pref.accepted / total) * 100 : 0;
  };

  if (totalInteractions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendUp size={16} />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start accepting or rejecting suggestions to see your learning progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendUp size={16} />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-primary">{totalInteractions}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">{totalAccepted}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">{totalRejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Acceptance Rate</span>
            <span className="text-sm text-muted-foreground">{acceptanceRate.toFixed(1)}%</span>
          </div>
          <Progress value={acceptanceRate} className="h-2" />
        </div>

        {/* Learned Patterns */}
        {learnedPatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Learned Patterns</h4>
            <div className="space-y-2">
              {learnedPatterns.slice(0, 3).map((pref, index) => {
                const rate = getPatternAcceptanceRate(pref);
                const isPreferred = rate >= 70;
                const isRejected = rate <= 30;
                
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1 mr-2">{pref.pattern}</span>
                    <div className="flex items-center gap-1">
                      {isPreferred && <CheckCircle size={12} className="text-green-600" />}
                      {isRejected && <XCircle size={12} className="text-red-600" />}
                      <Badge variant="outline" className="text-xs">
                        {rate.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            {learnedPatterns.length > 3 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{learnedPatterns.length - 3} more patterns learned
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}