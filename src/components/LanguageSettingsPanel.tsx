import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check } from "@phosphor-icons/react";

export const LanguageSettingsPanel: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Language Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Select your preferred language for the interface and phonetic correction
          </p>

          {/* Language Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Interface Language</h3>
            <div className="grid gap-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setLanguage(language.code as any)}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    currentLanguage === language.code
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{language.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{language.name}</div>
                      <div className="text-xs text-muted-foreground">{language.native}</div>
                    </div>
                  </div>
                  {currentLanguage === language.code && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phonetic Correction Language */}
          <div className="space-y-3">
            <h3 className="font-medium">Phonetic Correction</h3>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Check size={16} className="text-green-600" />
                <span className="font-medium text-sm">
                  {languages.find(l => l.code === currentLanguage)?.name} Corrections Active
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                AI model will provide phonetic corrections in {languages.find(l => l.code === currentLanguage)?.name}
              </div>
            </div>
          </div>

          {/* Language Support Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Feature Support by Language</h3>
            <div className="space-y-2">
              {languages.map((language) => (
                <div key={language.code} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-green-600 text-xs">
                      Phonetic
                    </Badge>
                    {['en', 'es', 'fr', 'de'].includes(language.code) && (
                      <Badge variant="outline" className="text-blue-600 text-xs">
                        TTS
                      </Badge>
                    )}
                    {['en', 'es', 'fr'].includes(language.code) && (
                      <Badge variant="outline" className="text-purple-600 text-xs">
                        STT
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <h3 className="font-medium">Advanced Settings</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Download Offline Models
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Configure Regional Variants
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Reset Language Preferences
              </Button>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-3">
            <h3 className="font-medium">Usage Statistics</h3>
            <div className="p-3 border rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Corrections made:</span> 247
                </div>
                <div>
                  <span className="font-medium">Accuracy:</span> 94%
                </div>
                <div>
                  <span className="font-medium">Words processed:</span> 12,483
                </div>
                <div>
                  <span className="font-medium">Time saved:</span> ~2.5h
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};