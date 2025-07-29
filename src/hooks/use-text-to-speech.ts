import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  CoquiEngine, 
  CoquiConfig, 
  getPlatformCapabilities 
} from '@/lib/speech-engines';

// Voice configurations for different TTS engines
export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  engine: 'coqui' | 'browser' | 'system';
  model?: string;
  quality: 'low' | 'medium' | 'high' | 'premium';
  emotional?: boolean;
  description?: string;
}

// Coqui TTS voice models
export const COQUI_VOICES: Voice[] = [
  {
    id: 'coqui-en-ljspeech',
    name: 'LJSpeech (English)',
    language: 'en',
    gender: 'female',
    engine: 'coqui',
    model: 'tts_models/en/ljspeech/tacotron2-DDC',
    quality: 'high',
    description: 'Clear, professional female voice'
  },
  {
    id: 'coqui-en-vctk',
    name: 'VCTK Multi-speaker (English)',
    language: 'en',
    gender: 'neutral',
    engine: 'coqui',
    model: 'tts_models/en/vctk/vits',
    quality: 'premium',
    description: 'Multiple speaker identities available'
  },
  {
    id: 'coqui-es-mai',
    name: 'MAI (Spanish)',
    language: 'es',
    gender: 'female',
    engine: 'coqui',
    model: 'tts_models/es/mai/tacotron2-DDC',
    quality: 'high',
    description: 'Natural Spanish voice'
  },
  {
    id: 'coqui-fr-mai',
    name: 'MAI (French)',
    language: 'fr',
    gender: 'female',
    engine: 'coqui',
    model: 'tts_models/fr/mai/tacotron2-DDC',
    quality: 'high',
    description: 'Clear French pronunciation'
  },
  {
    id: 'coqui-de-thorsten',
    name: 'Thorsten (German)',
    language: 'de',
    gender: 'male',
    engine: 'coqui',
    model: 'tts_models/de/thorsten/tacotron2-DDC',
    quality: 'high',
    description: 'Professional German male voice'
  },
  {
    id: 'coqui-it-mai',
    name: 'MAI (Italian)',
    language: 'it',
    gender: 'female',
    engine: 'coqui',
    model: 'tts_models/it/mai_female/glow-tts',
    quality: 'high',
    description: 'Expressive Italian female voice'
  },
  {
    id: 'coqui-pt-cv',
    name: 'Common Voice (Portuguese)',
    language: 'pt',
    gender: 'neutral',
    engine: 'coqui',
    model: 'tts_models/pt/cv/vits',
    quality: 'medium',
    description: 'Brazilian Portuguese voice'
  },
  {
    id: 'coqui-ru-mai',
    name: 'MAI (Russian)',
    language: 'ru',
    gender: 'female',
    engine: 'coqui',
    model: 'tts_models/ru/mai/glow-tts',
    quality: 'high',
    description: 'Clear Russian pronunciation'
  }
];

export interface EmotionalSettings {
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm';
  intensity: number; // 0-1
  speed: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
}

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  emotion?: EmotionalSettings;
  ssmlEnabled?: boolean;
  highlightWords?: boolean;
}

interface TextToSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  currentPosition: number;
  totalDuration: number;
  currentWord: string;
  modelStatus: 'loading' | 'ready' | 'error' | 'not-loaded';
  availableVoices: Voice[];
  engineType: 'coqui' | 'browser' | 'hybrid';
  processingTime: number;
}

