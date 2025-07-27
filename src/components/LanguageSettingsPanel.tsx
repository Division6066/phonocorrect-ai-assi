import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Settings, Check } from "@phosphor-icons/react";

export function LanguageSettingsPanel() {
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe size={20} />
          {t('settings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t('settings.language')}</h4>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-muted-foreground">({lang.name})</span>
                    {lang.code === currentLanguage && (
                      <Check size={14} className="text-primary" />
                    )}\n                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Language Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Language Features</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Speech Recognition</span>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Text-to-Speech</span>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  Available
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Phonetic Correction</span>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ML Models</span>
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                  {currentLanguage === 'en' ? 'Full' : 'Basic'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Language Examples */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Common Patterns</h4>
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="space-y-1">
              {currentLanguage === 'en' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">fone</span>
                    <span>→ phone</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">seperate</span>
                    <span>→ separate</span>
                  </div>
                </>
              )}
              {currentLanguage === 'es' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">téléfono</span>
                    <span>→ teléfono</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">resivir</span>
                    <span>→ recibir</span>
                  </div>
                </>
              )}
              {currentLanguage === 'fr' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">téléfone</span>
                    <span>→ téléphone</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">resevoir</span>
                    <span>→ recevoir</span>
                  </div>
                </>
              )}
              {/* Add patterns for other languages */}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Settings size={14} className="mr-1" />
            {t('settings.voice_settings')}
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Settings size={14} className="mr-1" />
            {t('settings.ml_settings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}