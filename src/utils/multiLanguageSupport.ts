import { SupportedLanguage } from '../i18n';

// Language-specific phonetic patterns and rules
export const phoneticPatterns: Record<SupportedLanguage, { pattern: RegExp; correction: string; confidence: number }[]> = {
  en: [
    { pattern: /\bfone\b/gi, correction: 'phone', confidence: 0.95 },
    { pattern: /\bseperate\b/gi, correction: 'separate', confidence: 0.9 },
    { pattern: /\brecieve\b/gi, correction: 'receive', confidence: 0.9 },
    { pattern: /\bwould of\b/gi, correction: 'would have', confidence: 0.85 },
    { pattern: /\bdefinately\b/gi, correction: 'definitely', confidence: 0.9 },
    { pattern: /\bthru\b/gi, correction: 'through', confidence: 0.8 },
    { pattern: /\bno\b(?=\s+(earlier|more|less|way))/gi, correction: 'know', confidence: 0.7 },
    { pattern: /\bfisics\b/gi, correction: 'physics', confidence: 0.95 },
  ],
  es: [
    { pattern: /\bteléfono\b/gi, correction: 'teléfono', confidence: 0.95 },
    { pattern: /\bseparar\b/gi, correction: 'separar', confidence: 0.9 },
    { pattern: /\bresivir\b/gi, correction: 'recibir', confidence: 0.9 },
    { pattern: /\baser\b/gi, correction: 'hacer', confidence: 0.8 },
    { pattern: /\bdefinidamente\b/gi, correction: 'definitivamente', confidence: 0.9 },
  ],
  fr: [
    { pattern: /\btéléfone\b/gi, correction: 'téléphone', confidence: 0.95 },
    { pattern: /\bséparer\b/gi, correction: 'séparer', confidence: 0.9 },
    { pattern: /\bresevoir\b/gi, correction: 'recevoir', confidence: 0.9 },
    { pattern: /\bdéfinitivement\b/gi, correction: 'définitivement', confidence: 0.9 },
  ],
  de: [
    { pattern: /\bTelefon\b/gi, correction: 'Telefon', confidence: 0.95 },
    { pattern: /\btrennen\b/gi, correction: 'trennen', confidence: 0.9 },
    { pattern: /\berhalten\b/gi, correction: 'erhalten', confidence: 0.9 },
    { pattern: /\bdefinitiv\b/gi, correction: 'definitiv', confidence: 0.9 },
  ],
  he: [
    { pattern: /\bטלפון\b/gi, correction: 'טלפון', confidence: 0.95 },
    { pattern: /\bנפרד\b/gi, correction: 'נפרד', confidence: 0.9 },
    { pattern: /\bלקבל\b/gi, correction: 'לקבל', confidence: 0.9 },
  ],
  ar: [
    { pattern: /\bهاتف\b/gi, correction: 'هاتف', confidence: 0.95 },
    { pattern: /\bمنفصل\b/gi, correction: 'منفصل', confidence: 0.9 },
    { pattern: /\bيستقبل\b/gi, correction: 'يستقبل', confidence: 0.9 },
  ],
  zh: [
    { pattern: /\b电话\b/gi, correction: '电话', confidence: 0.95 },
    { pattern: /\b分离\b/gi, correction: '分离', confidence: 0.9 },
    { pattern: /\b接收\b/gi, correction: '接收', confidence: 0.9 },
  ],
};

