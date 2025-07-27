import { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { PhoneticEngine, Suggestion, UserPreference } from '@/lib/phoneticEngine';

// Hardware-accelerated ML Core integration
let HardwareAcceleration: any = null;
let GemmaBridge: any = null;

// Initialize hardware-accelerated ML bridge
const initializeMLBridge = async () => {
  if (GemmaBridge && HardwareAcceleration) return { GemmaBridge, HardwareAcceleration };
  
  try {
    // Detect environment and load appropriate acceleration
    if (typeof window !== 'undefined') {
      // Web environment - WebGL/WebGPU acceleration
      const { HardwareAcceleration: WebAccel } = await import('../../packages/ml-core/src/web/HardwareAcceleration');
      const { GemmaBridge: WebBridge } = await import('../../packages/ml-core/src/web/GemmaBridge');
      
      HardwareAcceleration = WebAccel;
      await WebBridge.loadWasm();
      GemmaBridge = WebBridge;
      
    } else if (typeof process !== 'undefined' && process.versions?.electron) {
      // Electron environment - Native GPU acceleration
      const { HardwareAcceleration: ElectronAccel } = await import('../../packages/ml-core/src/electron/HardwareAcceleration');
      const { GemmaBridge: ElectronBridge } = await import('../../packages/ml-core/src/electron/GemmaBridge');
      
      HardwareAcceleration = ElectronAccel;
      GemmaBridge = ElectronBridge;
      
    } else {
      // Fallback to mock for testing
      console.warn('[PhonoEngine] Hardware acceleration not available, using fallback');
      HardwareAcceleration = null;
      GemmaBridge = null;
    }
    
    // Initialize hardware acceleration if available
    if (HardwareAcceleration?.isAvailable()) {
      const bestType = HardwareAcceleration.getBestAccelerationType();
      console.log('[PhonoEngine] Initializing hardware acceleration:', bestType);
      await HardwareAcceleration.initializeAcceleration(bestType);
    }
    
  } catch (error) {
    console.warn('[PhonoEngine] Failed to initialize hardware acceleration:', error);
    HardwareAcceleration = null;
    GemmaBridge = null;
  }
  
  return { GemmaBridge, HardwareAcceleration };
};

export function usePhonoEngine(text: string) {
  const [userPreferences, setUserPreferences] = useKV<UserPreference[]>('phono-preferences', []);
  const [engine, setEngine] = useState<PhoneticEngine | null>(null);
  const [gemmaInstance, setGemmaInstance] = useState<any>(null);
  const [hardwareAccel, setHardwareAccel] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLReady, setIsMLReady] = useState(false);
  const [accelerationType, setAccelerationType] = useState<string>('CPU_BASIC');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Initialize engine and hardware-accelerated ML bridge
  useEffect(() => {
    const initializeEngine = async () => {
      const phoneticEngine = new PhoneticEngine(userPreferences);
      setEngine(phoneticEngine);

      // Try to initialize hardware-accelerated ML bridge
      try {
        const { GemmaBridge, HardwareAcceleration } = await initializeMLBridge();
        
        if (HardwareAcceleration?.isAvailable()) {
          setHardwareAccel(HardwareAcceleration);
          const accelType = HardwareAcceleration.getBestAccelerationType();
          setAccelerationType(accelType);
          
          console.log('[PhonoEngine] Hardware acceleration ready:', accelType);
          setIsMLReady(true);
        } else if (GemmaBridge) {
          // Fallback to software-only bridge
          const instance = await GemmaBridge.loadGemma();
          setGemmaInstance(instance);
          setIsMLReady(true);
          console.log('[PhonoEngine] Software ML bridge initialized');
        }
      } catch (error) {
        console.warn('[PhonoEngine] ML initialization failed, using rule-based engine:', error);
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

        if (isMLReady && hardwareAccel?.isInitialized()) {
          // Use hardware-accelerated ML correction
          try {
            const startTime = Date.now();
            const correctedText = await hardwareAccel.correctPhonetic(text);
            const endTime = Date.now();
            
            // Get performance metrics
            const metrics = hardwareAccel.getPerformanceMetrics();
            setPerformanceMetrics({
              ...metrics,
              totalProcessingTime: endTime - startTime
            });
            
            // Convert corrected text to suggestions by comparing with original
            newSuggestions = engine.findDifferences(text, correctedText);
            
            console.log(`[PhonoEngine] Hardware-accelerated correction (${metrics.accelerationType}): ${metrics.inferenceTimeMs}ms`);
            
          } catch (accelError) {
            console.warn('[PhonoEngine] Hardware acceleration failed, trying software ML:', accelError);
            
            // Fallback to software ML if available
            if (gemmaInstance) {
              try {
                const corrections = await gemmaInstance.phonoCorrectWithDetails(text);
                newSuggestions = corrections.map((correction: any) => ({
                  original: correction.original,
                  suggestion: correction.corrected,
                  pattern: `ml-correction-${correction.original}`,
                  confidence: correction.confidence,
                  startIndex: correction.position,
                  endIndex: correction.position + correction.original.length,
                  explanation: `ML suggested correction: "${correction.original}" → "${correction.corrected}"`
                }));
              } catch (mlError) {
                console.warn('[PhonoEngine] Software ML also failed, using rule-based engine:', mlError);
                newSuggestions = engine.analyzText(text);
              }
            } else {
              newSuggestions = engine.analyzText(text);
            }
          }
        } else if (isMLReady && gemmaInstance) {
          // Use software-only ML
          try {
            const corrections = await gemmaInstance.phonoCorrectWithDetails(text);
            newSuggestions = corrections.map((correction: any) => ({
              original: correction.original,
              suggestion: correction.corrected,
              pattern: `ml-correction-${correction.original}`,
              confidence: correction.confidence,
              startIndex: correction.position,
              endIndex: correction.position + correction.original.length,
              explanation: `ML suggested correction: "${correction.original}" → "${correction.corrected}"`
            }));
          } catch (mlError) {
            console.warn('[PhonoEngine] ML correction failed, using rule-based engine:', mlError);
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

  // Cleanup function with hardware acceleration cleanup
  useEffect(() => {
    return () => {
      if (gemmaInstance) {
        gemmaInstance.dispose();
      }
      if (hardwareAccel?.isInitialized()) {
        hardwareAccel.cleanup();
      }
    };
  }, [gemmaInstance, hardwareAccel]);

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
    accelerationType,
    performanceMetrics,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  };
}