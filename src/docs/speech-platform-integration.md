# Speech Pipeline Platform Integration

## Overview
This document outlines the platform-specific configurations and permissions required for the enhanced speech pipeline with Whisper.cpp and Coqui TTS integration.

## iOS Configuration

### Entitlements (ios/App/App/App.entitlements)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Required for microphone access -->
    <key>com.apple.security.device.microphone</key>
    <true/>
    
    <!-- Required for background audio processing -->
    <key>com.apple.security.device.audio-input</key>
    <true/>
    
    <!-- Required for file access to ML models -->
    <key>com.apple.security.files.user-selected.read-only</key>
    <true/>
    
    <!-- Required for network access (model downloads) -->
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
```

### Info.plist Privacy Descriptions
```xml
<!-- Add to ios/App/App/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>PhonoCorrect AI needs microphone access to transcribe your speech and provide phonetic spelling corrections.</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>PhonoCorrect AI uses speech recognition to help you write with confidence through phonetic spelling assistance.</string>

<key>NSLocalNetworkUsageDescription</key>
<string>PhonoCorrect AI may download ML models for offline speech processing to improve your experience.</string>
```

### Native Module Integration (ios/App/App/PhonoCorrectBridge.swift)
```swift
import Foundation
import AVFoundation
import Speech

@objc(PhonoCorrectBridge)
class PhonoCorrectBridge: NSObject {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc func checkMicrophonePermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let audioSession = AVAudioSession.sharedInstance()
        
        switch audioSession.recordPermission {
        case .granted:
            resolve(["status": "granted"])
        case .denied:
            resolve(["status": "denied"])
        case .undetermined:
            audioSession.requestRecordPermission { granted in
                DispatchQueue.main.async {
                    resolve(["status": granted ? "granted" : "denied"])
                }
            }
        @unknown default:
            reject("UNKNOWN_PERMISSION_STATE", "Unknown microphone permission state", nil)
        }
    }
    
    @objc func checkSpeechRecognitionPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 14.0, *) else {
            reject("UNSUPPORTED_IOS_VERSION", "Speech recognition requires iOS 14.0 or later", nil)
            return
        }
        
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                switch status {
                case .authorized:
                    resolve(["status": "granted"])
                case .denied, .restricted:
                    resolve(["status": "denied"])
                case .notDetermined:
                    resolve(["status": "not_determined"])
                @unknown default:
                    reject("UNKNOWN_PERMISSION_STATE", "Unknown speech recognition permission state", nil)
                }
            }
        }
    }
    
    // TODO: Add Whisper.cpp integration
    @objc func initializeWhisper(_ modelPath: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Initialize whisper.cpp model
        // This will be implemented when whisper.cpp is compiled for iOS
        resolve(["status": "initialized", "model": modelPath])
    }
    
    // TODO: Add Coqui TTS integration
    @objc func initializeCoquiTTS(_ modelPath: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Initialize Coqui TTS model
        // This will be implemented when Coqui TTS is compiled for iOS
        resolve(["status": "initialized", "model": modelPath])
    }
}
```

## Android Configuration

### Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<!-- Add these permissions -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Required for background processing -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- Hardware requirements -->
<uses-feature 
    android:name="android.hardware.microphone" 
    android:required="true" />
```

### Native Module (android/app/src/main/java/com/phonocorrect/PhonoCorrectModule.kt)
```kotlin
package com.phonocorrect

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class PhonoCorrectModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val context = reactContext
    
    override fun getName(): String {
        return "PhonoCorrectBridge"
    }
    
    @ReactMethod
    fun checkMicrophonePermissions(promise: Promise) {
        val permission = ContextCompat.checkSelfPermission(
            context, 
            Manifest.permission.RECORD_AUDIO
        )
        
        val result = Arguments.createMap()
        result.putString("status", if (permission == PackageManager.PERMISSION_GRANTED) "granted" else "denied")
        promise.resolve(result)
    }
    
    @ReactMethod
    fun requestMicrophonePermissions(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No current activity available")
            return
        }
        
        ActivityCompat.requestPermissions(
            currentActivity,
            arrayOf(Manifest.permission.RECORD_AUDIO),
            1001
        )
        
        // Note: In a real implementation, you'd need to handle the permission result
        // through onRequestPermissionsResult callback
        promise.resolve(Arguments.createMap().apply {
            putString("status", "requested")
        })
    }
    
    // TODO: Add Whisper.cpp integration
    @ReactMethod
    fun initializeWhisper(modelPath: String, promise: Promise) {
        // Initialize whisper.cpp model
        // This will be implemented when whisper.cpp is compiled for Android
        val result = Arguments.createMap()
        result.putString("status", "initialized")
        result.putString("model", modelPath)
        promise.resolve(result)
    }
    
    // TODO: Add Coqui TTS integration
    @ReactMethod
    fun initializeCoquiTTS(modelPath: String, promise: Promise) {
        // Initialize Coqui TTS model
        // This will be implemented when Coqui TTS is compiled for Android
        val result = Arguments.createMap()
        result.putString("status", "initialized")
        result.putString("model", modelPath)
        promise.resolve(result)
    }
}
```

## Desktop (Electron) Configuration

