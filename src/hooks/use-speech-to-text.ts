import { useState, useCallback, useRef, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Enhanced language support with Whisper.cpp model mapping
export const WHISPER_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', whisperModel: 'base.en' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', whisperModel: 'base' },
  { code: 'fr', label: 'French', flag: '🇫🇷', whisperModel: 'base' },
  { code: 'de', label: 'German', flag: '🇩🇪', whisperModel: 'base' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', whisperModel: 'base' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹', whisperModel: 'base' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺', whisperModel: 'base' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', whisperModel: 'base' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷', whisperModel: 'base' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳', whisperModel: 'base' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦', whisperModel: 'base' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', whisperModel: 'base' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱', whisperModel: 'base' },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪', whisperModel: 'base' },
  { code: 'da', label: 'Danish', flag: '🇩🇰', whisperModel: 'base' },
  { code: 'no', label: 'Norwegian', flag: '🇳🇴', whisperModel: 'base' },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮', whisperModel: 'base' },
  { code: 'pl', label: 'Polish', flag: '🇵🇱', whisperModel: 'base' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷', whisperModel: 'base' },
  { code: 'he', label: 'Hebrew', flag: '🇮🇱', whisperModel: 'base' },
  { code: 'th', label: 'Thai', flag: '🇹🇭', whisperModel: 'base' },
  { code: 'vi', label: 'Vietnamese', flag: '🇻🇳', whisperModel: 'base' },
  { code: 'uk', label: 'Ukrainian', flag: '🇺🇦', whisperModel: 'base' },
  { code: 'cs', label: 'Czech', flag: '🇨🇿', whisperModel: 'base' },
  { code: 'hu', label: 'Hungarian', flag: '🇭🇺', whisperModel: 'base' },
  { code: 'bg', label: 'Bulgarian', flag: '🇧🇬', whisperModel: 'base' },
  { code: 'hr', label: 'Croatian', flag: '🇭🇷', whisperModel: 'base' },
  { code: 'sk', label: 'Slovak', flag: '🇸🇰', whisperModel: 'base' },
  { code: 'sl', label: 'Slovenian', flag: '🇸🇮', whisperModel: 'base' },
  { code: 'et', label: 'Estonian', flag: '🇪🇪', whisperModel: 'base' },
  { code: 'lv', label: 'Latvian', flag: '🇱🇻', whisperModel: 'base' },
  { code: 'lt', label: 'Lithuanian', flag: '🇱🇹', whisperModel: 'base' },
];

interface SpeechToTextState {
  isListening: boolean;
  isProcessing: boolean;
  interimResult: string;
  finalResult: string;
  confidence: number;
  error: string | null;
  audioLevel: number;
  modelStatus: 'loading' | 'ready' | 'error' | 'not-loaded';
}

interface WhisperConfig {
  modelPath: string;
  language: string;
  enableVAD: boolean; // Voice Activity Detection
  silenceThreshold: number;
  maxRecordingTime: number;
}

interface SpeechToTextOptions {
  language?: string;
  useWhisper?: boolean;
  fallbackToBrowser?: boolean;
  enableRealtime?: boolean;
  enableVAD?: boolean;
}

// Mock Whisper.cpp integration - will be replaced with actual implementation
class WhisperEngine {
  private isInitialized = false;
  private models = new Map<string, any>();
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  async initialize(config: WhisperConfig): Promise<boolean> {
    try {
      // TODO: Replace with actual whisper.cpp WASM initialization
      console.log('Initializing Whisper.cpp with config:', config);
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Whisper:', error);
      return false;
    }
  }

