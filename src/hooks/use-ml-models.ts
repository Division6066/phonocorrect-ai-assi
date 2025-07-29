import { useState, useCallback, useRef, useEffect } from 'react';

export interface WhisperConfig {
  language: string;
  model: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  enableRealtimeTranscription: boolean;
}

export interface GemmaConfig {
  modelSize: '2b' | '7b';
  quantization: '4bit' | '8bit' | '16bit';
  maxTokens: number;
  temperature: number;
}

export interface MLModelState {
  whisper: {
    loaded: boolean;
    loading: boolean;
    error: string | null;
    config: WhisperConfig;
  };
  gemma: {
    loaded: boolean;
    loading: boolean;
    error: string | null;
    config: GemmaConfig;
  };
  mlCore: {
    available: boolean;
    version: string | null;
    initialized: boolean;
  };
}

// ML Core integration
let GemmaBridge: any = null;
let gemmaInstance: any = null;

const initializeMLCore = async () => {
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
      console.warn('[ML Models] ML Core not available in this environment');
      return null;
    }
    
    return GemmaBridge;
  } catch (error) {
    console.warn('[ML Models] Failed to initialize ML Core:', error);
    return null;
  }
};

// Mock ML model implementations (fallback for when ML Core is not available)
class WhisperModel {
  private config: WhisperConfig;
  private isLoaded = false;

  constructor(config: WhisperConfig) {
    this.config = config;
  }

  async load(): Promise<void> {
    // Simulate model loading
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isLoaded = true;
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    if (!this.isLoaded) throw new Error('Model not loaded');
    
    // Mock transcription - in reality this would process audio through Whisper
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different languages
    const mockTranscriptions = {
      'en': 'Hello, this is a test transcription from Whisper.',
      'es': 'Hola, esta es una transcripción de prueba de Whisper.',
      'fr': 'Bonjour, ceci est une transcription de test de Whisper.',
      'de': 'Hallo, dies ist eine Testtranskription von Whisper.',
      'it': 'Ciao, questa è una trascrizione di test da Whisper.',
    };
    
    return mockTranscriptions[this.config.language as keyof typeof mockTranscriptions] || 
           mockTranscriptions['en'];
  }

  async transcribeRealtime(stream: MediaStream): Promise<AsyncGenerator<string>> {
    if (!this.isLoaded) throw new Error('Model not loaded');
    
    async function* generator() {
      const words = ['Hello', 'world', 'this', 'is', 'realtime', 'transcription'];
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 800));
        yield word + ' ';
      }
    }
    
    return generator();
  }
}

class GemmaModel {
  private config: GemmaConfig;
  private isLoaded = false;

  constructor(config: GemmaConfig) {
    this.config = config;
  }

  async load(): Promise<void> {
    // Simulate model loading time based on size
    const loadTime = this.config.modelSize === '2b' ? 3000 : 8000;
    await new Promise(resolve => setTimeout(resolve, loadTime));
    this.isLoaded = true;
  }

  async correctPhonetic(text: string): Promise<string> {
    if (!this.isLoaded) throw new Error('Model not loaded');
    
    // Try ML Core first, fallback to mock
    if (gemmaInstance) {
      try {
        return await gemmaInstance.phonoCorrect(text);
      } catch (error) {
        console.warn('[ML Models] ML Core correction failed, using fallback:', error);
      }
    }
    
    // Mock phonetic correction fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const corrections: { [key: string]: string } = {
      'fone': 'phone',
      'seperate': 'separate',
      'recieve': 'receive',
      'would of': 'would have',
      'definately': 'definitely',
      'occured': 'occurred',
      'neccessary': 'necessary',
      'accomodate': 'accommodate',
      'begining': 'beginning',
      'existance': 'existence'
    };
    
    let correctedText = text;
    for (const [wrong, right] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, right);
    }
    
    return correctedText;
  }

  async enhanceText(text: string, context: string = ''): Promise<string> {
    if (!this.isLoaded) throw new Error('Model not loaded');
    
    // Mock text enhancement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple enhancement rules
    let enhanced = text;
    enhanced = enhanced.replace(/\bi\b/g, 'I'); // Capitalize 'i'
    enhanced = enhanced.replace(/([.!?])\s*([a-z])/g, (_, punct, letter) => 
      punct + ' ' + letter.toUpperCase()); // Capitalize after sentences
    
    return enhanced;
  }
}

