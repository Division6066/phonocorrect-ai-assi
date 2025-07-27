import { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { PhoneticEngine, Suggestion, UserPreference } from '@/lib/phoneticEngine';

export function usePhonoEngine(text: string) {
  const [userPreferences, setUserPreferences] = useKV<UserPreference[]>('phono-preferences', []);
  const [engine, setEngine] = useState<PhoneticEngine | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize engine when preferences load
  useEffect(() => {
    const phoneticEngine = new PhoneticEngine(userPreferences);
    setEngine(phoneticEngine);
  }, [userPreferences]);

  // Analyze text when it changes
  useEffect(() => {
    if (!engine || !text.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Debounce analysis to avoid overwhelming the user
    const timeoutId = setTimeout(() => {
      const newSuggestions = engine.analyzText(text);
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    };
  }, [text, engine]);

  const recordFeedback = useCallback((patternDescription: string, accepted: boolean) => {
    if (!engine) return;
    
    engine.recordFeedback(patternDescription, accepted);
    const updatedPreferences = engine.getUserPreferences();
    setUserPreferences(updatedPreferences);
  }, [engine, setUserPreferences]);

  const applySuggestion = useCallback((suggestion: Suggestion, currentText: string): string => {
    const before = currentText.substring(0, suggestion.startIndex);
    const after = currentText.substring(suggestion.endIndex);
    return before + suggestion.suggestion + after;
  }, []);

  const getConfidenceColor = useCallback((confidence: number): string => {
    if (!engine) return "text-gray-600";
    return engine.getConfidenceColor(confidence);
  }, [engine]);

  const getConfidenceLabel = useCallback((confidence: number): string => {
    if (!engine) return "Unknown confidence";
    return engine.getConfidenceLabel(confidence);
  }, [engine]);

  return {
    suggestions,
    isAnalyzing,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  };
}