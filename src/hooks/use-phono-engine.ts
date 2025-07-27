import { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { PhoneticEngine, Suggestion, UserPreference } from '@/lib/phoneticEngine';

// ML Core integration - dynamically import based on environment
let GemmaBridge: any = null;

// Initialize ML bridge based on environment
const initializeMLBridge = async () => {
  if (GemmaBridge) return GemmaBridge;
  
  try {
    // Detect environment and load appropriate bridge
    if (typeof window !== 'undefined') {
      // Web environment
      const { GemmaBridge: WebBridge } = await import('../../packages/ml-core/src/web/GemmaBridge');
      await WebBridge.loadWasm();
      GemmaBridge = WebBridge;
    } else if (typeof process !== 'undefined' && process.versions?.electron) {
      // Electron environment
      const { GemmaBridge: ElectronBridge } = await import('../../packages/ml-core/src/electron/GemmaBridge');
      GemmaBridge = ElectronBridge;
    } else {
      // Fallback to mock for testing
      console.warn('[PhonoEngine] ML Bridge not available, using fallback phonetic engine');
      GemmaBridge = null;
    }
  } catch (error) {
    console.warn('[PhonoEngine] Failed to load ML bridge, using fallback:', error);
    GemmaBridge = null;
  }
  
  return GemmaBridge;
};

export function usePhonoEngine(text: string) {
  const [userPreferences, setUserPreferences] = useKV<UserPreference[]>('phono-preferences', []);
  const [engine, setEngine] = useState<PhoneticEngine | null>(null);
  const [gemmaInstance, setGemmaInstance] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLReady, setIsMLReady] = useState(false);

  // Initialize engine and ML bridge when preferences load
  useEffect(() => {
    const initializeEngine = async () => {
      const phoneticEngine = new PhoneticEngine(userPreferences);
      setEngine(phoneticEngine);

      // Try to initialize ML bridge
      try {
        const bridge = await initializeMLBridge();
        if (bridge) {
          const instance = await bridge.loadGemma();
          setGemmaInstance(instance);
          setIsMLReady(true);
          console.log('[PhonoEngine] ML Core initialized successfully');
        }
      } catch (error) {
        console.warn('[PhonoEngine] ML initialization failed, using fallback engine:', error);
        setIsMLReady(false);
      }
    };

    initializeEngine();

    // Cleanup on unmount
    return () => {
      if (gemmaInstance) {
        gemmaInstance.dispose();
      }
    };
  }, [userPreferences]);

  // Analyze text when it changes
  useEffect(() => {
    if (!engine || !text.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Debounce analysis to avoid overwhelming the user
    const timeoutId = setTimeout(async () => {
      try {
        let newSuggestions: Suggestion[] = [];

        if (isMLReady && gemmaInstance) {
          // Use ML Core for enhanced corrections
          try {
            const corrections = await gemmaInstance.phonoCorrectWithDetails(text);
            
            // Convert ML corrections to our Suggestion format
            newSuggestions = corrections.map((correction: any) => ({
              original: correction.original,
              suggestion: correction.corrected,
              pattern: `ml-correction-${correction.original}`,
              confidence: correction.confidence,
              startIndex: correction.position,
              endIndex: correction.position + correction.original.length,
              explanation: `ML suggested correction: "${correction.original}" → "${correction.corrected}"`
            }));

            // Also get fallback suggestions and merge
            const fallbackSuggestions = engine.analyzText(text);
            
            // Remove duplicates (prefer ML suggestions)
            const mlWords = new Set(newSuggestions.map(s => s.original.toLowerCase()));
            const additionalSuggestions = fallbackSuggestions.filter(
              s => !mlWords.has(s.original.toLowerCase())
            );
            
            newSuggestions = [...newSuggestions, ...additionalSuggestions];
          } catch (mlError) {
            console.warn('[PhonoEngine] ML correction failed, using fallback:', mlError);
            newSuggestions = engine.analyzText(text);
          }
        } else {
          // Use traditional phonetic engine
          newSuggestions = engine.analyzText(text);
        }

        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('[PhonoEngine] Analysis failed:', error);
        setSuggestions([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    };
  }, [text, engine, isMLReady, gemmaInstance]);

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
    isMLReady,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  };
}