import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Microphone, MicrophoneSlash, Circle } from "@phosphor-icons/react";

interface SpeechToTextProps {
  onTranscript: (transcript: string) => void;
}

export const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Microphone size={16} />
          Speech-to-Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "default"}
          className="w-full"
        >
          {isListening ? (
            <>
              <MicrophoneSlash size={14} className="mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Microphone size={14} className="mr-2" />
              Start Listening
            </>
          )}
        </Button>
        
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Circle size={8} className="text-red-500 animate-pulse" />
            Listening...
          </div>
        )}
        
        {transcript && (
          <div className="p-3 bg-muted rounded text-sm">
            {transcript}
          </div>
        )}
      </CardContent>
    </Card>
  );
};