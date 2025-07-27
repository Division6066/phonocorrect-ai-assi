import React, { createContext, useContext, useState, ReactNode } from 'react';

type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'he' | 'ar' | 'zh';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Mock translations
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'AI-powered phonetic spelling assistant for dyslexic and ADHD users',
    'app.desktop': 'Desktop',
    'app.shortcuts_help': 'Shortcuts: {{dictation}} for dictation, {{keyboard}} for keyboard, {{save}} to save',
    'tabs.writing': 'Writing',
    'tabs.hardware': 'Hardware',
    'tabs.ml_models': 'ML Models',
    'tabs.cloud_premium': 'Cloud & Premium',
    'tabs.deployment': 'Deployment',
    'writing.title': 'Writing Assistant',
    'writing.placeholder': 'Start typing here...',
    'writing.load_example': 'Load Example',
    'writing.words_count': '{{count}} words',
    'writing.suggestions_count': '{{count}} suggestion',
    'writing.suggestions_count_plural': '{{count}} suggestions',
    'writing.analyzing': 'Analyzing...',
    'writing.suggestions_title': 'Suggestions',
    'notifications.suggestion_applied': 'Applied: {{original}} → {{suggestion}}',
    'notifications.suggestion_rejected': 'Rejected suggestion for: {{original}}',
    'notifications.example_loaded': 'Example text loaded',
    'notifications.text_cleared': 'Text cleared',
    'notifications.no_text_to_save': 'No text to save',
    'notifications.document_saved': 'Document saved',
    'notifications.save_failed': 'Failed to save document',
    'notifications.document_loaded': 'Document loaded',
    'notifications.load_failed': 'Failed to load document',
    'notifications.speech_transcribed': 'Speech transcribed',
    'notifications.use_read_aloud': 'Use the read-aloud button in the text-to-speech panel',
    'help.title': 'How to Use',
    'help.steps.type.title': '1. Type or Dictate',
    'help.steps.type.description': 'Type your text or use speech-to-text to dictate',
    'help.steps.suggestions.title': '2. Review Suggestions',
    'help.steps.suggestions.description': 'AI will highlight potential corrections',
    'help.steps.learn.title': '3. Learn & Improve',
    'help.steps.learn.description': 'The system learns from your feedback',
    'patterns.title': 'Common Patterns',
    'patterns.examples.phone': 'phone',
    'patterns.examples.separate': 'separate',
    'patterns.examples.receive': 'receive',
    'patterns.examples.would_have': 'would have',
    'features.title': 'Coming Soon',
    'features.whisper_gemma': 'Whisper + Gemma AI',
    'features.cloud_sync': 'Cloud Sync',
    'features.mobile_extension': 'Mobile & Extensions',
    'features.explore': 'Explore Features'
  },
  es: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'Asistente de ortografía fonética con IA para usuarios disléxicos y con TDAH',
    'app.desktop': 'Escritorio',
    // Add more Spanish translations as needed
    'writing.title': 'Asistente de Escritura',
    'writing.placeholder': 'Comienza a escribir aquí...',
  },
  fr: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'Assistant d\'orthographe phonétique IA pour les utilisateurs dyslexiques et TDAH',
    'app.desktop': 'Bureau',
    // Add more French translations as needed
    'writing.title': 'Assistant d\'Écriture',
    'writing.placeholder': 'Commencez à taper ici...',
  },
  de: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'KI-gestützter phonetischer Rechtschreibassistent für Benutzer mit Dyslexie und ADHS',
    'app.desktop': 'Desktop',
    // Add more German translations as needed
    'writing.title': 'Schreibassistent',
    'writing.placeholder': 'Hier tippen beginnen...',
  },
  he: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'עוזר איות פונטי מבוסס בינה מלאכותית למשתמשים עם דיסלקציה ו-ADHD',
    'app.desktop': 'שולחן עבודה',
    // Add more Hebrew translations as needed
    'writing.title': 'עוזר כתיבה',
    'writing.placeholder': 'התחל לכתוב כאן...',
  },
  ar: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': 'مساعد الإملاء الصوتي المدعوم بالذكاء الاصطناعي للمستخدمين المصابين بعسر القراءة واضطراب فرط الحركة',
    'app.desktop': 'سطح المكتب',
    // Add more Arabic translations as needed
    'writing.title': 'مساعد الكتابة',
    'writing.placeholder': 'ابدأ الكتابة هنا...',
  },
  zh: {
    'app.title': 'PhonoCorrect AI',
    'app.subtitle': '为阅读障碍和多动症用户提供的AI语音拼写助手',
    'app.desktop': '桌面',
    // Add more Chinese translations as needed
    'writing.title': '写作助手',
    'writing.placeholder': '在这里开始输入...',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string, params?: Record<string, any>) => {
    const template = translations[currentLanguage]?.[key] || translations.en[key] || key;
    
    if (!params) return template;
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};