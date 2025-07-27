import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerHigh, SpeakerX, Pause, Play } from "@phosphor-icons/react";

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speak = useCallback(() => {
    if (!isSupported || !text.trim()) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings for accessibility
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused, isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SpeakerX size={16} />
            <span className="text-sm">Text-to-speech not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SpeakerHigh size={16} />
          Read Aloud
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {!isSpeaking ? (
            <Button
              size="sm"
              onClick={speak}
              disabled={!text.trim()}
              className="flex items-center gap-2"
            >
              <Play size={14} />
              Play
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={pause}
                className="flex items-center gap-2"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={stop}
                className="flex items-center gap-2"
              >
                <SpeakerX size={14} />
                Stop
              </Button>
            </>
          )}
        </div>
        {isSpeaking && (
          <div className="mt-3 p-2 bg-primary/10 rounded-md">
            <p className="text-xs text-primary">
              {isPaused ? 'Speech paused' : 'Reading text aloud...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}