  async transcribe(audioBuffer: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    if (!this.isInitialized) {
      throw new Error('Whisper engine not initialized');
    }

    // TODO: Replace with actual whisper.cpp transcription
    console.log('Transcribing audio with Whisper:', { language, audioLength: audioBuffer.length });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock transcription for demo
    const mockTexts = [
      "Hello, this is a test transcription.",
      "The quick brown fox jumps over the lazy dog.",
      "Speech recognition is working well.",
      "This is a phonetic spelling test.",
    ];
    
    return {
      text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      confidence: 0.85 + Math.random() * 0.15
    };
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}

export function useSpeechToText(options: SpeechToTextOptions = {}) {
  const {
    language = 'en',
    useWhisper = true,
    fallbackToBrowser = true,
    enableRealtime = true,
    enableVAD = true
  } = options;

  // Persistent settings
  const [selectedLanguage, setSelectedLanguage] = useKV('stt-language', language);
  const [whisperEnabled, setWhisperEnabled] = useKV('stt-whisper-enabled', useWhisper);
  const [realtimeEnabled, setRealtimeEnabled] = useKV('stt-realtime-enabled', enableRealtime);

  // State
  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    isProcessing: false,
    interimResult: '',
    finalResult: '',
    confidence: 0,
    error: null,
    audioLevel: 0,
    modelStatus: 'not-loaded'
  });

  // Refs
  const whisperEngine = useRef<WhisperEngine>(new WhisperEngine());
  const recognition = useRef<SpeechRecognition | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const recordingData = useRef<Float32Array[]>([]);
  const animationFrame = useRef<number>();

  // Initialize speech recognition engines
  useEffect(() => {
    const initializeEngines = async () => {
      try {
        // Initialize Whisper if enabled
        if (whisperEnabled) {
          setState(prev => ({ ...prev, modelStatus: 'loading' }));
          
          const whisperConfig: WhisperConfig = {
            modelPath: `/models/whisper-${WHISPER_LANGUAGES.find(l => l.code === selectedLanguage)?.whisperModel || 'base'}.bin`,
            language: selectedLanguage,
            enableVAD: enableVAD,
            silenceThreshold: 0.01,
            maxRecordingTime: 30000
          };
          
          const initialized = await whisperEngine.current.initialize(whisperConfig);
          setState(prev => ({ 
            ...prev, 
            modelStatus: initialized ? 'ready' : 'error' 
          }));
          
          if (initialized) {
            toast.success(`Whisper model loaded for ${WHISPER_LANGUAGES.find(l => l.code === selectedLanguage)?.label}`);
          }
        }

        // Initialize browser speech recognition as fallback
        if (fallbackToBrowser && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognition.current = new SpeechRecognition();
          setupBrowserRecognition();
        }
      } catch (error) {
        console.error('Failed to initialize speech engines:', error);
        setState(prev => ({ ...prev, error: 'Failed to initialize speech recognition', modelStatus: 'error' }));
      }
    };

    initializeEngines();

    return () => {
      whisperEngine.current.cleanup();
      if (recognition.current) {
        recognition.current.abort();
      }
      stopAudioCapture();
    };
  }, [selectedLanguage, whisperEnabled, enableVAD, fallbackToBrowser]);

  const setupBrowserRecognition = useCallback(() => {
    if (!recognition.current) return;

    const rec = recognition.current;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = selectedLanguage === 'en' ? 'en-US' : `${selectedLanguage}-${selectedLanguage.toUpperCase()}`;

    rec.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          confidence = result[0].confidence || 0;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        interimResult: interimTranscript,
        finalResult: prev.finalResult + finalTranscript,
        confidence
      }));
    };

    rec.onerror = (event) => {
      const errorMessage = getRecognitionErrorMessage(event.error);
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      toast.error(errorMessage);
    };

    rec.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };
  }, [selectedLanguage]);

  const startAudioCapture = useCallback(async () => {
    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      audioContext.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      
      // Create analyser for audio level visualization
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);

      // Start audio level monitoring
      updateAudioLevel();

      return true;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      setState(prev => ({ ...prev, error: 'Microphone access denied' }));
      return false;
    }
  }, []);

  const stopAudioCapture = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    setState(prev => ({ ...prev, audioLevel: 0 }));
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyser.current) return;

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const level = average / 255;
    
    setState(prev => ({ ...prev, audioLevel: level }));
    animationFrame.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startListening = useCallback(async () => {
    if (state.isListening) return;

    setState(prev => ({ 
      ...prev, 
      isListening: true, 
      interimResult: '', 
      finalResult: '', 
      error: null,
      isProcessing: false
    }));

    // Start audio capture for Whisper
    if (whisperEnabled && state.modelStatus === 'ready') {
      const audioStarted = await startAudioCapture();
      if (!audioStarted) {
        setState(prev => ({ ...prev, isListening: false }));
        return;
      }
      recordingData.current = [];
    }

    // Start browser recognition as fallback or if Whisper is disabled
    if ((!whisperEnabled || state.modelStatus !== 'ready') && recognition.current) {
      try {
        recognition.current.start();
      } catch (error) {
        console.error('Failed to start browser speech recognition:', error);
        setState(prev => ({ ...prev, error: 'Failed to start speech recognition', isListening: false }));
      }
    }
  }, [state.isListening, state.modelStatus, whisperEnabled, startAudioCapture]);

  const stopListening = useCallback(async () => {
    if (!state.isListening) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    // Process Whisper recording
    if (whisperEnabled && state.modelStatus === 'ready' && recordingData.current.length > 0) {
      try {
        const audioBuffer = new Float32Array(recordingData.current.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of recordingData.current) {
          audioBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        const result = await whisperEngine.current.transcribe(audioBuffer, selectedLanguage);
        setState(prev => ({ 
          ...prev, 
          finalResult: prev.finalResult + result.text,
          confidence: result.confidence 
        }));
      } catch (error) {
        console.error('Whisper transcription failed:', error);
        setState(prev => ({ ...prev, error: 'Transcription failed' }));
      }
    }

    // Stop browser recognition
    if (recognition.current) {
      recognition.current.stop();
    }

    stopAudioCapture();
    setState(prev => ({ ...prev, isListening: false, isProcessing: false }));
  }, [state.isListening, state.modelStatus, whisperEnabled, selectedLanguage, stopAudioCapture]);

  const resetTranscription = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      interimResult: '', 
      finalResult: '', 
      confidence: 0, 
      error: null 
    }));
  }, []);

  const getRecognitionErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Try speaking closer to the microphone.';
      case 'audio-capture':
        return 'Microphone not available. Please check permissions.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone permissions.';
      case 'network':
        return 'Network error occurred during speech recognition.';
      case 'language-not-supported':
        return `Language "${selectedLanguage}" is not supported.`;
      default:
        return 'Speech recognition error occurred.';
    }
  };

  const getCurrentLanguage = () => {
    return WHISPER_LANGUAGES.find(lang => lang.code === selectedLanguage) || WHISPER_LANGUAGES[0];
  };

  const isSupported = () => {
    return (whisperEnabled && state.modelStatus === 'ready') || 
           (fallbackToBrowser && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window));
  };

  return {
    // State
    ...state,
    selectedLanguage,
    whisperEnabled,
    realtimeEnabled,
    isSupported: isSupported(),
    supportedLanguages: WHISPER_LANGUAGES,
    currentLanguage: getCurrentLanguage(),

    // Actions
    startListening,
    stopListening,
    resetTranscription,
    setSelectedLanguage,
    setWhisperEnabled,
    setRealtimeEnabled,

    // Utils
    getRecognitionErrorMessage,
  };
}