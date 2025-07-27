import { useState, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Lightbulb, ArrowCounterClockwise, Cpu, Cloud, Rocket, Lightning, Globe, FileText, Shield, Key, Download, Copy, CheckCircle, AlertTriangle } from "@phosphor-icons/react";
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
  const [setupStep, setSetupStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      title: "Android Signing Keys",
      description: "Generate release signing keys and upload key",
      platform: "Android"
    },
    {
      title: "CI/CD Configuration",
      description: "Configure automated build and deployment",
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="writing" className="flex items-center gap-2">
                  <Lightbulb size={14} />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="developer" className="flex items-center gap-2">
                  <Shield size={14} />
                  Developer
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
                                <p className="font-medium mb-2">Keystore Generation:</p>
                                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span># Generate Android Signing Key</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('keytool -genkey -v -keystore phono-release-key.keystore -alias phono-key-alias -keyalg RSA -keysize 2048 -validity 10000', 'Android Keystore Command')}>
                                      <Copy size={12} />
                                    </Button>
                                  </div>
                                  <div>keytool -genkey -v -keystore phono-release-key.keystore \</div>
                                  <div>  -alias phono-key-alias -keyalg RSA -keysize 2048 \</div>
                                  <div>  -validity 10000</div>
                                </div>
                              </div>
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  Backup your keystore file securely. Losing it means you cannot update your app.
                                </AlertDescription>
                              </Alert>
                            </div>
                          )}

                          {index === 5 && (
                            <div className="bg-muted/50 rounded p-3 text-sm">
                              <p className="font-medium mb-2">Environment Variables Template:</p>
                              <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span># Add to CI/CD secrets</span>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`APPLE_CERTIFICATE_P12_BASE64=\nAPPLE_CERTIFICATE_PASSWORD=\nANDROID_KEYSTORE_BASE64=\nANDROID_KEYSTORE_PASSWORD=\nANDROID_KEY_ALIAS=\nANDROID_KEY_PASSWORD=`, 'Environment Variables')}>
                                    <Copy size={12} />
                                  </Button>
                                </div>
                                <div>APPLE_CERTIFICATE_P12_BASE64=</div>
                                <div>APPLE_CERTIFICATE_PASSWORD=</div>
                                <div>ANDROID_KEYSTORE_BASE64=</div>
                                <div>ANDROID_KEYSTORE_PASSWORD=</div>
                                <div>ANDROID_KEY_ALIAS=</div>
                                <div>ANDROID_KEY_PASSWORD=</div>
                              </div>
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

export default App;