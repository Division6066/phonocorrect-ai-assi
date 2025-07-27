import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Info } from "@phosphor-icons/react";
import { Suggestion } from "@/lib/phoneticEngine";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
  getConfidenceColor: (confidence: number) => string;
  getConfidenceLabel: (confidence: number) => string;
}

export function SuggestionCard({ 
  suggestion, 
  onAccept, 
  onReject, 
  getConfidenceColor,
  getConfidenceLabel 
}: SuggestionCardProps) {
  const confidencePercentage = Math.round(suggestion.confidence * 100);

  return (
    <Card className="mb-3 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground line-through">
                {suggestion.original}
              </span>
              <span className="text-sm text-muted-foreground">→</span>
              <span className="font-medium text-primary">
                {suggestion.suggestion}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getConfidenceColor(suggestion.confidence)}>
                {confidencePercentage}% confident
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{suggestion.pattern}</p>
                    <p className="text-xs">{getConfidenceLabel(suggestion.confidence)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {suggestion.pattern}
            </p>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
            >
              <X size={14} />
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="h-8 w-8 p-0 bg-accent hover:bg-accent/90"
            >
              <Check size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}