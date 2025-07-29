// Mock hook for Phono Engine
import { useState, useEffect } from 'react';
import { useCustomRules } from './use-custom-rules';

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

  // Get custom rules hook
  const { applyCustomRules } = useCustomRules();

  useEffect(() => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Mock analysis delay
    const timer = setTimeout(() => {
      const mockSuggestions: Suggestion[] = [];
      
      // STEP 1: Apply custom rules first (highest priority)
      const { text: customCorrectedText, appliedRules } = applyCustomRules(text);
      
      // Generate suggestions for custom rule corrections
      if (appliedRules.length > 0) {
        // For demo purposes, we'll create suggestions based on the differences
        // In real implementation, this would be handled by the correction engine
        const words = text.split(/\s+/);
        const correctedWords = customCorrectedText.split(/\s+/);
        
        let currentIndex = 0;
        words.forEach((word, i) => {
          if (correctedWords[i] && word !== correctedWords[i]) {
            mockSuggestions.push({
              original: word,
              suggestion: correctedWords[i],
              startIndex: currentIndex,
              endIndex: currentIndex + word.length,
              pattern: 'custom-rule',
              confidence: 0.95, // Custom rules have high confidence
              explanation: `Custom rule applied: "${word}" → "${correctedWords[i]}"`
            });
          }
          currentIndex += word.length + 1; // +1 for space
        });
      }
      
      // STEP 2: Apply built-in phonetic patterns (lower priority)
      const builtinPatterns = [
        { from: 'fone', to: 'phone', pattern: 'ph->f' },
        { from: 'seperate', to: 'separate', pattern: 'ar->er' },
        { from: 'recieve', to: 'receive', pattern: 'ie->ei' },
        { from: 'would of', to: 'would have', pattern: 'of->have' },
        { from: 'definately', to: 'definitely', pattern: 'ate->ite' },
        { from: 'fisiscs', to: 'physics', pattern: 'phonetic' },
        { from: 'fisik', to: 'physics', pattern: 'phonetic' },
      ];

      // Only check for built-in patterns if custom rules didn't already correct them
      const textToCheck = customCorrectedText || text;
      builtinPatterns.forEach(({ from, to, pattern }) => {
        const regex = new RegExp(`\\b${from}\\b`, 'gi');
        let match: RegExpExecArray | null;
        while ((match = regex.exec(textToCheck)) !== null) {
          // Check if this word was already corrected by custom rules
          const alreadyCorrected = mockSuggestions.some(s => 
            s.startIndex <= match!.index && s.endIndex >= match!.index + match![0].length
          );
          
          if (!alreadyCorrected) {
            mockSuggestions.push({
              original: match![0],
              suggestion: to,
              startIndex: match!.index,
              endIndex: match!.index + match![0].length,
              pattern,
              confidence: 0.85 + Math.random() * 0.1,
              explanation: `Built-in phonetic correction: "${from}" → "${to}"`
            });
          }
        }
      });

      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [text, applyCustomRules]);

  const recordFeedback = (pattern: string, accepted: boolean) => {
    console.log(`Feedback recorded: ${pattern} - ${accepted ? 'accepted' : 'rejected'}`);
    
    // If it's a custom rule, record the usage
    if (pattern === 'custom-rule') {
      // In a real implementation, we'd need to track which specific rule was applied
      // For now, we'll just log it
      console.log('Custom rule feedback recorded');
    }
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