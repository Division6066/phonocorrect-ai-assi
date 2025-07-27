/**
 * Custom Rule Engine Unit Tests
 * Tests the core phonetic correction logic and custom rule handling
 */

interface PhoneticRule {
  from: string;
  to: string;
  pattern: string;
  priority?: number;
  language?: string;
  isCustom?: boolean;
}

interface CorrectionSuggestion {
  original: string;
  suggestion: string;
  confidence: number;
  rule: PhoneticRule;
  startIndex: number;
  endIndex: number;
}

// Mock implementation of the rule engine for testing
class PhoneticRuleEngine {
  private builtinRules: PhoneticRule[] = [
    { from: 'fone', to: 'phone', pattern: 'ph->f', priority: 1 },
    { from: 'seperate', to: 'separate', pattern: 'ar->er', priority: 1 },
    { from: 'recieve', to: 'receive', pattern: 'ie->ei', priority: 1 },
    { from: 'would of', to: 'would have', pattern: 'of->have', priority: 1 },
    { from: 'definately', to: 'definitely', pattern: 'ate->ite', priority: 1 },
  ];

  private customRules: PhoneticRule[] = [];

  addCustomRule(rule: PhoneticRule): void {
    this.customRules.push({ ...rule, isCustom: true, priority: rule.priority || 2 });
  }

  removeCustomRule(from: string): boolean {
    const initialLength = this.customRules.length;
    this.customRules = this.customRules.filter(rule => rule.from !== from);
    return this.customRules.length < initialLength;
  }

  getAllRules(language?: string): PhoneticRule[] {
    const allRules = [...this.customRules, ...this.builtinRules];
    if (language) {
      return allRules.filter(rule => !rule.language || rule.language === language);
    }
    return allRules.sort((a, b) => (b.priority || 1) - (a.priority || 1));
  }

