import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain } from "@phosphor-icons/react";

function AppMinimal() {
  const [text, setText] = useState('');
  const [suggestions] = useState([
    {
      original: 'fone',
      suggestion: 'phone',
      startIndex: 0,
      endIndex: 4,
      confidence: 0.95
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold">PhonoCorrect AI</h1>
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              Ready
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered phonetic spelling assistant for dyslexic and ADHD users
          </p>
        </div>

        {/* Writing Area */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Writing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing here..."
              className="min-h-[200px] text-base leading-relaxed resize-none"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
              </div>
              
              {suggestions.length > 0 && (
                <Badge variant="outline" className="text-primary">
                  {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simple Suggestions */}
        {suggestions.length > 0 && text.includes('fone') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground line-through">
                        {suggestion.original}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium text-green-600">
                        {suggestion.suggestion}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setText(text.replace(suggestion.original, suggestion.suggestion));
                        }}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {}}
                      >
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Help */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Type text in the writing area above</p>
            <p>2. AI will suggest corrections for phonetic misspellings</p>
            <p>3. Click "Apply" to accept suggestions</p>
            <p className="text-xs italic mt-4">
              Try typing "fone" to see a suggestion!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AppMinimal;