import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Lightbulb, ArrowCounterClockwise, Cpu, Cloud, Rocket, Lightning, Globe, FileText, Shield, Key, Download, Copy, CheckCircle, AlertTriangle, GitBranch, Play, Calendar } from "@phosphor-icons/react";
import { toast } from "sonner";
import { DebugOverlay } from "@/components/DebugOverlay";
import { HardwareAccelerationPanel } from "@/components/HardwareAccelerationPanel";
import { MLModelsPanel } from "@/components/MLModelsPanel";
import { usePerformanceOptimization } from "@/hooks/use-performance-optimization";

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
  const [setupStep, setSetupStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Performance optimization hook
  const { getCurrentStatus } = usePerformanceOptimization();
  const currentStatus = getCurrentStatus();

  // Development setup steps
  const setupSteps = [
    {
      title: "Apple Developer Account Setup",
      description: "Register and configure your Apple Developer account",
      platform: "iOS/macOS"
    },
    {
      title: "iOS Development Certificates",
      description: "Generate development and distribution certificates",
      platform: "iOS"
    },
    {
      title: "Provisioning Profiles",
      description: "Create app-specific provisioning profiles",
      platform: "iOS"
    },
    {
      title: "Google Play Console Setup",
      description: "Register your Google Play Console developer account",
      platform: "Android"
    },
    {
      title: "Android Keystore & Service Account",
      description: "Generate release signing keys and Google Play service account",
      platform: "Android"
    },
    {
      title: "CI/CD Configuration",
      description: "Configure automated build and deployment with secrets",
      platform: "Both"
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      toast.success("Step marked as complete!");
    }
  };

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
      {/* Debug Overlay */}
      <DebugOverlay position="bottom-right" defaultVisible={false} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold">PhonoCorrect AI</h1>
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              Performance Optimized
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {currentStatus.acceleration}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered phonetic spelling assistant with hardware-accelerated performance and secure developer account setup
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="developer" className="flex items-center gap-2">
                  <Shield size={14} />
                  Developer
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <GitBranch size={14} />
                  Workflows
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
                        <Badge variant="outline" className="text-xs">
                          {Math.round(currentStatus.inferenceTime)}ms
                        </Badge>
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

              <TabsContent value="hardware" className="mt-6">
                <HardwareAccelerationPanel />
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

              <TabsContent value="about" className="mt-6">
                <div className="space-y-6">
                  <MLModelsPanel />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>About PhonoCorrect AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          PhonoCorrect AI is an assistive typing system that provides real-time phonetic spelling corrections
                          for users with dyslexia and ADHD. This version features hardware-accelerated inference and optimized models.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-medium">Performance Features</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Hardware-accelerated inference ({currentStatus.acceleration})</li>
                            <li>• {Math.round(currentStatus.inferenceTime)}ms inference time</li>
                            <li>• Device-optimized model quantization</li>
                            <li>• On-device model downloading and management</li>
                            <li>• Real-time performance monitoring</li>
                            <li>• Multi-language support with optimized models</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="developer" className="space-y-6 mt-6">
                {/* Safe alternative: Secure development setup guide */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Safe alternative:</strong> This guide provides secure setup instructions without handling actual credentials. 
                    Never commit certificates or private keys to your repository.
                  </AlertDescription>
                </Alert>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key size={16} />
                      Developer Account & Certificate Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {setupSteps.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  completedSteps.includes(index) 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {completedSteps.includes(index) ? '✓' : index + 1}
                                </div>
                                <h3 className="font-medium">{step.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {step.platform}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {step.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={completedSteps.includes(index) ? "outline" : "default"}
                              onClick={() => markStepComplete(index)}
                              className="ml-4"
                            >
                              {completedSteps.includes(index) ? (
                                <>
                                  <CheckCircle size={14} className="mr-1" />
                                  Done
                                </>
                              ) : (
                                'Mark Complete'
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch size={16} />
                      GitHub Actions Workflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Certificate Deployment</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ready for manual trigger
                          </div>
                        </div>
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium">CI/CD Pipeline</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Auto-triggered on push
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightning size={14} />
                  Performance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Acceleration</span>
                  <Badge variant="outline" className="text-xs">
                    {currentStatus.acceleration}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inference Time</span>
                  <span className="font-mono text-xs">{Math.round(currentStatus.inferenceTime)}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-mono text-xs">{Math.round(currentStatus.accuracy * 100)}%</span>
                </div>
              </CardContent>
            </Card>

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
                  <p>AI will highlight potential corrections with confidence scores</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">3. Learn & Improve</h4>
                  <p>The system learns from your feedback and optimizes performance</p>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cpu size={14} />
                  <span>Hardware Acceleration Ready</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cloud size={14} />
                  <span>Cloud Sync Available</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield size={14} />
                  <span>Developer Certificates Ready</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lightning size={14} />
                  <span>Performance Optimized</span>
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

  // Development setup steps
  const setupSteps = [
    {
      title: "Apple Developer Account Setup",
      description: "Register and configure your Apple Developer account",
      platform: "iOS/macOS"
    },
    {
      title: "iOS Development Certificates",
      description: "Generate development and distribution certificates",
      platform: "iOS"
    },
    {
      title: "Provisioning Profiles",
      description: "Create app-specific provisioning profiles",
      platform: "iOS"
    },
    {
      title: "Google Play Console Setup",
      description: "Register your Google Play Console developer account",
      platform: "Android"
    },
    {
      title: "Android Keystore & Service Account",
      description: "Generate release signing keys and Google Play service account",
      platform: "Android"
    },
    {
      title: "CI/CD Configuration",
      description: "Configure automated build and deployment with secrets",
      platform: "Both"
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      toast.success("Step marked as complete!");
    }
  };

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
              Development Setup
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered phonetic spelling assistant with secure developer account setup
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="developer" className="flex items-center gap-2">
                  <Shield size={14} />
                  Developer
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <GitBranch size={14} />
                  Workflows
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

              <TabsContent value="developer" className="space-y-6 mt-6">
                {/* Developer Setup */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Safe alternative:</strong> This guide provides secure setup instructions without handling actual credentials. 
                    Never commit certificates or private keys to your repository.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key size={16} />
                      Developer Account & Certificate Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {setupSteps.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  completedSteps.includes(index) 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {completedSteps.includes(index) ? '✓' : index + 1}
                                </div>
                                <h3 className="font-medium">{step.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {step.platform}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {step.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={completedSteps.includes(index) ? "outline" : "default"}
                              onClick={() => markStepComplete(index)}
                              className="ml-4"
                            >
                              {completedSteps.includes(index) ? (
                                <>
                                  <CheckCircle size={14} className="mr-1" />
                                  Done
                                </>
                              ) : (
                                'Mark Complete'
                              )}
                            </Button>
                          </div>

                          {/* Step-specific content */}
                          {index === 0 && (
                            <div className="bg-muted/50 rounded p-3 text-sm">
                              <p className="font-medium mb-2">Required Actions:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Visit <a href="https://developer.apple.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">developer.apple.com</a></li>
                                <li>Create Apple Developer account ($99/year)</li>
                                <li>Verify your legal entity information</li>
                                <li>Accept agreements and set up banking</li>
                              </ul>
                            </div>
                          )}

                          {index === 1 && (
                            <div className="bg-muted/50 rounded p-3 text-sm space-y-3">
                              <div>
                                <p className="font-medium mb-2">Certificate Generation Commands:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Generate Certificate Signing Request</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('openssl req -new -newkey rsa:2048 -nodes -keyout ios_dev.key -out ios_dev.csr', 'iOS Dev CSR Command')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>openssl req -new -newkey rsa:2048 -nodes \</div>
                                  <div>  -keyout ios_dev.key -out ios_dev.csr</div>
                                </div>
                              </div>
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  Store private keys (.key files) securely and never commit them to version control.
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {index === 3 && (
                            <div className="bg-muted/50 rounded p-3 text-sm">
                              <p className="font-medium mb-2">Required Actions:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Visit <a href="https://play.google.com/console" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Play Console</a></li>
                                <li>Create developer account ($25 one-time fee)</li>
                                <li>Verify identity and payment method</li>
                                <li>Complete developer profile</li>
                              </ul>
                            </div>
                          )}

                          {index === 4 && (
                            <div className="bg-muted/50 rounded p-3 text-sm space-y-3">
                              <div>
                                <p className="font-medium mb-2">Automated Keystore Generation:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Run automated setup script</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('npm run setup:android-keystore', 'Android Setup Command')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>npm run setup:android-keystore</div>
                                  <div className="text-muted-foreground"># Generates keystore, passwords, and configuration</div>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium mb-2">Manual Keystore Generation:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Generate Android Signing Key</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('keytool -genkey -v -keystore phonocorrectai-release-key.keystore -alias phonocorrectai-key-alias -keyalg RSA -keysize 2048 -validity 10000', 'Android Keystore Command')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>keytool -genkey -v -keystore phonocorrectai-release-key.keystore \</div>
                                  <div>  -alias phonocorrectai-key-alias -keyalg RSA -keysize 2048 \</div>
                                  <div>  -validity 10000</div>
                                </div>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Verify Configuration:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Verify keystore and setup</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('./scripts/verify-android-keystore.sh', 'Verify Command')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>./scripts/verify-android-keystore.sh</div>
                                </div>
                              </div>

                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <strong>Critical:</strong> Backup your keystore file securely. Losing it means you cannot update your app on Google Play.
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {index === 5 && (
                            <div className="bg-muted/50 rounded p-3 text-sm space-y-3">
                              <div>
                                <p className="font-medium mb-2">GitHub Secrets Configuration:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Set GitHub secrets via CLI</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh secret set ANDROID_KEYSTORE_BASE64 < keystore.base64', 'Set GitHub Secret')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>gh secret set ANDROID_KEYSTORE_BASE64 < keystore.base64</div>
                                  <div>gh secret set ANDROID_STORE_PASSWORD</div>
                                  <div>gh secret set ANDROID_KEY_PASSWORD</div>
                                  <div>gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON < service-account.base64</div>
                                </div>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Test Keystore Setup:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Test via GitHub Actions</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh workflow run android-keystore-setup.yml -f action=verify', 'Test Workflow')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>gh workflow run android-keystore-setup.yml -f action=verify</div>
                                </div>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Environment Variables Template:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Required for CI/CD</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`ANDROID_KEYSTORE_BASE64=\nANDROID_STORE_PASSWORD=\nANDROID_KEY_PASSWORD=\nANDROID_KEY_ALIAS=phonocorrectai-key-alias\nGOOGLE_PLAY_SERVICE_ACCOUNT_JSON=`, 'Environment Variables')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>ANDROID_KEYSTORE_BASE64=</div>
                                  <div>ANDROID_STORE_PASSWORD=</div>
                                  <div>ANDROID_KEY_PASSWORD=</div>
                                  <div>ANDROID_KEY_ALIAS=phonocorrectai-key-alias</div>
                                  <div>GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=</div>
                                </div>
                              </div>

                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <strong>Security:</strong> Never commit actual secrets to version control. Use encrypted environment variables only.
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Progress Summary */}
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Setup Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {completedSteps.length} of {setupSteps.length} steps completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedSteps.length / setupSteps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Security Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Never commit certificates or private keys to version control</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Use environment variables for sensitive data in CI/CD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Backup signing keys in secure, encrypted storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Use strong passwords for all certificates and keystores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span>Enable two-factor authentication on developer accounts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6 mt-6">
                {/* GitHub Actions Workflows */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch size={16} />
                      GitHub Actions Workflows
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Certificate Deployment Workflow */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield size={16} className="text-blue-600" />
                              <h3 className="font-medium">Certificate Deployment</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Production Ready
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Automated workflow for deploying and signing apps with certificates across all platforms
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">iOS</Badge>
                              <Badge variant="outline" className="text-xs">Android</Badge>
                              <Badge variant="outline" className="text-xs">macOS</Badge>
                              <Badge variant="outline" className="text-xs">Windows</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => copyToClipboard('gh workflow run deploy-certificates.yml -f environment=staging -f platform=all', 'Deploy Command')}
                            className="ml-4"
                          >
                            <Play size={14} className="mr-1" />
                            Deploy
                          </Button>
                        </div>

                        <div className="bg-muted/50 rounded p-3 text-sm space-y-2">
                          <div className="font-medium">Features:</div>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                            <li>Validates required secrets before deployment</li>
                            <li>Signs iOS apps and uploads to TestFlight/App Store</li>
                            <li>Signs Android APKs/AABs and uploads to Play Console</li>
                            <li>Notarizes macOS apps for distribution</li>
                            <li>Signs Windows executables with code signing certificates</li>
                            <li>Environment-specific deployment (staging/production)</li>
                            <li>Secure handling of certificates and private keys</li>
                          </ul>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium">Manual Trigger Commands:</div>
                          <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span># Deploy to staging (all platforms)</span>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh workflow run deploy-certificates.yml -f environment=staging -f platform=all', 'Staging Deploy Command')}>
                                <Copy size={10} />
                              </Button>
                            </div>
                            <div>gh workflow run deploy-certificates.yml -f environment=staging -f platform=all</div>
                            <div className="flex items-center justify-between mt-2">
                              <span># Deploy iOS only to production</span>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh workflow run deploy-certificates.yml -f environment=production -f platform=ios', 'iOS Production Deploy Command')}>
                                <Copy size={10} />
                              </Button>
                            </div>
                            <div>gh workflow run deploy-certificates.yml -f environment=production -f platform=ios</div>
                          </div>
                        </div>
                      </div>

                      {/* Certificate Setup & Renewal Workflow */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar size={16} className="text-amber-600" />
                              <h3 className="font-medium">Certificate Setup & Renewal</h3>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                Automated
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Monitors certificate expiration and provides setup instructions for new certificates
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">Monthly Check</Badge>
                              <Badge variant="outline" className="text-xs">Auto-Renewal</Badge>
                              <Badge variant="outline" className="text-xs">Notifications</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard('gh workflow run certificate-setup.yml -f action=check -f platform=all', 'Check Command')}
                            className="ml-4"
                          >
                            <Calendar size={14} className="mr-1" />
                            Check
                          </Button>
                        </div>

                        <div className="bg-muted/50 rounded p-3 text-sm space-y-2">
                          <div className="font-medium">Features:</div>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                            <li>Monthly automated certificate expiration checks</li>
                            <li>Creates GitHub issues for certificates expiring soon</li>
                            <li>Generates detailed setup instructions for each platform</li>
                            <li>Validates certificate integrity and expiration dates</li>
                            <li>Supports manual certificate renewal workflows</li>
                            <li>Platform-specific renewal guidance and commands</li>
                          </ul>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium">Manual Trigger Commands:</div>
                          <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span># Check all certificate expiration</span>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh workflow run certificate-setup.yml -f action=check -f platform=all', 'Check All Command')}>
                                <Copy size={10} />
                              </Button>
                            </div>
                            <div>gh workflow run certificate-setup.yml -f action=check -f platform=all</div>
                            <div className="flex items-center justify-between mt-2">
                              <span># Generate setup instructions</span>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard('gh workflow run certificate-setup.yml -f action=setup -f platform=all', 'Setup Instructions Command')}>
                                <Copy size={10} />
                              </Button>
                            </div>
                            <div>gh workflow run certificate-setup.yml -f action=setup -f platform=all</div>
                          </div>
                        </div>
                      </div>

                      {/* CI/CD Pipeline */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Rocket size={16} className="text-green-600" />
                              <h3 className="font-medium">CI/CD Pipeline</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Active
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Continuous integration and deployment pipeline for all platforms and packages
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">Test</Badge>
                              <Badge variant="outline" className="text-xs">Build</Badge>
                              <Badge variant="outline" className="text-xs">Release</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded p-3 text-sm space-y-2">
                          <div className="font-medium">Triggers automatically on:</div>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                            <li>Push to main or develop branches</li>
                            <li>Pull requests to main branch</li>
                            <li>Creates releases with QR code distribution page</li>
                            <li>Builds desktop apps for Windows, macOS, and Linux</li>
                            <li>Builds mobile apps via Expo EAS</li>
                            <li>Packages Chrome extension for distribution</li>
                          </ul>
                        </div>
                      </div>

                      {/* Workflow Status */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Certificate Deployment</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ready for manual trigger
                          </div>
                        </div>
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">Certificate Monitoring</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Scheduled monthly checks
                          </div>
                        </div>
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium">CI/CD Pipeline</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Auto-triggered on push
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Security Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Security & Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Shield size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Secure Secret Management</div>
                          <div className="text-muted-foreground text-xs">All certificates and private keys are stored as encrypted GitHub Secrets and never exposed in logs</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Environment Isolation</div>
                          <div className="text-muted-foreground text-xs">Staging and production deployments use separate environments with different certificates</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Certificate Expiration Monitoring</div>
                          <div className="text-muted-foreground text-xs">Automated checks create GitHub issues when certificates are near expiration</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Key size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Temporary Keychain Cleanup</div>
                          <div className="text-muted-foreground text-xs">All temporary keychains and certificate files are automatically cleaned up after use</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="language" className="mt-6">
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
                  <Shield size={14} />
                  <span>Developer Certificates Ready</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
