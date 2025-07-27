import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useKV } from '@github/spark/hooks';
import { SupportedLanguage, supportedLanguages } from '../i18n';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: typeof supportedLanguages;
  t: (key: string, options?: any) => string;
  i18n: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { t, i18n } = useTranslation();
  const [savedLanguage, setSavedLanguage] = useKV<SupportedLanguage>('user-language', 'en');

  const setLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setSavedLanguage(lang);
  };

  // Initialize language from saved preference or browser detection
  React.useEffect(() => {
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [savedLanguage, i18n]);

  const value: LanguageContextType = {
    currentLanguage: (i18n.language || 'en') as SupportedLanguage,
    setLanguage,
    availableLanguages: supportedLanguages,
    t,
    i18n
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}