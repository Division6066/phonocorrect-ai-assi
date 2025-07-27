import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  Backspace, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Enter,
  Globe
} from "@phosphor-icons/react";

interface VirtualKeyboardProps {
  onInput: (text: string) => void;
  onSpecialKey: (key: string) => void;
  targetRef?: React.RefObject<HTMLTextAreaElement>;
}

// Keyboard layouts for different languages
const KEYBOARD_LAYOUTS = {
  'en-US': {
    name: 'English (US)',
    flag: '🇺🇸',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ],
    symbols: [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
    ]
  },
  'es-ES': {
    name: 'Spanish (Spain)',
    flag: '🇪🇸',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', "'", '¡'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '`', '+'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', '´'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
    ],
    symbols: [
      ['!', '"', '·', '$', '%', '&', '/', '(', ')', '=', '?', '¿'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '^', '*'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ', '¨'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':', '_']
    ]
  },
  'fr-FR': {
    name: 'French (France)',
    flag: '🇫🇷',
    rows: [
      ['&', 'é', '"', "'", '(', '-', 'è', '_', 'ç', 'à', ')', '='],
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '^', '$'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù'],
      ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!']
    ],
    symbols: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '°', '+'],
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '¨', '£'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', '%'],
      ['W', 'X', 'C', 'V', 'B', 'N', '?', '.', '/', '§']
    ]
  },
  'de-DE': {
    name: 'German (Germany)',
    flag: '🇩🇪',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', '´'],
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', '+'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
    ],
    symbols: [
      ['!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', '`'],
      ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', '*'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
      ['Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':', '_']
    ]
  },
  'ru-RU': {
    name: 'Russian (Russia)',
    flag: '🇷🇺',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']
    ],
    symbols: [
      ['!', '"', '№', ';', '%', ':', '?', '*', '(', ')', '_', '+'],
      ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
      ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
      ['Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', ',']
    ]
  },
  'ja-JP': {
    name: 'Japanese (Hiragana)',
    flag: '🇯🇵',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^'],
      ['た', 'て', 'い', 'す', 'か', 'ん', 'な', 'に', 'ら', 'せ', '゛', '゜'],
      ['ち', 'と', 'し', 'は', 'き', 'く', 'ま', 'の', 'り', 'れ'],
      ['つ', 'さ', 'そ', 'ひ', 'こ', 'み', 'も', 'ね', 'る', 'め']
    ],
    symbols: [
      ['！', '＂', '＃', '＄', '％', '＆', '／', '（', '）', '＝', '～', '｜'],
      ['タ', 'テ', 'イ', 'ス', 'カ', 'ン', 'ナ', 'ニ', 'ラ', 'セ', '゛', '゜'],
      ['チ', 'ト', 'シ', 'ハ', 'キ', 'ク', 'マ', 'ノ', 'リ', 'レ'],
      ['ツ', 'サ', 'ソ', 'ヒ', 'コ', 'ミ', 'モ', 'ネ', 'ル', 'メ']
    ]
  },
  'ar-SA': {
    name: 'Arabic (Saudi Arabia)',
    flag: '🇸🇦',
    rows: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
      ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
      ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
    ],
    symbols: [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
      ['َ', 'ً', 'ُ', 'ٌ', 'لإ', 'إ', '`', '÷', '×', '؛', '<', '>'],
      ['ِ', 'ٍ', ']', '[', 'لأ', 'أ', 'ـ', '،', '/', ':', '"'],
      ['~', 'ْ', '}', '{', 'لآ', 'آ', "'", ',', '.', '؟']
    ]
  }
};

const SPECIAL_KEYS = {
  SPACE: 'Space',
  BACKSPACE: 'Backspace',
  ENTER: 'Enter',
  SHIFT: 'Shift',
  CAPS: 'CapsLock',
  TAB: 'Tab',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown'
};

