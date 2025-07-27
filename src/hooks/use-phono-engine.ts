// Mock hook for Phono Engine
import { useState, useEffect } from 'react';

export interface Suggestion {
  original: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
  pattern: string;
  confidence: number;
  explanation?: string;
}

export interface PerformanceMetrics {
  inferenceTimeMs: number;
  memoryUsageMB: number;
}

export interface UserPreferences {
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  learnedPatterns: string[];
}

export const usePhonoEngine = (text: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLReady] = useState(true);
  const [accelerationType] = useState('CPU');
  const [performanceMetrics] = useState<PerformanceMetrics>({
    inferenceTimeMs: 45.2,
    memoryUsageMB: 128
  });
  const [userPreferences] = useState<UserPreferences>({
    acceptedSuggestions: 0,
    rejectedSuggestions: 0,
    learnedPatterns: []
  });

  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Mock analysis delay
    const timer = setTimeout(() => {
      const mockSuggestions: Suggestion[] = [];
      
      // Check for common phonetic misspellings
      const patterns = [
        { from: 'fone', to: 'phone', pattern: 'ph->f' },
        { from: 'seperate', to: 'separate', pattern: 'ar->er' },
        { from: 'recieve', to: 'receive', pattern: 'ie->ei' },
        { from: 'would of', to: 'would have', pattern: 'of->have' },
        { from: 'definately', to: 'definitely', pattern: 'ate->ite' },
        { from: 'fisiscs', to: 'physics', pattern: 'phonetic' },
        { from: 'fisik', to: 'physics', pattern: 'phonetic' },
      ];

      patterns.forEach(({ from, to, pattern }) => {
        const regex = new RegExp(`\\b${from}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          mockSuggestions.push({
            original: match[0],
            suggestion: to,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            pattern,
            confidence: 0.85 + Math.random() * 0.1,
            explanation: `Common phonetic misspelling: "${from}" → "${to}"`
          });
        }
      });

      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [text]);

  const recordFeedback = (pattern: string, accepted: boolean) => {
    console.log(`Feedback recorded: ${pattern} - ${accepted ? 'accepted' : 'rejected'}`);
  };

  const applySuggestion = (suggestion: Suggestion, currentText: string) => {
    const before = currentText.slice(0, suggestion.startIndex);
    const after = currentText.slice(suggestion.endIndex);
    return before + suggestion.suggestion + after;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return {
    suggestions,
    isAnalyzing,
    isMLReady,
    accelerationType,
    performanceMetrics,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  };
};