import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Microphone, MicrophoneSlash, Stop, Waveform } from "@phosphor-icons/react";
import { toast } from 'sonner';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  onAppendTranscript?: (text: string) => void;
}

// Supported languages with their BCP-47 codes
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', label: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', label: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', label: 'French', flag: '🇫🇷' },
  { code: 'de-DE', label: 'German', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'ru-RU', label: 'Russian', flag: '🇷🇺' },
  { code: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', label: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
  { code: 'nl-NL', label: 'Dutch', flag: '🇳🇱' },
  { code: 'sv-SE', label: 'Swedish', flag: '🇸🇪' },
  { code: 'da-DK', label: 'Danish', flag: '🇩🇰' },
  { code: 'no-NO', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi-FI', label: 'Finnish', flag: '🇫🇮' },
  { code: 'pl-PL', label: 'Polish', flag: '🇵🇱' },
  { code: 'tr-TR', label: 'Turkish', flag: '🇹🇷' },
  { code: 'he-IL', label: 'Hebrew', flag: '🇮🇱' },
  { code: 'th-TH', label: 'Thai', flag: '🇹🇭' },
  { code: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳' },
];

export function SpeechToText({ onTranscript, onAppendTranscript }: SpeechToTextProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [interimResult, setInterimResult] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();

  // Check browser support on component mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }
  }, []);

  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimResult('');
      setFinalResult('');
      toast.success('Speech recognition started');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let avgConfidence = 0;
      let resultCount = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          avgConfidence += result[0].confidence || 0;
          resultCount++;
          
          // Clear any pending silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          
          // Set a new timeout to stop listening after silence
          silenceTimeoutRef.current = setTimeout(() => {
            stopListening();
          }, 3000); // 3 seconds of silence
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimResult(interimTranscript);
      
      if (finalTranscript) {
        setFinalResult(prev => prev + finalTranscript);
        setConfidence(resultCount > 0 ? avgConfidence / resultCount : 0);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Try speaking closer to the microphone.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'language-not-supported':
          errorMessage = `Language "${language}" is not supported.`;
          break;
      }
      
      toast.error(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Process final result
      if (finalResult.trim()) {
        onTranscript(finalResult.trim());
        if (onAppendTranscript) {
          onAppendTranscript(' ' + finalResult.trim());
        }
        toast.success('Transcription completed');
      }
      
      // Clear timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [language, finalResult, onTranscript, onAppendTranscript]);

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      setupRecognition();
    }
  }, [language, setupRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setFinalResult('');
      setInterimResult('');
      setConfidence(0);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, [isListening]);

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MicrophoneSlash size={16} />
            <span className="text-sm">Speech recognition not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Microphone size={16} />
          Speech to Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <Select value={language} onValueChange={setLanguage} disabled={isListening}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{getCurrentLanguage().flag}</span>
                  <span>{getCurrentLanguage().label}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isListening ? (
            <Button
              onClick={startListening}
              className="flex items-center gap-2"
              size="sm"
            >
              <Microphone size={14} />
              Start Listening
            </Button>
          ) : (
            <Button
              onClick={stopListening}
              variant="destructive"
              className="flex items-center gap-2"
              size="sm"
            >
              <Stop size={14} />
              Stop
            </Button>
          )}
        </div>

        {/* Status and Results */}
        {isListening && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
              <Waveform size={16} className="text-primary animate-pulse" />
              <span className="text-xs text-primary">Listening...</span>
            </div>

            {/* Interim Results */}
            {interimResult && (
              <div className="p-3 bg-muted/50 rounded-md border-l-2 border-orange-400">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">Interim</Badge>
                </div>
                <p className="text-sm text-muted-foreground italic">{interimResult}</p>
              </div>
            )}

            {/* Final Results */}
            {finalResult && (
              <div className="p-3 bg-green-50 rounded-md border-l-2 border-green-400">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">Final</Badge>
                  {confidence > 0 && (
                    <Badge 
                      variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {Math.round(confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">{finalResult}</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          <p>• Click "Start Listening" and speak clearly</p>
          <p>• Speech will auto-stop after 3 seconds of silence</p>
          <p>• Transcribed text will be added to the writing area</p>
        </div>
      </CardContent>
    </Card>
  );
}