export function useMLModels() {
  const [whisperConfig, setWhisperConfig] = useKV<WhisperConfig>('whisper-config', {
    language: 'en',
    model: 'base',
    enableRealtimeTranscription: true
  });
  
  const [gemmaConfig, setGemmaConfig] = useKV<GemmaConfig>('gemma-config', {
    modelSize: '2b',
    quantization: '4bit',
    maxTokens: 512,
    temperature: 0.3
  });

  const [modelState, setModelState] = useState<MLModelState>({
    whisper: {
      loaded: false,
      loading: false,
      error: null,
      config: whisperConfig
    },
    gemma: {
      loaded: false,
      loading: false,
      error: null,
      config: gemmaConfig
    },
    mlCore: {
      available: false,
      version: null,
      initialized: false
    }
  });

  const whisperModel = useRef<WhisperModel | null>(null);
  const gemmaModel = useRef<GemmaModel | null>(null);

  // Initialize ML Core on mount
  useEffect(() => {
    const initML = async () => {
      try {
        const bridge = await initializeMLCore();
        if (bridge) {
          const version = bridge.getVersion();
          setModelState(prev => ({
            ...prev,
            mlCore: {
              available: true,
              version,
              initialized: true
            }
          }));
          console.log(`[ML Models] ML Core initialized (${version})`);
        }
      } catch (error) {
        console.warn('[ML Models] ML Core initialization failed:', error);
        setModelState(prev => ({
          ...prev,
          mlCore: {
            available: false,
            version: null,
            initialized: false
          }
        }));
      }
    };

    initML();
  }, []);

  const loadWhisperModel = useCallback(async () => {
    setModelState(prev => ({
      ...prev,
      whisper: { ...prev.whisper, loading: true, error: null }
    }));

    try {
      whisperModel.current = new WhisperModel(whisperConfig);
      await whisperModel.current.load();
      
      setModelState(prev => ({
        ...prev,
        whisper: { ...prev.whisper, loaded: true, loading: false }
      }));
    } catch (error) {
      setModelState(prev => ({
        ...prev,
        whisper: { 
          ...prev.whisper, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load Whisper model'
        }
      }));
    }
  }, [whisperConfig]);

  const loadGemmaModel = useCallback(async () => {
    setModelState(prev => ({
      ...prev,
      gemma: { ...prev.gemma, loading: true, error: null }
    }));

    try {
      // Try to load ML Core Gemma first
      if (GemmaBridge && !gemmaInstance) {
        try {
          gemmaInstance = await GemmaBridge.loadGemma({
            modelPath: `/assets/models/gemma-2b-q4.onnx`,
            maxTokens: gemmaConfig.maxTokens,
            temperature: gemmaConfig.temperature
          });
          console.log('[ML Models] ML Core Gemma instance loaded successfully');
        } catch (mlError) {
          console.warn('[ML Models] ML Core Gemma failed, using fallback:', mlError);
          gemmaInstance = null;
        }
      }

      // Always load fallback model as well
      gemmaModel.current = new GemmaModel(gemmaConfig);
      await gemmaModel.current.load();
      
      setModelState(prev => ({
        ...prev,
        gemma: { ...prev.gemma, loaded: true, loading: false }
      }));
    } catch (error) {
      setModelState(prev => ({
        ...prev,
        gemma: { 
          ...prev.gemma, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load Gemma model'
        }
      }));
    }
  }, [gemmaConfig]);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    if (!whisperModel.current) throw new Error('Whisper model not loaded');
    return whisperModel.current.transcribe(audioBlob);
  }, []);

  const startRealtimeTranscription = useCallback(async (stream: MediaStream): Promise<AsyncGenerator<string>> => {
    if (!whisperModel.current) throw new Error('Whisper model not loaded');
    return whisperModel.current.transcribeRealtime(stream);
  }, []);

  const correctPhoneticText = useCallback(async (text: string): Promise<string> => {
    if (!gemmaModel.current) throw new Error('Gemma model not loaded');
    return gemmaModel.current.correctPhonetic(text);
  }, []);

  const enhanceText = useCallback(async (text: string, context?: string): Promise<string> => {
    if (!gemmaModel.current) throw new Error('Gemma model not loaded');
    return gemmaModel.current.enhanceText(text, context);
  }, []);

  const updateWhisperConfig = useCallback((config: Partial<WhisperConfig>) => {
    const newConfig = { ...whisperConfig, ...config };
    setWhisperConfig(newConfig);
    setModelState(prev => ({
      ...prev,
      whisper: { ...prev.whisper, config: newConfig, loaded: false }
    }));
  }, [whisperConfig, setWhisperConfig]);

  const updateGemmaConfig = useCallback((config: Partial<GemmaConfig>) => {
    const newConfig = { ...gemmaConfig, ...config };
    setGemmaConfig(newConfig);
    setModelState(prev => ({
      ...prev,
      gemma: { ...prev.gemma, config: newConfig, loaded: false }
    }));
  }, [gemmaConfig, setGemmaConfig]);

  const getMLCoreStatus = useCallback(() => {
    return {
      available: modelState.mlCore.available,
      version: modelState.mlCore.version,
      gemmaInstance: gemmaInstance ? 'loaded' : 'not loaded',
      bridge: GemmaBridge ? 'initialized' : 'not initialized'
    };
  }, [modelState.mlCore]);

  return {
    modelState,
    loadWhisperModel,
    loadGemmaModel,
    transcribeAudio,
    startRealtimeTranscription,
    correctPhoneticText,
    enhanceText,
    updateWhisperConfig,
    updateGemmaConfig,
    getMLCoreStatus,
    whisperConfig,
    gemmaConfig
  };
}