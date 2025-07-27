import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeechToText } from "./SpeechToText";
import { TextToSpeech } from "./TextToSpeech";

interface EnhancedSpeechPipelineProps {
  onTranscript: (transcript: string) => void;
  onAppendTranscript: (transcript: string) => void;
  textToSpeak: string;
}

export const EnhancedSpeechPipeline: React.FC<EnhancedSpeechPipelineProps> = ({
  onTranscript,
  onAppendTranscript: _onAppendTranscript,
  textToSpeak
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Enhanced Speech Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <SpeechToText onTranscript={onTranscript} />
          <TextToSpeech text={textToSpeak} />
        </div>
      </CardContent>
    </Card>
  );
};