export function VirtualKeyboard({ onInput, onSpecialKey, targetRef }: VirtualKeyboardProps) {
  const [currentLayout, setCurrentLayout] = useState('en-US');
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isSymbolMode, setIsSymbolMode] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const keyboardRef = useRef<HTMLDivElement>(null);

  const getCurrentRows = useCallback(() => {
    const layout = KEYBOARD_LAYOUTS[currentLayout as keyof typeof KEYBOARD_LAYOUTS];
    return isSymbolMode ? layout.symbols : layout.rows;
  }, [currentLayout, isSymbolMode]);

  const handleKeyPress = useCallback((key: string) => {
    let processedKey = key;

    // Handle case transformation for letters
    if (key.length === 1 && key.match(/[a-zA-ZА-я\u0600-\u06FF\u3040-\u309F\u30A0-\u30FF]/)) {
      if (isUpperCase || capsLock) {
        processedKey = key.toUpperCase();
      } else {
        processedKey = key.toLowerCase();
      }
    }

    onInput(processedKey);

    // Reset uppercase if shift was used (not caps lock)
    if (isUpperCase && !capsLock) {
      setIsUpperCase(false);
    }

    // Focus the target input if provided
    if (targetRef?.current) {
      targetRef.current.focus();
    }
  }, [isUpperCase, capsLock, onInput, targetRef]);

  const handleSpecialKey = useCallback((specialKey: string) => {
    switch (specialKey) {
      case SPECIAL_KEYS.SPACE:
        onInput(' ');
        break;
      case SPECIAL_KEYS.SHIFT:
        setIsUpperCase(!isUpperCase);
        setIsSymbolMode(false);
        break;
      case SPECIAL_KEYS.CAPS:
        setCapsLock(!capsLock);
        setIsUpperCase(false);
        break;
      case SPECIAL_KEYS.TAB:
        onInput('\t');
        break;
      default:
        onSpecialKey(specialKey);
        break;
    }

    // Focus the target input if provided
    if (targetRef?.current) {
      targetRef.current.focus();
    }
  }, [isUpperCase, capsLock, onInput, onSpecialKey, targetRef]);

  const toggleSymbolMode = useCallback(() => {
    setIsSymbolMode(!isSymbolMode);
    setIsUpperCase(false);
  }, [isSymbolMode]);

  const KeyButton = ({ 
    children, 
    onClick, 
    className = "", 
    disabled = false,
    variant = "outline" as "outline" | "default" | "ghost"
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    variant?: "outline" | "default" | "ghost";
  }) => (
    <Button
      variant={variant}
      size="sm"
      className={`h-10 min-w-[2.5rem] text-sm font-medium ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  const rows = getCurrentRows();
  const currentLayoutInfo = KEYBOARD_LAYOUTS[currentLayout as keyof typeof KEYBOARD_LAYOUTS];

  if (!isVisible) {
    return (
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={() => setIsVisible(true)}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Keyboard size={16} />
            Show Virtual Keyboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={keyboardRef} className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Keyboard size={16} />
            Virtual Keyboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Hide
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <Select value={currentLayout} onValueChange={setCurrentLayout}>
            <SelectTrigger className="w-48">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{currentLayoutInfo.flag}</span>
                  <span>{currentLayoutInfo.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KEYBOARD_LAYOUTS).map(([code, layout]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span>{layout.flag}</span>
                    <span>{layout.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-1">
            {capsLock && <Badge className="text-xs">CAPS</Badge>}
            {isUpperCase && <Badge variant="outline" className="text-xs">SHIFT</Badge>}
            {isSymbolMode && <Badge variant="secondary" className="text-xs">SYM</Badge>}
          </div>
        </div>

        {/* Keyboard Rows */}
        <div className="space-y-2">
          {/* Number/Symbol Row */}
          <div className="flex gap-1 justify-center">
            {rows[0]?.map((key, index) => (
              <KeyButton key={index} onClick={() => handleKeyPress(key)}>
                {key}
              </KeyButton>
            ))}
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.BACKSPACE)}
              className="min-w-[4rem]"
            >
              <Backspace size={14} />
            </KeyButton>
          </div>

          {/* First Letter Row */}
          <div className="flex gap-1 justify-center">
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.TAB)}
              className="min-w-[3rem]"
              variant="ghost"
            >
              Tab
            </KeyButton>
            {rows[1]?.map((key, index) => (
              <KeyButton key={index} onClick={() => handleKeyPress(key)}>
                {isUpperCase || capsLock ? key.toUpperCase() : key}
              </KeyButton>
            ))}
          </div>

          {/* Second Letter Row */}
          <div className="flex gap-1 justify-center">
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.CAPS)}
              className={`min-w-[4rem] ${capsLock ? 'bg-primary text-primary-foreground' : ''}`}
              variant={capsLock ? "default" : "ghost"}
            >
              Caps
            </KeyButton>
            {rows[2]?.map((key, index) => (
              <KeyButton key={index} onClick={() => handleKeyPress(key)}>
                {isUpperCase || capsLock ? key.toUpperCase() : key}
              </KeyButton>
            ))}
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.ENTER)}
              className="min-w-[4rem]"
            >
              <Enter size={14} />
            </KeyButton>
          </div>

          {/* Third Letter Row */}
          <div className="flex gap-1 justify-center">
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.SHIFT)}
              className={`min-w-[5rem] ${isUpperCase ? 'bg-secondary' : ''}`}
              variant={isUpperCase ? "default" : "ghost"}
            >
              Shift
            </KeyButton>
            {rows[3]?.map((key, index) => (
              <KeyButton key={index} onClick={() => handleKeyPress(key)}>
                {isUpperCase || capsLock ? key.toUpperCase() : key}
              </KeyButton>
            ))}
            <KeyButton 
              onClick={toggleSymbolMode}
              className="min-w-[3rem]"
              variant={isSymbolMode ? "default" : "ghost"}
            >
              {isSymbolMode ? '123' : 'SYM'}
            </KeyButton>
          </div>

          {/* Space Bar Row */}
          <div className="flex gap-1 justify-center">
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.ARROW_LEFT)}
              variant="ghost"
            >
              <ArrowLeft size={14} />
            </KeyButton>
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.ARROW_RIGHT)}
              variant="ghost"
            >
              <ArrowRight size={14} />
            </KeyButton>
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.SPACE)}
              className="flex-1 min-w-[12rem]"
            >
              Space
            </KeyButton>
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.ARROW_UP)}
              variant="ghost"
            >
              <ArrowUp size={14} />
            </KeyButton>
            <KeyButton 
              onClick={() => handleSpecialKey(SPECIAL_KEYS.ARROW_DOWN)}
              variant="ghost"
            >
              <ArrowDown size={14} />
            </KeyButton>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Use language selector to switch keyboard layouts</p>
          <p>• Shift for single uppercase, Caps for continuous</p>
          <p>• SYM toggles between letters and symbols</p>
        </div>
      </CardContent>
    </Card>
  );
}