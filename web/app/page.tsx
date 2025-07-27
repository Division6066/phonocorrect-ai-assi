'use client';

import { useState, useRef } from 'react';
import { usePhonoEngine, SuggestionCard, useTextToSpeech, useSpeechRecognition } from '@phonocorrect-ai/common';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, RotateCcw, Microphone, Volume2 } from '@phosphor-icons/react';
import { toast } from 'sonner';

const EXAMPLE_TEXT = "I recieve your fone call about the seperate meetng. Would of been nice to no earlier. Definately going thru the new fisiscs problems.";

export default function Home() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    suggestions,
    isAnalyzing,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  } = usePhonoEngine(text);

  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  const { 
    startListening, 
    stopListening, 
    isListening, 
    transcript,
    isSupported: speechSupported 
  } = useSpeechRecognition();

  const handleAcceptSuggestion = (suggestion: any) => {
    const newText = applySuggestion(suggestion, text);
    setText(newText);
    recordFeedback(suggestion.pattern, true);
    toast.success(`Applied suggestion: ${suggestion.original} → ${suggestion.suggestion}`);
  };

  const handleRejectSuggestion = (suggestion: any) => {
    recordFeedback(suggestion.pattern, false);
    toast.info(`Rejected suggestion for "${suggestion.original}"`);
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
    toast.info('Loaded example text with common phonetic errors');
  };

  const clearText = () => {
    setText('');
    toast.info('Text cleared');
  };

  const handleSpeechToText = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setText(transcript);
        toast.success('Speech transcribed successfully');
      }
    } else {
      startListening();
    }
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold">PhonoCorrect AI</h1>
            <Badge variant="outline" className="ml-2">
              Web App
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A phonetic spelling assistant that helps you write with confidence. 
            Get intelligent suggestions based on how words sound, not just how they're spelled.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb size={16} />
                    Writing Area
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={loadExample}
                      className="text-xs"
                    >
                      Load Example
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={clearText}
                      className="text-xs"
                    >
                      <RotateCcw size={14} />
                    </Button>
                    {speechSupported && (
                      <Button 
                        size="sm" 
                        variant={isListening ? "default" : "outline"}
                        onClick={handleSpeechToText}
                        className="text-xs"
                      >
                        <Microphone size={14} />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant={isSpeaking ? "default" : "outline"}
                      onClick={handleTextToSpeech}
                      className="text-xs"
                      disabled={!text.trim()}
                    >
                      <Volume2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing your message here. Try words like 'fone', 'seperate', or 'recieve' to see phonetic corrections..."
                  className="min-h-[200px] text-base leading-relaxed resize-none"
                />
                
                {/* Analysis Status */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
                    </div>
                    {suggestions.length > 0 && (
                      <Badge variant="outline" className="text-primary">
                        {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </div>
                  
                  {isAnalyzing && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  )}

                  {isListening && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-500">Listening...</span>
                    </div>
                  )}

                  {isSpeaking && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-500">Speaking...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Phonetic Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={`${suggestion.startIndex}-${suggestion.original}-${index}`}
                      suggestion={suggestion}
                      onAccept={() => handleAcceptSuggestion(suggestion)}
                      onReject={() => handleRejectSuggestion(suggestion)}
                      getConfidenceColor={getConfidenceColor}
                      getConfidenceLabel={getConfidenceLabel}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">1. Type Naturally</h4>
                  <p>Write how words sound to you. Don't worry about perfect spelling.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">2. Get Smart Suggestions</h4>
                  <p>Our AI recognizes phonetic patterns and suggests corrections.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">3. Learn Together</h4>
                  <p>Accept or reject suggestions to teach the system your preferences.</p>
                </div>
              </CardContent>
            </Card>

            {/* Common Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Common Patterns</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">fone</span>
                  <span className="font-medium">phone</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">seperate</span>
                  <span className="font-medium">separate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">recieve</span>
                  <span className="font-medium">receive</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">would of</span>
                  <span className="font-medium">would have</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}