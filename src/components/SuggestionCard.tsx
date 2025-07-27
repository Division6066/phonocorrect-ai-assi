import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "@phosphor-icons/react";

interface SuggestionCardProps {
  suggestion: {
    original: string;
    suggestion: string;
    confidence: number;
    explanation?: string;
  };
  onAccept: () => void;
  onReject: () => void;
  getConfidenceColor: (confidence: number) => string;
  getConfidenceLabel: (confidence: number) => string;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAccept,
  onReject,
  getConfidenceColor,
  getConfidenceLabel
}) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-red-600 line-through text-sm">{suggestion.original}</span>
          <span>→</span>
          <span className="text-green-600 font-medium text-sm">{suggestion.suggestion}</span>
          <Badge variant="outline" className={getConfidenceColor(suggestion.confidence)}>
            {getConfidenceLabel(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
          </Badge>
        </div>
        {suggestion.explanation && (
          <p className="text-xs text-muted-foreground">{suggestion.explanation}</p>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <Button size="sm" variant="outline" onClick={onAccept}>
          <Check size={14} />
        </Button>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};