// Whisper model configurations for each language
export const whisperModels: Record<SupportedLanguage, {
  tiny: string;
  small: string;
  medium?: string;
  large?: string;
}> = {
  en: {
    tiny: 'whisper-tiny-en.ggml',
    small: 'whisper-small-en.ggml',
    medium: 'whisper-medium-en.ggml',
    large: 'whisper-large-en.ggml',
  },
  es: {
    tiny: 'whisper-tiny-es.ggml',
    small: 'whisper-small-es.ggml',
    medium: 'whisper-medium-es.ggml',
  },
  fr: {
    tiny: 'whisper-tiny-fr.ggml',
    small: 'whisper-small-fr.ggml',
    medium: 'whisper-medium-fr.ggml',
  },
  de: {
    tiny: 'whisper-tiny-de.ggml',
    small: 'whisper-small-de.ggml',
    medium: 'whisper-medium-de.ggml',
  },
  he: {
    tiny: 'whisper-tiny-he.ggml',
    small: 'whisper-small-he.ggml',
  },
  ar: {
    tiny: 'whisper-tiny-ar.ggml',
    small: 'whisper-small-ar.ggml',
  },
  zh: {
    tiny: 'whisper-tiny-zh.ggml',
    small: 'whisper-small-zh.ggml',
    medium: 'whisper-medium-zh.ggml',
  },
};

// Coqui TTS voice configurations
export const coquiVoices: Record<SupportedLanguage, {
  male: string[];
  female: string[];
  default: string;
}> = {
  en: {
    male: ['coqui-en-male-1', 'coqui-en-male-2'],
    female: ['coqui-en-female-1', 'coqui-en-female-2'],
    default: 'coqui-en-female-1',
  },
  es: {
    male: ['coqui-es-male-1'],
    female: ['coqui-es-female-1'],
    default: 'coqui-es-female-1',
  },
  fr: {
    male: ['coqui-fr-male-1'],
    female: ['coqui-fr-female-1'],
    default: 'coqui-fr-female-1',
  },
  de: {
    male: ['coqui-de-male-1'],
    female: ['coqui-de-female-1'],
    default: 'coqui-de-female-1',
  },
  he: {
    male: ['coqui-he-male-1'],
    female: ['coqui-he-female-1'],
    default: 'coqui-he-female-1',
  },
  ar: {
    male: ['coqui-ar-male-1'],
    female: ['coqui-ar-female-1'],
    default: 'coqui-ar-female-1',
  },
  zh: {
    male: ['coqui-zh-male-1'],
    female: ['coqui-zh-female-1'],
    default: 'coqui-zh-female-1',
  },
};

// Gemma vocabulary extensions for different languages
export const gemmaVocabularies: Record<SupportedLanguage, {
  contextPrompt: string;
  vocabularyHints: string[];
}> = {
  en: {
    contextPrompt: 'Correct phonetic spelling errors in English text. Focus on common misspellings that sound like the intended word.',
    vocabularyHints: ['phone', 'separate', 'receive', 'definitely', 'through', 'physics'],
  },
  es: {
    contextPrompt: 'Corrige errores de ortografía fonética en texto español. Enfócate en errores comunes que suenan como la palabra deseada.',
    vocabularyHints: ['teléfono', 'separar', 'recibir', 'definitivamente', 'hacer'],
  },
  fr: {
    contextPrompt: 'Corrigez les erreurs d\'orthographe phonétique dans le texte français. Concentrez-vous sur les erreurs communes qui ressemblent au mot voulu.',
    vocabularyHints: ['téléphone', 'séparer', 'recevoir', 'définitivement'],
  },
  de: {
    contextPrompt: 'Korrigiere phonetische Rechtschreibfehler im deutschen Text. Konzentriere dich auf häufige Fehler, die wie das beabsichtigte Wort klingen.',
    vocabularyHints: ['Telefon', 'trennen', 'erhalten', 'definitiv'],
  },
  he: {
    contextPrompt: 'תקן שגיאות איות פונטיות בטקסט עברי. התמקד בשגיאות נפוצות שנשמעות כמו המילה המיועדת.',
    vocabularyHints: ['טלפון', 'נפרד', 'לקבל'],
  },
  ar: {
    contextPrompt: 'صحح أخطاء الإملاء الصوتية في النص العربي. ركز على الأخطاء الشائعة التي تبدو مثل الكلمة المقصودة.',
    vocabularyHints: ['هاتف', 'منفصل', 'يستقبل'],
  },
  zh: {
    contextPrompt: '纠正中文文本中的拼音拼写错误。专注于听起来像预期单词的常见拼写错误。',
    vocabularyHints: ['电话', '分离', '接收'],
  },
};