  correctText(text: string, language?: string): CorrectionSuggestion[] {
    const suggestions: CorrectionSuggestion[] = [];
    const rules = this.getAllRules(language);
    
    for (const rule of rules) {
      const regex = new RegExp(`\\b${this.escapeRegex(rule.from)}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Check if this position is already covered by a higher priority rule
        const isOverlapping = suggestions.some(s => 
          (match!.index >= s.startIndex && match!.index < s.endIndex) ||
          (match!.index + match![0].length > s.startIndex && match!.index + match![0].length <= s.endIndex)
        );
        
        if (!isOverlapping) {
          suggestions.push({
            original: match[0],
            suggestion: rule.to,
            confidence: this.calculateConfidence(rule, match[0]),
            rule,
            startIndex: match.index,
            endIndex: match.index + match[0].length
          });
        }
      }
    }
    
    return suggestions.sort((a, b) => a.startIndex - b.startIndex);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private calculateConfidence(rule: PhoneticRule, match: string): number {
    // Higher confidence for exact matches and custom rules
    let confidence = 0.8;
    
    if (rule.isCustom) confidence += 0.1;
    if (match.toLowerCase() === rule.from.toLowerCase()) confidence += 0.05;
    if (rule.pattern.includes('->')) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  validateRule(rule: Partial<PhoneticRule>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!rule.from?.trim()) {
      errors.push('Source text cannot be empty');
    }
    
    if (!rule.to?.trim()) {
      errors.push('Correction text cannot be empty');
    }
    
    if (rule.from === rule.to) {
      errors.push('Source and correction cannot be the same');
    }
    
    // Test if it's a valid regex pattern
    if (rule.from) {
      try {
        new RegExp(rule.from);
      } catch (e) {
        errors.push('Invalid regex pattern in source text');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Test Suite
describe('PhoneticRuleEngine', () => {
  let engine: PhoneticRuleEngine;

  beforeEach(() => {
    engine = new PhoneticRuleEngine();
  });

  describe('Basic Correction Functionality', () => {
    test('should correct "fone" to "phone"', () => {
      const suggestions = engine.correctText('I got your fone call');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].original).toBe('fone');
      expect(suggestions[0].suggestion).toBe('phone');
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
    });

    test('should handle multiple corrections in one text', () => {
      const text = 'I recieve your fone call about the seperate meeting';
      const suggestions = engine.correctText(text);
      
      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].original).toBe('recieve');
      expect(suggestions[1].original).toBe('fone');
      expect(suggestions[2].original).toBe('seperate');
    });

    test('should preserve word boundaries', () => {
      const suggestions = engine.correctText('telephone and microphone');
      
      // Should not suggest corrections for 'fone' within other words
      expect(suggestions).toHaveLength(0);
    });

    test('should be case insensitive', () => {
      const suggestions = engine.correctText('FONE and Fone and fone');
      
      expect(suggestions).toHaveLength(3);
      suggestions.forEach(s => {
        expect(s.suggestion).toBe('phone');
      });
    });
  });

  describe('Custom Rules', () => {
    test('should add and apply custom rules', () => {
      engine.addCustomRule({
        from: 'teh',
        to: 'the',
        pattern: 'common typo',
        priority: 2
      });

      const suggestions = engine.correctText('teh quick brown fox');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].original).toBe('teh');
      expect(suggestions[0].suggestion).toBe('the');
      expect(suggestions[0].rule.isCustom).toBe(true);
    });

    test('should prioritize custom rules over builtin rules', () => {
      // Add a custom rule that conflicts with builtin
      engine.addCustomRule({
        from: 'fone',
        to: 'telephone', // Different correction
        pattern: 'custom override',
        priority: 2
      });

      const suggestions = engine.correctText('my fone number');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestion).toBe('telephone');
      expect(suggestions[0].rule.isCustom).toBe(true);
    });

    test('should remove custom rules', () => {
      engine.addCustomRule({
        from: 'teh',
        to: 'the',
        pattern: 'test rule'
      });

      expect(engine.correctText('teh test')).toHaveLength(1);
      
      const removed = engine.removeCustomRule('teh');
      expect(removed).toBe(true);
      expect(engine.correctText('teh test')).toHaveLength(0);
    });

    test('should return false when removing non-existent rule', () => {
      const removed = engine.removeCustomRule('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('Rule Validation', () => {
    test('should validate correct rules', () => {
      const validation = engine.validateRule({
        from: 'teh',
        to: 'the',
        pattern: 'typo'
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject empty source text', () => {
      const validation = engine.validateRule({
        from: '',
        to: 'the',
        pattern: 'test'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Source text cannot be empty');
    });

    test('should reject empty correction text', () => {
      const validation = engine.validateRule({
        from: 'teh',
        to: '',
        pattern: 'test'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Correction text cannot be empty');
    });

    test('should reject identical source and correction', () => {
      const validation = engine.validateRule({
        from: 'test',
        to: 'test',
        pattern: 'same'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Source and correction cannot be the same');
    });

    test('should reject invalid regex patterns', () => {
      const validation = engine.validateRule({
        from: '[invalid regex',
        to: 'valid',
        pattern: 'regex test'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid regex pattern in source text');
    });
  });

  describe('Language Support', () => {
    test('should filter rules by language', () => {
      engine.addCustomRule({
        from: 'hola',
        to: 'hello',
        pattern: 'spanish',
        language: 'es'
      });

      // Should not appear in English context
      const englishSuggestions = engine.correctText('hola world', 'en');
      expect(englishSuggestions).toHaveLength(0);

      // Should appear in Spanish context
      const spanishSuggestions = engine.correctText('hola world', 'es');
      expect(spanishSuggestions).toHaveLength(1);
    });

    test('should include language-neutral rules in all contexts', () => {
      // Built-in rules should work in any language
      const suggestions = engine.correctText('I got your fone call', 'es');
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestion).toBe('phone');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty text', () => {
      const suggestions = engine.correctText('');
      expect(suggestions).toHaveLength(0);
    });

    test('should handle text with no corrections needed', () => {
      const suggestions = engine.correctText('This text is perfect.');
      expect(suggestions).toHaveLength(0);
    });

    test('should handle large text efficiently', () => {
      const largeText = Array(1000).fill('fone').join(' ');
      
      const startTime = Date.now();
      const suggestions = engine.correctText(largeText);
      const endTime = Date.now();
      
      expect(suggestions).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle overlapping matches correctly', () => {
      // This shouldn't happen with word boundaries, but test the logic
      engine.addCustomRule({
        from: 'fon',
        to: 'font',
        pattern: 'test overlap',
        priority: 3
      });

      const suggestions = engine.correctText('fone'); // 'fon' is contained in 'fone'
      
      // Should only get the higher priority match
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].rule.priority).toBe(3);
    });

    test('should calculate confidence scores correctly', () => {
      const suggestions = engine.correctText('fone');
      
      expect(suggestions[0].confidence).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Regex Pattern Support', () => {
    test('should handle basic phonetic patterns', () => {
      // Test the pattern matching logic
      const suggestions = engine.correctText('I definately agree');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].rule.pattern).toBe('ate->ite');
    });

    test('should handle multi-word patterns', () => {
      const suggestions = engine.correctText('I would of known');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].original).toBe('would of');
      expect(suggestions[0].suggestion).toBe('would have');
    });
  });
});