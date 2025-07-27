import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhonoEngine } from "@/hooks/use-phono-engine";
import { useElectron } from "@/hooks/use-electron";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext-mock";
import { SuggestionCard } from "@/components/SuggestionCard";
import { TextToSpeech } from "@/components/TextToSpeech";
import { SpeechToText } from "@/components/SpeechToText";
import { EnhancedSpeechPipeline } from "@/components/EnhancedSpeechPipeline";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { LearningStats } from "@/components/LearningStats";
import { UserProfileCard } from "@/components/UserProfileCard";
import { MLModelsPanel } from "@/components/MLModelsPanel";
import { CloudSyncPanel } from "@/components/CloudSyncPanel";
import { DeploymentPanel } from "@/components/DeploymentPanel";
import { HardwareAccelerationPanel } from "@/components/HardwareAccelerationPanel";
import { CustomRulesPanel } from "@/components/CustomRulesPanel";
import { RuleTemplatesPanel } from "@/components/RuleTemplatesPanel";
import { LanguageSettingsPanel } from "@/components/LanguageSettingsPanel";
import { Brain, Lightbulb, ArrowCounterClockwise, Download, Upload, Keyboard, Microphone, Cpu, Cloud, Rocket, Lightning, Globe, Template } from "@phosphor-icons/react";
import { toast } from "sonner";

// Multi-language example texts
const EXAMPLE_TEXTS = {
  en: "I recieve your fone call about the seperate meetng. Would of been nice to no earlier. Definately going thru the new fisiscs problems.",
  es: "Resivió tu téléfono llamada sobre la reunión separar. Habría estado bien saber antes. Definitamente pasando por los nuevos problemas de física.",
  fr: "J'ai resu votre téléfone appel à propos de la réunion séparer. Ça aurait été bien de savoir plus tôt. Définitivement en passant par les nouveaux problèmes de fisique.",
  de: "Ich habe Ihren téléfon Anruf über das getrennte Treffen erhalten. Wäre schön gewesen, es früher zu wissen. Definitiv durch die neuen fisik Probleme.",
  he: "קיבלתי את הטלפון שלך על הפגישה הנפרדת. היה נחמד לדעת קודם. בהחלט עובר דרך בעיות הפיזיקה החדשות.",
  ar: "استلمت هاتفك المكالمة حول الاجتماع المنفصل. كان سيكون من الجميل معرفة ذلك في وقت سابق. بالتأكيد أمر عبر مشاكل الفيزياء الجديدة.",
  zh: "我收到了您的电话呼叫关于分开的会议。早点知道会很好。绝对通过新的物理问题。"
};

