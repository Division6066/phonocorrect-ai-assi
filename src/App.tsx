import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhonoEngine } from "@/hooks/use-phono-engine";
import { useElectron } from "@/hooks/use-electron";
import { SuggestionCard } from "@/components/SuggestionCard";
import { TextToSpeech } from "@/components/TextToSpeech";
import { SpeechToText } from "@/components/SpeechToText";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { LearningStats } from "@/components/LearningStats";
import { MLModelsPanel } from "@/components/MLModelsPanel";
import { CloudSyncPanel } from "@/components/CloudSyncPanel";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { Brain, Lightbulb, RotateCcw, Download, Upload, Keyboard, Microphone, Cpu, Cloud, Rocket } from "@phosphor-icons/react";
import { toast } from "sonner";

const EXAMPLE_TEXT = "I recieve your fone call about the seperate meetng. Would of been nice to no earlier. Definately going thru the new fisiscs problems.";

function App() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSpeechToText, setShowSpeechToText] = useState(false);
  const [activeTab, setActiveTab] = useState("writing");
  
  const {
    suggestions,
    isAnalyzing,
    recordFeedback,
    applySuggestion,
    getConfidenceColor,
    getConfidenceLabel,
    userPreferences
  } = usePhonoEngine(text);

  const {
    isElectron,
    platform,
    showNotification,
    saveFile,
    openFile,
    useMenuActions,
    shortcuts
  } = useElectron();

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
    toast.info("Loaded example text with common phonetic errors");
  };

  const clearText = () => {
    setText("");
    toast.info("Text cleared");
  };

  // Handle file operations
  const handleSave = async () => {
    if (!text.trim()) {
      toast.error("No text to save");
      return;
    }

    const result = await saveFile(text, "phonocorrect-document.txt");
    if (result.success) {
      toast.success("Document saved successfully");
      showNotification("PhonoCorrect AI", "Document saved successfully");
    } else if (!result.canceled) {
      toast.error(result.error || "Failed to save document");
    }
  };

  const handleOpen = async () => {
    const result = await openFile();
    if (result.success && result.content) {
      setText(result.content);
      toast.success("Document loaded successfully");
      showNotification("PhonoCorrect AI", "Document loaded successfully");
    } else if (!result.canceled) {
      toast.error(result.error || "Failed to open document");
    }
  };

  // Handle speech to text
  const handleTranscript = (transcript: string) => {
    setText(transcript);
    toast.success("Speech transcribed successfully");
  };

  const handleAppendTranscript = (transcript: string) => {
    setText(prev => prev + transcript);
  };

  // Handle virtual keyboard
  const handleKeyboardInput = (input: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.slice(0, start) + input + text.slice(end);
      setText(newText);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + input.length, start + input.length);
      }, 0);
    } else {
      setText(prev => prev + input);
    }
  };

  const handleSpecialKey = (key: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    switch (key) {
      case 'Backspace':
        if (start > 0) {
          const newText = text.slice(0, start - 1) + text.slice(end);
          setText(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start - 1, start - 1);
          }, 0);
        }
        break;
      case 'Enter':
        handleKeyboardInput('\n');
        break;
      case 'Tab':
        handleKeyboardInput('\t');
        break;
      case 'ArrowLeft':
        textarea.focus();
        textarea.setSelectionRange(Math.max(0, start - 1), Math.max(0, start - 1));
        break;
      case 'ArrowRight':
        textarea.focus();
        textarea.setSelectionRange(Math.min(text.length, start + 1), Math.min(text.length, start + 1));
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        // Handle line navigation
        textarea.focus();
        break;
    }
  };

  // Setup Electron menu handlers
  useMenuActions({
    'new-document': () => setText(""),
    'save-document': handleSave,
    'open-document': handleOpen,
    'clear-text': clearText,
    'start-dictation': () => setShowSpeechToText(true),
    'toggle-dictation': () => setShowSpeechToText(!showSpeechToText),
    'global-dictation': () => setShowSpeechToText(true),
    'toggle-keyboard': () => setShowKeyboard(!showKeyboard),
    'global-keyboard': () => setShowKeyboard(!showKeyboard),
    'read-aloud': () => {
      // Trigger text-to-speech - this will be handled by TextToSpeech component
      toast.info("Use the Read Aloud controls below");
    }
  });

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
            {isElectron && (
              <Badge variant="outline" className="ml-2">
                Desktop App
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A phonetic spelling assistant that helps you write with confidence. 
            Get intelligent suggestions based on how words sound, not just how they're spelled.
          </p>
          {isElectron && (
            <p className="text-xs text-muted-foreground mt-2">
              Shortcuts: {shortcuts.dictation} (Dictation) • {shortcuts.keyboard} (Keyboard) • {shortcuts.save} (Save)
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="ml-models" className="flex items-center gap-2">
                  <Cpu size={14} />
                  ML Models
                </TabsTrigger>
                <TabsTrigger value="cloud-sync" className="flex items-center gap-2">
                  <Cloud size={14} />
                  Cloud & Premium
                </TabsTrigger>
                <TabsTrigger value="deployment" className="flex items-center gap-2">
                  <Rocket size={14} />
                  Deployment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="writing" className="space-y-6 mt-6">
                {/* Writing Area */}
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
                        {isElectron && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleSave}
                              className="text-xs"
                            >
                              <Download size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleOpen}
                              className="text-xs"
                            >
                              <Upload size={14} />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant={showSpeechToText ? "default" : "outline"}
                          onClick={() => setShowSpeechToText(!showSpeechToText)}
                          className="text-xs"
                        >
                          <Microphone size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={showKeyboard ? "default" : "outline"}
                          onClick={() => setShowKeyboard(!showKeyboard)}
                          className="text-xs"
                        >
                          <Keyboard size={14} />
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

                {/* Text-to-Speech */}
                {text.trim() && <TextToSpeech text={text} />}

                {/* Speech-to-Text */}
                {showSpeechToText && (
                  <SpeechToText 
                    onTranscript={handleTranscript}
                    onAppendTranscript={handleAppendTranscript}
                  />
                )}

                {/* Virtual Keyboard */}
                {showKeyboard && (
                  <VirtualKeyboard
                    onInput={handleKeyboardInput}
                    onSpecialKey={handleSpecialKey}
                    targetRef={textareaRef}
                  />
                )}
              </TabsContent>

              <TabsContent value="ml-models" className="mt-6">
                <MLModelsPanel />
              </TabsContent>

              <TabsContent value="cloud-sync" className="mt-6">
                <CloudSyncPanel />
              </TabsContent>

              <TabsContent value="deployment" className="mt-6">
                <DeploymentPanel />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - only visible on writing tab */}
          {activeTab === "writing" && (
            <div className="space-y-6">
              <LearningStats preferences={userPreferences} />
              
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

              {/* New Features Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">New Features</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cpu size={14} />
                    <span>Whisper & Gemma ML integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cloud size={14} />
                    <span>Cloud sync & premium features</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Rocket size={14} />
                    <span>Mobile app & Chrome extension</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setActiveTab("ml-models")}
                    className="w-full mt-2"
                  >
                    Explore Features
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;