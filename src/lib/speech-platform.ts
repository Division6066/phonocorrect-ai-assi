// Platform-specific speech functionality utilities
declare global {
  interface Window {
    PhonoCorrectBridge?: {
      checkMicrophonePermissions(): Promise<{ status: string }>;
      checkSpeechRecognitionPermissions(): Promise<{ status: string }>;
      initializeWhisper(modelPath: string): Promise<{ status: string; model: string }>;
      initializeCoquiTTS(modelPath: string): Promise<{ status: string; model: string }>;
    };
    electronAPI?: {
      checkMicrophonePermissions(): Promise<{ status: string }>;
      initializeWhisper(modelPath: string): Promise<{ status: string; model: string }>;
      initializeCoquiTTS(modelPath: string): Promise<{ status: string; model: string }>;
    };
  }
}

export type PlatformType = 'web' | 'ios' | 'android' | 'electron' | 'unknown';

export interface PlatformCapabilities {
  hasNativeWhisper: boolean;
  hasNativeCoqui: boolean;
  hasMicrophoneAccess: boolean;
  hasHardwareAcceleration: boolean;
  supportsBackgroundAudio: boolean;
  maxModelSize: number; // in MB
  preferredAudioFormat: string;
  supportedLanguages: string[];
}

class PlatformDetector {
  private static instance: PlatformDetector;
  private platformType: PlatformType = 'unknown';
  private capabilities: PlatformCapabilities | null = null;

  static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector();
    }
    return PlatformDetector.instance;
  }

  private constructor() {
    this.detectPlatform();
  }

  private detectPlatform(): void {
    if (typeof window === 'undefined') {
      this.platformType = 'unknown';
      return;
    }

    // Check for Electron
    if (window.electronAPI) {
      this.platformType = 'electron';
      return;
    }

    // Check for React Native
    if (window.PhonoCorrectBridge) {
      // Determine iOS vs Android based on user agent or other indicators
      const userAgent = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        this.platformType = 'ios';
      } else if (/Android/.test(userAgent)) {
        this.platformType = 'android';
      }
      return;
    }

    // Default to web
    this.platformType = 'web';
  }

  getPlatformType(): PlatformType {
    return this.platformType;
  }

  async getCapabilities(): Promise<PlatformCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    this.capabilities = await this.detectCapabilities();
    return this.capabilities;
  }

  private async detectCapabilities(): Promise<PlatformCapabilities> {
    const baseCapabilities: PlatformCapabilities = {
      hasNativeWhisper: false,
      hasNativeCoqui: false,
      hasMicrophoneAccess: false,
      hasHardwareAcceleration: false,
      supportsBackgroundAudio: false,
      maxModelSize: 100, // Default 100MB
      preferredAudioFormat: 'wav',
      supportedLanguages: ['en']
    };

    switch (this.platformType) {
      case 'ios':
        return {
          ...baseCapabilities,
          hasNativeWhisper: true, // When implemented
          hasNativeCoqui: true,   // When implemented
          hasMicrophoneAccess: await this.checkMicrophonePermission(),
          hasHardwareAcceleration: true, // Metal support
          supportsBackgroundAudio: true,
          maxModelSize: 500, // iOS devices typically have more storage
          preferredAudioFormat: 'caf',
          supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
        };

      case 'android':
        return {
          ...baseCapabilities,
          hasNativeWhisper: true, // When implemented
          hasNativeCoqui: true,   // When implemented
          hasMicrophoneAccess: await this.checkMicrophonePermission(),
          hasHardwareAcceleration: this.detectAndroidGPU(),
          supportsBackgroundAudio: true,
          maxModelSize: 300, // Variable based on device
          preferredAudioFormat: 'wav',
          supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
        };

      case 'electron':
        return {
          ...baseCapabilities,
          hasNativeWhisper: true, // When implemented
          hasNativeCoqui: true,   // When implemented
          hasMicrophoneAccess: await this.checkMicrophonePermission(),
          hasHardwareAcceleration: this.detectDesktopGPU(),
          supportsBackgroundAudio: true,
          maxModelSize: 2000, // Desktop has more storage
          preferredAudioFormat: 'wav',
          supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
        };

      case 'web':
      default:
        return {
          ...baseCapabilities,
          hasNativeWhisper: await this.checkWebAssemblySupport(),
          hasNativeCoqui: await this.checkWebAssemblySupport(),
          hasMicrophoneAccess: await this.checkMicrophonePermission(),
          hasHardwareAcceleration: this.detectWebGPU(),
          supportsBackgroundAudio: 'serviceWorker' in navigator,
          maxModelSize: 200, // Limited by browser memory
          preferredAudioFormat: 'wav',
          supportedLanguages: this.getBrowserSupportedLanguages()
        };
    }
  }

  private async checkMicrophonePermission(): Promise<boolean> {
    try {
      if (this.platformType === 'ios' || this.platformType === 'android') {
        if (window.PhonoCorrectBridge) {
          const result = await window.PhonoCorrectBridge.checkMicrophonePermissions();
          return result.status === 'granted';
        }
      } else if (this.platformType === 'electron') {
        if (window.electronAPI) {
          const result = await window.electronAPI.checkMicrophonePermissions();
          return result.status === 'granted';
        }
      } else {
        // Web browser
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          return result.state === 'granted';
        }
        // Fallback: try to access microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch {
          return false;
        }
      }
    } catch (error) {
      console.warn('Failed to check microphone permission:', error);
    }
    return false;
  }

  private async checkWebAssemblySupport(): Promise<boolean> {
    try {
      if (typeof WebAssembly === 'undefined') {
        return false;
      }
      
      // Check for SIMD support (improves performance)
      if (WebAssembly.validate) {
        // Basic WASM support
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private detectAndroidGPU(): boolean {
    // Detect GPU capabilities on Android
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Check for Adreno, Mali, PowerVR, or other mobile GPUs
      return /adreno|mali|powervr|tegra/i.test(renderer);
    }
    
    return true; // Assume GPU is available on most modern Android devices
  }

  private detectDesktopGPU(): boolean {
    // Detect GPU capabilities on desktop
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Check for discrete GPUs
      return !/software|llvmpipe|mesa/i.test(renderer);
    }
    
    return true; // Assume GPU is available on desktop
  }

  private detectWebGPU(): boolean {
    // Check for WebGPU support (next-gen web graphics)
    return 'gpu' in navigator;
  }

  private getBrowserSupportedLanguages(): string[] {
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      const languages = Array.from(new Set(voices.map(voice => voice.lang.split('-')[0])));
      return languages.length > 0 ? languages : ['en'];
    }
    return ['en'];
  }
}