function App() {
  const { currentLanguage, t } = useLanguage();
  const { isPremium } = useAuth();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showSpeechToText, setShowSpeechToText] = useState(false);
  const [activeTab, setActiveTab] = useState("writing");
  
  const {
    suggestions,
    isAnalyzing,
    isMLReady,
    accelerationType,
    performanceMetrics,
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
    toast.success(t('notifications.suggestion_applied', { 
      original: suggestion.original, 
      suggestion: suggestion.suggestion 
    }));
  };

  const handleRejectSuggestion = (suggestion: any) => {
    recordFeedback(suggestion.pattern, false);
    toast.info(t('notifications.suggestion_rejected', { original: suggestion.original }));
  };

  const loadExample = () => {
    const exampleText = EXAMPLE_TEXTS[currentLanguage] || EXAMPLE_TEXTS.en;
    setText(exampleText);
    toast.info(t('notifications.example_loaded'));
  };

  const clearText = () => {
    setText("");
    toast.info(t('notifications.text_cleared'));
  };

  // Handle file operations
  const handleSave = async () => {
    if (!text.trim()) {
      toast.error(t('notifications.no_text_to_save'));
      return;
    }

    const result = await saveFile(text, "phonocorrect-document.txt");
    if (result.success) {
      toast.success(t('notifications.document_saved'));
      showNotification("PhonoCorrect AI", t('notifications.document_saved'));
    } else if (!result.canceled) {
      toast.error(result.error || t('notifications.save_failed'));
    }
  };

  const handleOpen = async () => {
    const result = await openFile();
    if (result.success && result.content) {
      setText(result.content);
      toast.success(t('notifications.document_loaded'));
      showNotification("PhonoCorrect AI", t('notifications.document_loaded'));
    } else if (!result.canceled) {
      toast.error(result.error || t('notifications.load_failed'));
    }
  };

  // Handle speech to text
  const handleTranscript = (transcript: string) => {
    setText(transcript);
    toast.success(t('notifications.speech_transcribed'));
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
      toast.info(t('notifications.use_read_aloud'));
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
            <h1 className="text-3xl font-bold">{t('app.title')}</h1>
            {isElectron && (
              <Badge variant="outline" className="ml-2">
                {t('app.desktop')}
              </Badge>
            )}
            {isMLReady && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                ML Ready ({accelerationType})
              </Badge>
            )}
            {performanceMetrics && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                {performanceMetrics.inferenceTimeMs.toFixed(1)}ms
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('app.subtitle')}
          </p>
          {isElectron && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('app.shortcuts_help', { 
                dictation: shortcuts.dictation,
                keyboard: shortcuts.keyboard,
                save: shortcuts.save
              })}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  {t('tabs.writing')}
                </TabsTrigger>
                <TabsTrigger value="custom-rules" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Rules
                </TabsTrigger>
                <TabsTrigger value="rule-templates" className="flex items-center gap-2">
                  <Template size={14} />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="language" className="flex items-center gap-2">
                  <Globe size={14} />
                  Language
                </TabsTrigger>
                <TabsTrigger value="acceleration" className="flex items-center gap-2">
                  <Lightning size={14} />
                  {t('tabs.hardware')}
                </TabsTrigger>
                <TabsTrigger value="ml-models" className="flex items-center gap-2">
                  <Cpu size={14} />
                  {t('tabs.ml_models')}
                </TabsTrigger>
                <TabsTrigger value="cloud-sync" className="flex items-center gap-2">
                  <Cloud size={14} />
                  {t('tabs.cloud_premium')}
                </TabsTrigger>
                <TabsTrigger value="deployment" className="flex items-center gap-2">
                  <Rocket size={14} />
                  {t('tabs.deployment')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="writing" className="space-y-6 mt-6">
                {/* Writing Area */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb size={16} />
                        {t('writing.title')}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={loadExample}
                          className="text-xs"
                        >
                          {t('writing.load_example')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={clearText}
                          className="text-xs"
                        >
                          <ArrowCounterClockwise size={14} />
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
                      placeholder={t('writing.placeholder')}
                      className="min-h-[200px] text-base leading-relaxed resize-none"
                    />
                    
                    {/* Analysis Status */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {t('writing.words_count', { 
                            count: text.trim().split(/\s+/).filter(word => word.length > 0).length 
                          })}
                        </div>
                        {suggestions.length > 0 && (
                          <Badge variant="outline" className="text-primary">
                            {t(suggestions.length === 1 ? 'writing.suggestions_count' : 'writing.suggestions_count_plural', {
                              count: suggestions.length
                            })}
                          </Badge>
                        )}
                      </div>
                      
                      {isAnalyzing && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-sm text-muted-foreground">{t('writing.analyzing')}</span>
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
                        {t('writing.suggestions_title')}
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

                {/* Enhanced Speech Pipeline */}
                {showSpeechToText && (
                  <EnhancedSpeechPipeline 
                    onTranscript={handleTranscript}
                    onAppendTranscript={handleAppendTranscript}
                    textToSpeak={text}
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

              <TabsContent value="custom-rules" className="mt-6">
                <CustomRulesPanel />
              </TabsContent>

              <TabsContent value="rule-templates" className="mt-6">
                <RuleTemplatesPanel />
              </TabsContent>

              <TabsContent value="language" className="mt-6">
                <LanguageSettingsPanel />
              </TabsContent>

              <TabsContent value="acceleration" className="mt-6">
                <HardwareAccelerationPanel />
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

          {/* Sidebar - only visible on writing, custom-rules, rule-templates, language and acceleration tabs */}
          {(activeTab === "writing" || activeTab === "custom-rules" || activeTab === "rule-templates" || activeTab === "language" || activeTab === "acceleration") && (
            <div className="space-y-6">
              <UserProfileCard />
              <LearningStats preferences={userPreferences} />
              
              {/* Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('help.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('help.steps.type.title')}</h4>
                    <p>{t('help.steps.type.description')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('help.steps.suggestions.title')}</h4>
                    <p>{t('help.steps.suggestions.description')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('help.steps.learn.title')}</h4>
                    <p>{t('help.steps.learn.description')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Common Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('patterns.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">fone</span>
                    <span className="font-medium">{t('patterns.examples.phone')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">seperate</span>
                    <span className="font-medium">{t('patterns.examples.separate')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">recieve</span>
                    <span className="font-medium">{t('patterns.examples.receive')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">would of</span>
                    <span className="font-medium">{t('patterns.examples.would_have')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* New Features Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{t('features.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cpu size={14} />
                    <span>{t('features.whisper_gemma')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cloud size={14} />
                    <span>{isPremium ? 'Cloud sync enabled' : t('features.cloud_sync')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Rocket size={14} />
                    <span>{t('features.mobile_extension')}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setActiveTab("custom-rules")}
                    className="w-full mt-2"
                  >
                    Manage Custom Rules
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setActiveTab("rule-templates")}
                    className="w-full mt-2"
                  >
                    Browse Templates
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