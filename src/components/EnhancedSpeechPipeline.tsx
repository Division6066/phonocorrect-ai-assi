import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Microphone, Speaker, Globe, Download, Play, Pause, Volume2 } from "@phosphor-icons/react";
import { toast } from "sonner";

export function EnhancedSpeechPipeline({ 
  onTranscript, 
  onAppendTranscript, 
  textToSpeak 
}: {
  onTranscript: (text: string) => void;
  onAppendTranscript: (text: string) => void;
  textToSpeak: string;
}) {
  const { currentLanguage, t, availableLanguages } = useLanguage();
  const [isListening, setIsListening] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [selectedSTTLanguage, setSelectedSTTLanguage] = React.useState(currentLanguage);
  const [selectedTTSVoice, setSelectedTTSVoice] = React.useState('auto');
  const [speechRate, setSpeechRate] = React.useState([1.0]);
  const [speechPitch, setSpeechPitch] = React.useState([1.0]);
  const [speechVolume, setSpeechVolume] = React.useState([1.0]);
  const [continuousMode, setContinuousMode] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(false);

  // Mock speech recognition for demo
  const startListening = () => {
    setIsListening(true);
    toast.info(t('speech.listening'));
    
    // Simulate speech recognition
    setTimeout(() => {
      const mockTranscript = "This is a mock transcription in " + availableLanguages.find(l => l.code === selectedSTTLanguage)?.name;
      setTranscript(mockTranscript);
      setIsListening(false);
      toast.success(t('speech.processing'));
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    toast.info("Stopped listening");
  };

  const applyTranscript = () => {
    if (transcript) {
      onTranscript(transcript);
      setTranscript('');
    }
  };

  const appendTranscript = () => {
    if (transcript) {
      onAppendTranscript(' ' + transcript);
      setTranscript('');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  // Mock text-to-speech
  const speakText = () => {
    if (!textToSpeak.trim()) return;
    
    setIsPlaying(true);
    toast.info(t('tts.reading'));
    
    // Simulate TTS playback
    setTimeout(() => {
      setIsPlaying(false);
      toast.success("Finished reading");
    }, 5000);
  };

  const stopSpeaking = () => {
    setIsPlaying(false);
    toast.info("Stopped speaking");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Speech to Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microphone size={20} />
            {t('speech.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>{t('speech.language')}</Label>
            <Select value={selectedSTTLanguage} onValueChange={setSelectedSTTLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="continuous"
                checked={continuousMode}
                onCheckedChange={setContinuousMode}
              />
              <Label htmlFor="continuous">{t('speech.continuous')}</Label>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex gap-2">
            {!isListening ? (
              <Button onClick={startListening} className="flex-1">
                <Microphone size={16} className="mr-2" />
                {t('speech.start_listening')}
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive" className="flex-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                {t('speech.stop_listening')}
              </Button>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{transcript}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={applyTranscript} variant="outline">
                  {t('speech.replace')}
                </Button>
                <Button size="sm" onClick={appendTranscript} variant="outline">
                  {t('speech.append')}
                </Button>
                <Button size="sm" onClick={clearTranscript} variant="ghost">
                  {t('speech.clear_transcript')}
                </Button>
              </div>
            </div>
          )}

          {/* Status */}
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>{t('speech.listening')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text to Speech */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Speaker size={20} />
            {t('tts.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>{t('tts.voice')}</Label>
            <Select value={selectedTTSVoice} onValueChange={setSelectedTTSVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Browser Default)</SelectItem>
                <SelectItem value="coqui-female">Coqui Female ({availableLanguages.find(l => l.code === currentLanguage)?.name})</SelectItem>
                <SelectItem value="coqui-male">Coqui Male ({availableLanguages.find(l => l.code === currentLanguage)?.name})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('tts.speed')}: {speechRate[0].toFixed(1)}x</Label>
              <Slider
                value={speechRate}
                onValueChange={setSpeechRate}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('tts.pitch')}: {speechPitch[0].toFixed(1)}</Label>
              <Slider
                value={speechPitch}
                onValueChange={setSpeechPitch}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('tts.volume')}: {Math.round(speechVolume[0] * 100)}%</Label>
              <Slider
                value={speechVolume}
                onValueChange={setSpeechVolume}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Auto-speak toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-speak"
              checked={autoSpeak}
              onCheckedChange={setAutoSpeak}
            />
            <Label htmlFor="auto-speak">Auto-speak corrections</Label>
          </div>

          {/* Playback Controls */}
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button 
                onClick={speakText} 
                disabled={!textToSpeak.trim()}
                className="flex-1"
              >
                <Play size={16} className="mr-2" />
                {t('tts.read_aloud')}
              </Button>
            ) : (
              <Button onClick={stopSpeaking} variant="destructive" className="flex-1">
                <Pause size={16} className="mr-2" />
                {t('tts.stop')}
              </Button>
            )}
          </div>

          {/* Status */}
          {isPlaying && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 size={16} className="animate-pulse" />
              <span>{t('tts.reading')}</span>
            </div>
          )}

          {/* Language-specific voice info */}
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe size={12} />
              <span>Current language: {availableLanguages.find(l => l.code === currentLanguage)?.nativeName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}