### Main Process (desktop/public/electron.js)
```javascript
// Add to electron main process
const { app, BrowserWindow, ipcMain } = require('electron');

// Request microphone permissions on macOS
if (process.platform === 'darwin') {
  app.whenReady().then(() => {
    const { systemPreferences } = require('electron');
    
    // Check microphone access
    systemPreferences.askForMediaAccess('microphone').then((granted) => {
      console.log('Microphone access:', granted ? 'granted' : 'denied');
    });
  });
}

// Handle speech recognition requests
ipcMain.handle('check-microphone-permissions', async () => {
  if (process.platform === 'darwin') {
    const { systemPreferences } = require('electron');
    const status = systemPreferences.getMediaAccessStatus('microphone');
    return { status };
  } else if (process.platform === 'win32') {
    // Windows doesn't require explicit permission requests
    return { status: 'granted' };
  } else {
    // Linux - assume granted
    return { status: 'granted' };
  }
});

// Handle model initialization
ipcMain.handle('initialize-whisper', async (event, modelPath) => {
  // TODO: Initialize whisper.cpp for desktop
  console.log('Initializing Whisper model:', modelPath);
  return { status: 'initialized', model: modelPath };
});

ipcMain.handle('initialize-coqui-tts', async (event, modelPath) => {
  // TODO: Initialize Coqui TTS for desktop
  console.log('Initializing Coqui TTS model:', modelPath);
  return { status: 'initialized', model: modelPath };
});
```

## Web (Browser) Configuration

### Service Worker (public/speech-worker.js)
```javascript
// Service worker for offline speech processing
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'INITIALIZE_WHISPER':
      try {
        // TODO: Load WebAssembly Whisper.cpp module
        console.log('Initializing Whisper WASM:', data.modelPath);
        self.postMessage({ 
          type: 'WHISPER_INITIALIZED', 
          status: 'ready',
          model: data.modelPath 
        });
      } catch (error) {
        self.postMessage({ 
          type: 'WHISPER_ERROR', 
          error: error.message 
        });
      }
      break;
      
    case 'TRANSCRIBE_AUDIO':
      try {
        // TODO: Process audio with Whisper.cpp WASM
        console.log('Transcribing audio:', data.audioData.length, 'samples');
        
        // Mock transcription for now
        setTimeout(() => {
          self.postMessage({
            type: 'TRANSCRIPTION_RESULT',
            text: 'Mock transcription result',
            confidence: 0.95
          });
        }, 500);
      } catch (error) {
        self.postMessage({ 
          type: 'TRANSCRIPTION_ERROR', 
          error: error.message 
        });
      }
      break;
      
    case 'INITIALIZE_COQUI':
      try {
        // TODO: Load Coqui TTS WASM module
        console.log('Initializing Coqui TTS WASM:', data.modelPath);
        self.postMessage({ 
          type: 'COQUI_INITIALIZED', 
          status: 'ready',
          model: data.modelPath 
        });
      } catch (error) {
        self.postMessage({ 
          type: 'COQUI_ERROR', 
          error: error.message 
        });
      }
      break;
      
    case 'SYNTHESIZE_SPEECH':
      try {
        // TODO: Synthesize speech with Coqui TTS WASM
        console.log('Synthesizing speech:', data.text);
        
        // Mock synthesis for now
        setTimeout(() => {
          self.postMessage({
            type: 'SYNTHESIS_RESULT',
            audioBuffer: new ArrayBuffer(0), // Mock audio buffer
            wordTimings: []
          });
        }, 800);
      } catch (error) {
        self.postMessage({ 
          type: 'SYNTHESIS_ERROR', 
          error: error.message 
        });
      }
      break;
  }
});
```

## Model Deployment Scripts

### Model Download Script (scripts/download-models.ts)
```typescript
import fs from 'fs';
import path from 'path';
import https from 'https';

const MODEL_URLS = {
  // Whisper models
  'whisper-base.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
  'whisper-base.en.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
  'whisper-small.bin': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
  
  // Coqui TTS models (examples)
  'coqui-en-ljspeech.tflite': 'https://github.com/coqui-ai/TTS/releases/download/v0.6.1/tts_models--en--ljspeech--tacotron2-DDC.tar.gz',
  'coqui-en-vctk.tflite': 'https://github.com/coqui-ai/TTS/releases/download/v0.6.1/tts_models--en--vctk--vits.tar.gz',
};

async function downloadModel(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${outputPath}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlinkSync(outputPath);
        reject(err);
      });
    }).on('error', reject);
  });
}

async function main() {
  const modelsDir = path.join(__dirname, '../public/models');
  
  // Create models directory if it doesn't exist
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }
  
  console.log('Downloading speech models...');
  
  for (const [filename, url] of Object.entries(MODEL_URLS)) {
    const outputPath = path.join(modelsDir, filename);
    
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }
    
    try {
      await downloadModel(url, outputPath);
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
    }
  }
  
  console.log('Model download complete!');
}

if (require.main === module) {
  main().catch(console.error);
}
```

## Build Integration

### Package.json Scripts
```json
{
  "scripts": {
    "download-models": "tsx scripts/download-models.ts",
    "build:whisper": "echo 'TODO: Build whisper.cpp for target platform'",
    "build:coqui": "echo 'TODO: Build Coqui TTS for target platform'",
    "prebuild": "npm run download-models"
  }
}
```

## Notes

1. **Whisper.cpp Integration**: The actual integration requires compiling whisper.cpp to WebAssembly for web, and as native libraries for mobile platforms.

2. **Coqui TTS Integration**: Similarly, Coqui TTS needs to be compiled for each target platform with appropriate bindings.

3. **Model Optimization**: Models should be quantized and optimized for mobile deployment to reduce size and improve performance.

4. **Permissions**: Each platform requires specific permission handling for microphone access and background processing.

5. **Performance**: Hardware acceleration should be utilized where available (Metal on iOS, Vulkan/OpenCL on Android, GPU on desktop).

6. **Fallbacks**: Browser speech APIs serve as fallbacks when native implementations are not available or fail to initialize.