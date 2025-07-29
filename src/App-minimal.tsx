import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Lightbulb, ArrowCounterClockwise, Cpu, Cloud, Rocket, Lightning, Globe, FileText } from "@phosphor-icons/react";
import { toast } from "sonner";

// Simple mock interfaces
interface Suggestion {
  original: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
  pattern: string;
  confidence: number;
  explanation?: string;
}

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

// Simple mock phonetic patterns
const BUILTIN_PATTERNS = [
  { from: 'fone', to: 'phone', pattern: 'ph->f' },
  { from: 'seperate', to: 'separate', pattern: 'ar->er' },
  { from: 'recieve', to: 'receive', pattern: 'ie->ei' },
  { from: 'would of', to: 'would have', pattern: 'of->have' },
  { from: 'definately', to: 'definitely', pattern: 'ate->ite' },
  { from: 'fisiscs', to: 'physics', pattern: 'phonetic' },
  { from: 'fisik', to: 'physics', pattern: 'phonetic' },
];

function App() {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof EXAMPLE_TEXTS>('en');
  const [activeTab, setActiveTab] = useState("writing");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simple analysis function
  const analyzeText = (inputText: string) => {
    if (!inputText.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockSuggestions: Suggestion[] = [];
      
      BUILTIN_PATTERNS.forEach(({ from, to, pattern }) => {
        const regex = new RegExp(`\\b${from}\\b`, 'gi');
        let match;
        while ((match = regex.exec(inputText)) !== null) {
          mockSuggestions.push({
            original: match[0],
            suggestion: to,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            pattern,
            confidence: 0.85 + Math.random() * 0.1,
            explanation: `Phonetic correction: "${from}" → "${to}"`
          });
        }
      });

      setSuggestions(mockSuggestions);
      setIsAnalyzing(false);
    }, 500);
  };

  // Handle suggestion acceptance
  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    const before = text.slice(0, suggestion.startIndex);
    const after = text.slice(suggestion.endIndex);
    const newText = before + suggestion.suggestion + after;
    setText(newText);
    toast.success(`Applied: ${suggestion.original} → ${suggestion.suggestion}`);
    analyzeText(newText);
  };

  const handleRejectSuggestion = (suggestion: Suggestion) => {
    toast.info(`Rejected suggestion for: ${suggestion.original}`);
  };

  const loadExample = () => {
    const exampleText = EXAMPLE_TEXTS[currentLanguage];
    setText(exampleText);
    analyzeText(exampleText);
    toast.info('Example text loaded');
  };

  const clearText = () => {
    setText("");
    setSuggestions([]);
    toast.info('Text cleared');
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    analyzeText(newText);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
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
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              ML Ready (CPU)
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered phonetic spelling assistant for dyslexic and ADHD users
          </p>
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
                <TabsTrigger value="language" className="flex items-center gap-2">
                  <Globe size={14} />
                  Language
                </TabsTrigger>
                <TabsTrigger value="hardware" className="flex items-center gap-2">
                  <Lightning size={14} />
                  Hardware
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <FileText size={14} />
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="writing" className="space-y-6 mt-6">
                {/* Writing Area */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb size={16} />
                        Writing Assistant
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={loadExample}>
                          Load Example
                        </Button>
                        <Button size="sm" variant="outline" onClick={clearText}>
                          <ArrowCounterClockwise size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      ref={textareaRef}
                      value={text}
                      onChange={handleTextChange}
                      placeholder="Start typing here..."
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
                            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
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
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {suggestions.map((suggestion, index) => (
                        <div key={`${suggestion.startIndex}-${suggestion.original}-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-card mb-3 last:mb-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-red-600 line-through text-sm">{suggestion.original}</span>
                              <span>→</span>
                              <span className="text-green-600 font-medium text-sm">{suggestion.suggestion}</span>
                              <Badge variant="outline" className={getConfidenceColor(suggestion.confidence)}>
                                {getConfidenceLabel(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                              </Badge>
                            </div>
                            {suggestion.explanation && (
                              <p className="text-xs text-muted-foreground">{suggestion.explanation}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleAcceptSuggestion(suggestion)}>
                              ✓
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectSuggestion(suggestion)}>
                              ✗
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="language" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Language Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Example Language</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {Object.keys(EXAMPLE_TEXTS).map((lang) => (
                            <Button
                              key={lang}
                              variant={currentLanguage === lang ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentLanguage(lang as keyof typeof EXAMPLE_TEXTS)}
                            >
                              {lang.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hardware" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hardware Acceleration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">CPU (Fallback)</div>
                          <div className="text-sm text-muted-foreground">Active</div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Ready
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                        <div>
                          <div className="font-medium">GPU Acceleration</div>
                          <div className="text-sm text-muted-foreground">Not available</div>
                        </div>
                        <Badge variant="outline">
                          Disabled
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About PhonoCorrect AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        PhonoCorrect AI is an assistive typing system that provides real-time phonetic spelling corrections
                        for users with dyslexia and ADHD. This is a simplified demo version.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium">Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Real-time phonetic spell checking</li>
                          <li>• Multi-language support</li>
                          <li>• Hardware acceleration ready</li>
                          <li>• Confidence scoring</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div>
                  <h4 className="font-medium text-foreground mb-1">1. Type or Dictate</h4>
                  <p>Type your text or use speech-to-text to dictate</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">2. Review Suggestions</h4>
                  <p>AI will highlight potential corrections</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">3. Learn & Improve</h4>
                  <p>The system learns from your feedback</p>
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

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cpu size={14} />
                  <span>CPU Engine Ready</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cloud size={14} />
                  <span>Cloud Sync Available</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Rocket size={14} />
                  <span>Mobile Extension Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;