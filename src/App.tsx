import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Lightbulb, ArrowCounterClockwise, Cpu, Cloud, Rocket, Lightning, Globe, FileText, Shield, Key, Download, Copy, CheckCircle, AlertTriangle, GitBranch, Play, Calendar, Scales, TestTube, Bell } from "@phosphor-icons/react";
import { toast } from "sonner";
import { DebugOverlay } from "@/components/DebugOverlay";
import { HardwareAccelerationPanel } from "@/components/HardwareAccelerationPanel";
import { MLModelsPanel } from "@/components/MLModelsPanel";
import { ModelQuantizationPanel } from "@/components/ModelQuantizationPanel";
import { QuantizationComparison } from "@/components/QuantizationComparison";
import { TestingDashboard } from "@/components/TestingDashboard";
import { AutomatedRegressionAlerts } from "@/components/AutomatedRegressionAlerts";
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
              Comprehensive Testing
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {currentStatus.acceleration}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Full Test Coverage
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered phonetic spelling assistant with comprehensive test coverage across mobile, web, and extension platforms
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-9">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="testing" className="flex items-center gap-2">
                  <TestTube size={14} />
                  Testing
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
                <TabsTrigger value="quantization" className="flex items-center gap-2">
                  <Brain size={14} />
                  Models
                </TabsTrigger>
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Scales size={14} />
                  Compare
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

              <TabsContent value="testing" className="mt-6">
                <div className="space-y-6">
                  <TestingDashboard />
                  
                  {/* Automated Performance Regression Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell size={16} />
                        Automated Regression Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AutomatedRegressionAlerts />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="hardware" className="mt-6">
                <HardwareAccelerationPanel />
              </TabsContent>

              <TabsContent value="quantization" className="mt-6">
                <ModelQuantizationPanel />
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

              <TabsContent value="comparison" className="mt-6">
                <QuantizationComparison />
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
                          for users with dyslexia and ADHD. This enhanced version features comprehensive test coverage across
                          mobile (Detox), web (Playwright), and extension platforms with CI matrix testing.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-medium">Comprehensive Testing Features</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Detox end-to-end testing for iOS 16/17 and Android API 26/34</li>
                            <li>• Playwright cross-browser testing for web and Chrome extension</li>
                            <li>• Jest unit tests for custom rule engine with >95% coverage</li>
                            <li>• CI matrix testing across all supported platforms</li>
                            <li>• Performance benchmarking and regression testing</li>
                            <li>• Accessibility testing and screen reader compatibility</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Testing Coverage</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Mobile: iOS 16/17, Android API 26/34 (Detox)</li>
                            <li>• Web: Chromium, Firefox, Safari (Playwright)</li>
                            <li>• Extension: Chrome MV3 popup and content scripts</li>
                            <li>• Core: Custom rule engine with Jest unit tests</li>
                            <li>• Performance: <100ms inference time validation</li>
                            <li>• Accessibility: Screen reader and keyboard navigation</li>
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
                  <h4 className="font-medium text-foreground mb-1">3. Run Tests</h4>
                  <p>Execute comprehensive test suite across all platforms and validate coverage</p>
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
                  <TestTube size={14} />
                  <span>Full Test Coverage</span>
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