export function useTextToSpeech(options: TTSOptions = {}) {
  // Mock language and voice functions
  const getCurrentLanguage = useCallback(() => 'en', []);
  const coquiVoices = { en: { default: 'browser-auto' } };
  
  // Persistent settings
  const [selectedVoice, setSelectedVoice] = useState(coquiVoices['en']?.default || 'browser-auto');
  const [defaultRate, setDefaultRate] = useState(1.0);
  const [defaultPitch, setDefaultPitch] = useState(1.0);
  const [defaultVolume, setDefaultVolume] = useState(1.0);
  const [ssmlEnabled, setSSMLEnabled] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [coquiEnabled, setCoquiEnabled] = useState(true);

  // Update selected voice when language changes
  useEffect(() => {
    const currentLanguage = getCurrentLanguage();
    const languageVoices = coquiVoices[currentLanguage];
    if (languageVoices && selectedVoice === 'browser-auto') {
      setSelectedVoice(languageVoices.default);
    }
  }, [getCurrentLanguage, selectedVoice]);

  // State
  const [state, setState] = useState<TextToSpeechState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: null,
    currentPosition: 0,
    totalDuration: 0,
    currentWord: '',
    modelStatus: 'not-loaded',
    availableVoices: [],
    engineType: 'browser',
    processingTime: 0
  });

  // Platform capabilities
  const capabilities = useRef(getPlatformCapabilities());
  
  // Refs
  const coquiEngine = useRef<CoquiEngine>(new CoquiEngine());
  const browserUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const wordTimings = useRef<Array<{ word: string; start: number; end: number }>>([]);
  const startTime = useRef<number>(0);
  const pausedTime = useRef<number>(0);
  const animationFrame = useRef<number>();

  // Initialize TTS engines
  useEffect(() => {
    const initializeEngines = async () => {
      try {
        let allVoices: Voice[] = [];

        // Check platform capabilities
        if (!capabilities.current.isAudioContextSupported) {
          setState(prev => ({ 
            ...prev, 
            error: 'Audio processing not supported on this platform',
            modelStatus: 'error' 
          }));
          return;
        }

        // Initialize Coqui TTS if enabled and supported
        if (coquiEnabled && capabilities.current.canUseCoqui) {
          setState(prev => ({ ...prev, modelStatus: 'loading', engineType: 'coqui' }));
          
          const coquiConfig: CoquiConfig = {
            modelPath: `/models/coqui/${capabilities.current.isElectron ? 'ljspeech.bin' : 'ljspeech.wasm'}`,
            language: 'en',
            enableGPU: capabilities.current.isElectron
          };
          
          const initialized = await coquiEngine.current.initialize(coquiConfig);
          if (initialized) {
            const coquiVoices = await coquiEngine.current.getAvailableVoices();
            allVoices = [...allVoices, ...coquiVoices];
            setState(prev => ({ ...prev, modelStatus: 'ready' }));
            toast.success('Coqui TTS models loaded');
          } else {
            setState(prev => ({ 
              ...prev, 
              modelStatus: 'error',
              engineType: capabilities.current.isSpeechSynthesisSupported ? 'browser' : 'coqui'
            }));
          }
        }

        // Get browser voices
        if (capabilities.current.isSpeechSynthesisSupported) {
          const browserVoices = window.speechSynthesis.getVoices().map((voice, index): Voice => ({
            id: `browser-${index}`,
            name: voice.name,
            language: voice.lang.split('-')[0],
            gender: 'neutral',
            engine: 'browser',
            quality: 'medium',
            description: `${voice.name} (${voice.lang})`
          }));
          allVoices = [...allVoices, ...browserVoices];
          
          if (!coquiEnabled || state.modelStatus !== 'ready') {
            setState(prev => ({ 
              ...prev,
              engineType: coquiEnabled ? 'hybrid' : 'browser',
              modelStatus: prev.modelStatus === 'error' ? 'ready' : prev.modelStatus
            }));
          }
        }

        setState(prev => ({ ...prev, availableVoices: allVoices }));
        
        if (allVoices.length === 0) {
          setState(prev => ({ 
            ...prev, 
            error: 'No text-to-speech engines available',
            modelStatus: 'error' 
          }));
        }
        
      } catch (error) {
        console.error('Failed to initialize TTS engines:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize text-to-speech', 
          modelStatus: 'error' 
        }));
      }
    };

    initializeEngines();

    // Listen for browser voice changes
    if (capabilities.current.isSpeechSynthesisSupported) {
      window.speechSynthesis.onvoiceschanged = initializeEngines;
    }

    return () => {
      coquiEngine.current.cleanup();
      stop();
    };
  }, [coquiEnabled]);

  const getCurrentVoice = useCallback((): Voice | null => {
    return state.availableVoices.find(voice => voice.id === selectedVoice) || null;
  }, [state.availableVoices, selectedVoice]);

  const preprocess = useCallback((text: string, voice: Voice): string => {
    if (!ssmlEnabled) {
      return text;
    }

    // Add SSML tags for better pronunciation
    let processedText = text;

    // Add pauses after punctuation
    processedText = processedText.replace(/[.!?]/g, '$&<break time="500ms"/>');
    processedText = processedText.replace(/[,;]/g, '$&<break time="200ms"/>');

    // Wrap in SSML speak tag if Coqui supports it
    if (voice.engine === 'coqui') {
      processedText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.language}">${processedText}</speak>`;
    }

    return processedText;
  }, [ssmlEnabled]);

  const updatePosition = useCallback(() => {
    if (!state.isPlaying || state.isPaused) return;

    const currentTime = (Date.now() - startTime.current) / 1000;
    const position = Math.min(currentTime, state.totalDuration);

    // Find current word based on timing
    if (highlightEnabled && wordTimings.current.length > 0) {
      const currentWordData = wordTimings.current.find(
        timing => position >= timing.start && position <= timing.end
      );
      if (currentWordData) {
        setState(prev => ({ ...prev, currentWord: currentWordData.word, currentPosition: position }));
      }
    } else {
      setState(prev => ({ ...prev, currentPosition: position }));
    }

    animationFrame.current = requestAnimationFrame(updatePosition);
  }, [state.isPlaying, state.isPaused, state.totalDuration, highlightEnabled]);

  const speak = useCallback(async (text: string, overrideOptions: TTSOptions = {}) => {
    if (!text.trim()) {
      toast.error('No text to speak');
      return;
    }

    const voice = getCurrentVoice();
    if (!voice) {
      toast.error('No voice selected');
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        currentPosition: 0,
        currentWord: ''
      }));

      const finalOptions = { ...options, ...overrideOptions };
      const processedText = preprocess(text, voice);
      const startTime = performance.now();

      if (voice.engine === 'coqui' && (state.modelStatus === 'ready' || state.engineType === 'coqui')) {
        // Use Coqui TTS
        const result = await coquiEngine.current.synthesize(processedText, {
          speaker: finalOptions.voice,
          emotion: finalOptions.emotion?.emotion,
          speed: finalOptions.rate,
          pitch: finalOptions.pitch
        });
        
        // Setup audio playback
        audioContext.current = new AudioContext();
        audioSource.current = audioContext.current.createBufferSource();
        
        // Convert our AudioBuffer to Web Audio API AudioBuffer
        const webAudioBuffer = audioContext.current.createBuffer(
          result.audioBuffer.channels,
          result.audioBuffer.data.length,
          result.audioBuffer.sampleRate
        );
        webAudioBuffer.getChannelData(0).set(result.audioBuffer.data);
        
        audioSource.current.buffer = webAudioBuffer;
        audioSource.current.connect(audioContext.current.destination);

        wordTimings.current = result.wordTimings;
        
        audioSource.current.onended = () => {
          setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            isPaused: false,
            currentPosition: 0,
            currentWord: ''
          }));
          if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
          }
        };

        const processingTime = performance.now() - startTime;
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isPlaying: true,
          totalDuration: result.audioBuffer.duration,
          processingTime
        }));

        startTime.current = Date.now();
        audioSource.current.start();
        updatePosition();
        
        toast.success(`Synthesized with Coqui TTS (${processingTime.toFixed(0)}ms)`);

      } else {
        // Use browser speech synthesis
        if (!capabilities.current.isSpeechSynthesisSupported) {
          throw new Error('Browser speech synthesis not supported');
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(processedText);
        browserUtterance.current = utterance;

        // Find matching browser voice
        const browserVoices = window.speechSynthesis.getVoices();
        const matchingVoice = browserVoices.find(v => `browser-${browserVoices.indexOf(v)}` === voice.id);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.rate = finalOptions.rate || defaultRate;
        utterance.pitch = finalOptions.pitch || defaultPitch;
        utterance.volume = finalOptions.volume || defaultVolume;

        utterance.onstart = () => {
          const processingTime = performance.now() - startTime;
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isPlaying: true,
            totalDuration: text.length * 0.08, // Estimate duration
            processingTime
          }));
          startTime.current = Date.now();
          updatePosition();
          toast.success(`Speaking with browser TTS (${processingTime.toFixed(0)}ms)`);
        };

        utterance.onend = () => {
          setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            isPaused: false,
            currentPosition: 0,
            currentWord: ''
          }));
          if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setState(prev => ({ 
            ...prev, 
            error: 'Speech synthesis failed', 
            isPlaying: false, 
            isLoading: false 
          }));
        };

        // Handle word boundary events for highlighting
        if (highlightEnabled) {
          utterance.onboundary = (event) => {
            if (event.name === 'word') {
              const wordStart = event.charIndex;
              const words = text.split(/\s+/);
              let charCount = 0;
              for (let i = 0; i < words.length; i++) {
                if (charCount >= wordStart) {
                  setState(prev => ({ ...prev, currentWord: words[i] }));
                  break;
                }
                charCount += words[i].length + 1;
              }
            }
          };
        }

        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('TTS error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Speech synthesis failed',
        isLoading: false,
        isPlaying: false
      }));
      toast.error('Failed to speak text');
    }
  }, [getCurrentVoice, options, state.modelStatus, preprocess, defaultRate, defaultPitch, defaultVolume, highlightEnabled, updatePosition]);

  const pause = useCallback(() => {
    if (!state.isPlaying || state.isPaused) return;

    if (audioSource.current) {
      // Coqui TTS - need to implement pause/resume for audio buffer
      // For now, we'll stop and remember position
      pausedTime.current = state.currentPosition;
      stop();
    } else if (browserUtterance.current) {
      window.speechSynthesis.pause();
    }

    setState(prev => ({ ...prev, isPaused: true }));
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  }, [state.isPlaying, state.isPaused, state.currentPosition]);

  const resume = useCallback(() => {
    if (!state.isPaused) return;

    if (browserUtterance.current) {
      window.speechSynthesis.resume();
      startTime.current = Date.now() - (pausedTime.current * 1000);
      updatePosition();
    }

    setState(prev => ({ ...prev, isPaused: false }));
  }, [state.isPaused, updatePosition]);

  const stop = useCallback(() => {
    if (audioSource.current) {
      audioSource.current.stop();
      audioSource.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    if (browserUtterance.current) {
      window.speechSynthesis.cancel();
      browserUtterance.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false,
      currentPosition: 0,
      currentWord: ''
    }));
    
    startTime.current = 0;
    pausedTime.current = 0;
    wordTimings.current = [];
  }, []);

  const isSupported = () => {
    const coquiSupport = coquiEnabled && capabilities.current.canUseCoqui;
    const browserSupport = capabilities.current.isSpeechSynthesisSupported;
    return coquiSupport || browserSupport;
  };

  const getEngineInfo = () => {
    const info = {
      current: state.engineType,
      coquiAvailable: capabilities.current.canUseCoqui,
      browserAvailable: capabilities.current.isSpeechSynthesisSupported,
      platform: capabilities.current.isElectron ? 'electron' : 
                capabilities.current.isReactNative ? 'react-native' : 'web'
    };
    return info;
  };

  return {
    // State
    ...state,
    selectedVoice,
    defaultRate,
    defaultPitch,
    defaultVolume,
    ssmlEnabled,
    highlightEnabled,
    coquiEnabled,
    isSupported: isSupported(),
    currentVoice: getCurrentVoice(),
    engineInfo: getEngineInfo(),
    capabilities: capabilities.current,

    // Actions
    speak,
    pause,
    resume,
    stop,
    setSelectedVoice,
    setDefaultRate,
    setDefaultPitch,
    setDefaultVolume,
    setSSMLEnabled,
    setHighlightEnabled,
    setCoquiEnabled,

    // Utils
    getCurrentVoice,
    preprocess,
  };
}