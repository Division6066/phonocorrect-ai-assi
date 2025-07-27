import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakerHigh, Pause, Play } from "@phosphor-icons/react";

interface TextToSpeechProps {
  text: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying && utterance) {
        speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.onstart = () => setIsPlaying(true);
      newUtterance.onend = () => setIsPlaying(false);
      newUtterance.onerror = () => setIsPlaying(false);
      
      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SpeakerHigh size={16} />
          Text-to-Speech
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={speak} 
          variant="outline" 
          className="w-full"
          disabled={!text.trim()}
        >
          {isPlaying ? (
            <>
              <Pause size={14} className="mr-2" />
              Stop Reading
            </>
          ) : (
            <>
              <Play size={14} className="mr-2" />
              Read Aloud
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};