// Speech Engine Interface
export interface SpeechEngine {
  initialize(config: any): Promise<boolean>;
  transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }>;
  synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer>;
  cleanup(): void;
}

// Platform-specific engine factory
export class SpeechEngineFactory {
  static async createWhisperEngine(platform: PlatformType): Promise<SpeechEngine | null> {
    switch (platform) {
      case 'web':
        return new WebAssemblyWhisperEngine();
      case 'electron':
        return new NativeWhisperEngine();
      case 'ios':
      case 'android':
        return new MobileWhisperEngine();
      default:
        return null;
    }
  }

  static async createCoquiEngine(platform: PlatformType): Promise<SpeechEngine | null> {
    switch (platform) {
      case 'web':
        return new WebAssemblyCoquiEngine();
      case 'electron':
        return new NativeCoquiEngine();
      case 'ios':
      case 'android':
        return new MobileCoquiEngine();
      default:
        return null;
    }
  }
}

// Mock implementations (to be replaced with actual engines)
class WebAssemblyWhisperEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing WebAssembly Whisper engine');
    // TODO: Load whisper.cpp WASM module
    return true;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    console.log('Transcribing with WebAssembly Whisper:', { audioLength: audioData.length, language });
    // TODO: Actual transcription
    return { text: 'Mock transcription', confidence: 0.95 };
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    throw new Error('Whisper is for speech-to-text, not synthesis');
  }

  cleanup(): void {
    console.log('Cleaning up WebAssembly Whisper engine');
  }
}

class WebAssemblyCoquiEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing WebAssembly Coqui engine');
    // TODO: Load Coqui TTS WASM module
    return true;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    throw new Error('Coqui is for text-to-speech, not transcription');
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    console.log('Synthesizing with WebAssembly Coqui:', { text, voice, options });
    // TODO: Actual synthesis
    return new ArrayBuffer(0);
  }

  cleanup(): void {
    console.log('Cleaning up WebAssembly Coqui engine');
  }
}

class NativeWhisperEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing Native Whisper engine');
    if (window.electronAPI) {
      const result = await window.electronAPI.initializeWhisper(config.modelPath);
      return result.status === 'initialized';
    }
    return false;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    console.log('Transcribing with Native Whisper:', { audioLength: audioData.length, language });
    // TODO: Call native transcription
    return { text: 'Native transcription', confidence: 0.98 };
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    throw new Error('Whisper is for speech-to-text, not synthesis');
  }

  cleanup(): void {
    console.log('Cleaning up Native Whisper engine');
  }
}

class NativeCoquiEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing Native Coqui engine');
    if (window.electronAPI) {
      const result = await window.electronAPI.initializeCoquiTTS(config.modelPath);
      return result.status === 'initialized';
    }
    return false;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    throw new Error('Coqui is for text-to-speech, not transcription');
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    console.log('Synthesizing with Native Coqui:', { text, voice, options });
    // TODO: Call native synthesis
    return new ArrayBuffer(0);
  }

  cleanup(): void {
    console.log('Cleaning up Native Coqui engine');
  }
}

class MobileWhisperEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing Mobile Whisper engine');
    if (window.PhonoCorrectBridge) {
      const result = await window.PhonoCorrectBridge.initializeWhisper(config.modelPath);
      return result.status === 'initialized';
    }
    return false;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    console.log('Transcribing with Mobile Whisper:', { audioLength: audioData.length, language });
    // TODO: Call mobile transcription
    return { text: 'Mobile transcription', confidence: 0.96 };
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    throw new Error('Whisper is for speech-to-text, not synthesis');
  }

  cleanup(): void {
    console.log('Cleaning up Mobile Whisper engine');
  }
}

class MobileCoquiEngine implements SpeechEngine {
  async initialize(config: any): Promise<boolean> {
    console.log('Initializing Mobile Coqui engine');
    if (window.PhonoCorrectBridge) {
      const result = await window.PhonoCorrectBridge.initializeCoquiTTS(config.modelPath);
      return result.status === 'initialized';
    }
    return false;
  }

  async transcribe(audioData: Float32Array, language: string): Promise<{ text: string; confidence: number }> {
    throw new Error('Coqui is for text-to-speech, not transcription');
  }

  async synthesize(text: string, voice: string, options: any): Promise<ArrayBuffer> {
    console.log('Synthesizing with Mobile Coqui:', { text, voice, options });
    // TODO: Call mobile synthesis
    return new ArrayBuffer(0);
  }

  cleanup(): void {
    console.log('Cleaning up Mobile Coqui engine');
  }
}

// Export singleton instance
export const platformDetector = PlatformDetector.getInstance();