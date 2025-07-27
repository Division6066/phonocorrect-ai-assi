import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Microphone, 
  MicrophoneSlash, 
  Stop, 
  Waveform, 
  SpeakerHigh,
  SpeakerX,
  Pause,
  Play,
  Cpu,
  Globe,
  Lightning,
  VolumeHigh
} from "@phosphor-icons/react";
import { useSpeechToText, WHISPER_LANGUAGES } from "@/hooks/use-speech-to-text";
import { useTextToSpeech, COQUI_VOICES } from "@/hooks/use-text-to-speech";
import { toast } from 'sonner';

interface EnhancedSpeechPipelineProps {
  onTranscript?: (text: string) => void;
  onAppendTranscript?: (text: string) => void;
  textToSpeak?: string;
  className?: string;
}

export function EnhancedSpeechPipeline({ 
  onTranscript, 
  onAppendTranscript, 
  textToSpeak = "",
  className 
}: EnhancedSpeechPipelineProps) {
  const [activeTab, setActiveTab] = useState<'stt' | 'tts' | 'pipeline'>('pipeline');
  const [pipelineMode, setPipelineMode] = useState(false);
  
  // Speech-to-Text hook
  const stt = useSpeechToText({
    language: 'en',
    useWhisper: true,
    fallbackToBrowser: true,
    enableRealtime: true,
    enableVAD: true
  });

  // Text-to-Speech hook
  const tts = useTextToSpeech({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    highlightWords: true,
    ssmlEnabled: true
  });

  // Pipeline state
  const [pipelineText, setPipelineText] = useState('');
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);

  // Handle speech-to-text results
  useEffect(() => {
    if (stt.finalResult && onTranscript) {
      onTranscript(stt.finalResult);
      if (pipelineMode) {
        setPipelineText(stt.finalResult);
      }
    }
  }, [stt.finalResult, onTranscript, pipelineMode]);

  // Auto-speak in pipeline mode
  useEffect(() => {
    if (pipelineMode && pipelineText && !stt.isListening && !tts.isPlaying) {
      const timer = setTimeout(() => {
        tts.speak(pipelineText);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pipelineMode, pipelineText, stt.isListening, tts.isPlaying, tts.speak]);

  const handlePipelineToggle = useCallback(() => {
    if (pipelineMode) {
      // Stop pipeline
      stt.stopListening();
      tts.stop();
      setPipelineText('');
      setIsProcessingPipeline(false);
    }
    setPipelineMode(!pipelineMode);
  }, [pipelineMode, stt.stopListening, tts.stop]);

  const startPipelineListening = useCallback(async () => {
    if (!pipelineMode) return;
    
    setIsProcessingPipeline(true);
    setPipelineText('');
    await stt.startListening();
  }, [pipelineMode, stt.startListening]);

  const renderSTTTab = () => (
    <div className="space-y-4">
      {/* Engine Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Engine</label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch 
              checked={stt.whisperEnabled} 
              onCheckedChange={stt.setWhisperEnabled}
              disabled={stt.isListening}
            />
            <span className="text-sm">Use Whisper.cpp</span>
            {stt.whisperEnabled && (
              <Badge variant={stt.modelStatus === 'ready' ? 'default' : 'destructive'}>
                {stt.modelStatus}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Lightning size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Hardware accelerated</span>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Language</label>
        <Select 
          value={stt.selectedLanguage} 
          onValueChange={stt.setSelectedLanguage} 
          disabled={stt.isListening}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{stt.currentLanguage.flag}</span>
                <span>{stt.currentLanguage.label}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {WHISPER_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                  {stt.whisperEnabled && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {lang.whisperModel}
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audio Level Indicator */}
      {stt.isListening && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Audio Level</label>
          <div className="flex items-center gap-2">
            <VolumeHigh size={14} className="text-muted-foreground" />
            <Progress value={stt.audioLevel * 100} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground w-8">
              {Math.round(stt.audioLevel * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!stt.isListening ? (
          <Button
            onClick={stt.startListening}
            disabled={!stt.isSupported || stt.isProcessing}
            className="flex items-center gap-2"
            size="sm"
          >
            <Microphone size={14} />
            Start Listening
          </Button>
        ) : (
          <Button
            onClick={stt.stopListening}
            variant="destructive"
            className="flex items-center gap-2"
            size="sm"
          >
            <Stop size={14} />
            Stop
          </Button>
        )}
        
        <Button
          onClick={stt.resetTranscription}
          variant="outline"
          size="sm"
          disabled={stt.isListening}
        >
          Clear
        </Button>
      </div>

      {/* Status and Results */}
      {(stt.isListening || stt.isProcessing) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md">
            <Waveform size={16} className="text-primary animate-pulse" />
            <span className="text-xs text-primary">
              {stt.isProcessing ? 'Processing audio...' : 'Listening...'}
            </span>
            {stt.whisperEnabled && (
              <Badge variant="outline" className="text-xs ml-auto">
                <Cpu size={12} className="mr-1" />
                Whisper
              </Badge>
            )}
          </div>

          {/* Interim Results */}
          {stt.interimResult && (
            <div className="p-3 bg-muted/50 rounded-md border-l-2 border-orange-400">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">Interim</Badge>
              </div>
              <p className="text-sm text-muted-foreground italic">{stt.interimResult}</p>
            </div>
          )}

          {/* Final Results */}
          {stt.finalResult && (
            <div className="p-3 bg-green-50 rounded-md border-l-2 border-green-400">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">Final</Badge>
                {stt.confidence > 0 && (
                  <Badge 
                    variant={stt.confidence > 0.8 ? "default" : stt.confidence > 0.6 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {Math.round(stt.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{stt.finalResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {stt.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{stt.error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• {stt.whisperEnabled ? 'Using Whisper.cpp for offline transcription' : 'Using browser speech recognition'}</p>
        <p>• Supports {WHISPER_LANGUAGES.length} languages with automatic detection</p>
        <p>• Speech auto-stops after silence detection</p>
      </div>
    </div>
  );

  const renderTTSTab = () => (
    <div className="space-y-4">
      {/* Engine Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Engine</label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch 
              checked={tts.coquiEnabled} 
              onCheckedChange={tts.setCoquiEnabled}
              disabled={tts.isPlaying}
            />
            <span className="text-sm">Use Coqui TTS</span>
            {tts.coquiEnabled && (
              <Badge variant={tts.modelStatus === 'ready' ? 'default' : 'destructive'}>
                {tts.modelStatus}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Lightning size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Neural voices</span>
          </div>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Voice</label>
        <Select 
          value={tts.selectedVoice} 
          onValueChange={tts.setSelectedVoice}
          disabled={tts.isPlaying}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {tts.currentVoice && (
                <span className="flex items-center gap-2">
                  <span>{tts.currentVoice.gender === 'female' ? '👩' : tts.currentVoice.gender === 'male' ? '👨' : '🎭'}</span>
                  <span>{tts.currentVoice.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {tts.currentVoice.quality}
                  </Badge>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tts.availableVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-2">
                    <span>{voice.gender === 'female' ? '👩' : voice.gender === 'male' ? '👨' : '🎭'}</span>
                    <span>{voice.name}</span>
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    {voice.engine === 'coqui' ? (
                      <Cpu size={12} className="text-primary" />
                    ) : (
                      <Globe size={12} className="text-muted-foreground" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {voice.quality}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tts.currentVoice?.description && (
          <p className="text-xs text-muted-foreground">{tts.currentVoice.description}</p>
        )}
      </div>

      {/* Voice Settings */}
      <div className="space-y-4">
        {/* Rate */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Speech Rate: {tts.defaultRate.toFixed(1)}x
          </label>
          <Slider
            value={[tts.defaultRate]}
            onValueChange={([value]) => tts.setDefaultRate(value)}
            min={0.5}
            max={2.0}
            step={0.1}
            disabled={tts.isPlaying}
          />
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Pitch: {tts.defaultPitch.toFixed(1)}
          </label>
          <Slider
            value={[tts.defaultPitch]}
            onValueChange={([value]) => tts.setDefaultPitch(value)}
            min={0.5}
            max={2.0}
            step={0.1}
            disabled={tts.isPlaying}
          />
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Volume: {Math.round(tts.defaultVolume * 100)}%
          </label>
          <Slider
            value={[tts.defaultVolume]}
            onValueChange={([value]) => tts.setDefaultVolume(value)}
            min={0.1}
            max={1.0}
            step={0.1}
            disabled={tts.isPlaying}
          />
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Options</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Word highlighting</span>
            <Switch 
              checked={tts.highlightEnabled} 
              onCheckedChange={tts.setHighlightEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">SSML support</span>
            <Switch 
              checked={tts.ssmlEnabled} 
              onCheckedChange={tts.setSSMLEnabled}
            />
          </div>
        </div>
      </div>

      {/* Playback Progress */}
      {tts.isPlaying && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Playback Progress</label>
          <div className="space-y-1">
            <Progress 
              value={(tts.currentPosition / tts.totalDuration) * 100} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(tts.currentPosition)}s</span>
              <span>{Math.round(tts.totalDuration)}s</span>
            </div>
            {tts.currentWord && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Speaking: "{tts.currentWord}"
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!tts.isPlaying ? (
          <Button
            onClick={() => tts.speak(textToSpeak)}
            disabled={!textToSpeak.trim() || !tts.isSupported || tts.isLoading}
            className="flex items-center gap-2"
            size="sm"
          >
            <Play size={14} />
            {tts.isLoading ? 'Loading...' : 'Speak'}
          </Button>
        ) : (
          <>
            <Button
              onClick={tts.isPaused ? tts.resume : tts.pause}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              {tts.isPaused ? <Play size={14} /> : <Pause size={14} />}
              {tts.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              onClick={tts.stop}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Stop size={14} />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Error Display */}
      {tts.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{tts.error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• {tts.coquiEnabled ? 'Using Coqui TTS for natural-sounding speech' : 'Using browser speech synthesis'}</p>
        <p>• Supports {COQUI_VOICES.length} high-quality neural voices</p>
        <p>• Real-time word highlighting during playback</p>
      </div>
    </div>
  );

  const renderPipelineTab = () => (
    <div className="space-y-4">
      {/* Pipeline Mode Toggle */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-md border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-sm">Smart Pipeline Mode</h3>
            <p className="text-xs text-muted-foreground">
              Automatically correct and read back your speech
            </p>
          </div>
          <Switch 
            checked={pipelineMode} 
            onCheckedChange={handlePipelineToggle}
          />
        </div>
        
        {pipelineMode && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Lightning size={12} />
            <span>Pipeline active: Speech → Whisper → Gemma → Coqui</span>
          </div>
        )}
      </div>

      {pipelineMode && (
        <>
          {/* Pipeline Status */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-md border ${stt.isListening ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Microphone size={14} />
                  <span className="text-xs font-medium">Listening</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stt.isListening ? 'Capturing audio...' : 'Ready to listen'}
                </p>
              </div>
              
              <div className={`p-3 rounded-md border ${tts.isPlaying ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <SpeakerHigh size={14} />
                  <span className="text-xs font-medium">Speaking</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tts.isPlaying ? 'Reading aloud...' : 'Ready to speak'}
                </p>
              </div>
            </div>

            {/* Current Pipeline Text */}
            {pipelineText && (
              <div className="p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">Pipeline Text</Badge>
                </div>
                <p className="text-sm">{pipelineText}</p>
              </div>
            )}
          </div>

          {/* Pipeline Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startPipelineListening}
              disabled={stt.isListening || tts.isPlaying}
              className="flex items-center gap-2"
              size="sm"
            >
              <Microphone size={14} />
              Start Pipeline
            </Button>
            
            <Button
              onClick={() => {
                stt.stopListening();
                tts.stop();
                setPipelineText('');
              }}
              variant="outline"
              size="sm"
              disabled={!stt.isListening && !tts.isPlaying}
            >
              <Stop size={14} />
              Stop
            </Button>
          </div>

          {/* Pipeline Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Speak naturally - your words will be transcribed and corrected</p>
            <p>• Phonetic errors are automatically fixed using Gemma AI</p>
            <p>• Corrected text is read back using natural TTS voices</p>
            <p>• Perfect for learning pronunciation and improving spelling</p>
          </div>
        </>
      )}
    </div>
  );

  if (!stt.isSupported && !tts.isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MicrophoneSlash size={16} />
            <SpeakerX size={16} />
            <span className="text-sm">Speech features not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Microphone size={16} />
            <SpeakerHigh size={16} />
          </div>
          Enhanced Speech Pipeline
          <div className="flex items-center gap-1 ml-auto">
            {stt.modelStatus === 'ready' && (
              <Badge variant="outline" className="text-xs">
                <Cpu size={10} className="mr-1" />
                Whisper
              </Badge>
            )}
            {tts.modelStatus === 'ready' && (
              <Badge variant="outline" className="text-xs">
                <Lightning size={10} className="mr-1" />
                Coqui
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline" className="text-xs">Pipeline</TabsTrigger>
            <TabsTrigger value="stt" className="text-xs">Speech-to-Text</TabsTrigger>
            <TabsTrigger value="tts" className="text-xs">Text-to-Speech</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-4">
            {renderPipelineTab()}
          </TabsContent>

          <TabsContent value="stt" className="mt-4">
            {renderSTTTab()}
          </TabsContent>

          <TabsContent value="tts" className="mt-4">
            {renderTTSTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}