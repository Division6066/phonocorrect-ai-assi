export interface PhoneticPattern {
  pattern: RegExp;
  replacement: string;
  description: string;
  confidence: number;
}

export interface Suggestion {
  original: string;
  suggestion: string;
  confidence: number;
  pattern: string;
  startIndex: number;
  endIndex: number;
}

export interface UserPreference {
  pattern: string;
  accepted: number;
  rejected: number;
}

export const PHONETIC_PATTERNS: PhoneticPattern[] = [
  {
    pattern: /\bfone\b/gi,
    replacement: "phone",
    description: "Silent 'ph' sound",
    confidence: 0.95
  },
  {
    pattern: /\bfoto\b/gi,
    replacement: "photo",
    description: "Silent 'ph' sound",
    confidence: 0.9
  },
  {
    pattern: /\bfisics\b/gi,
    replacement: "physics",
    description: "Silent 'ph' and 'y' sound",
    confidence: 0.85
  },
  {
    pattern: /\bnife\b/gi,
    replacement: "knife",
    description: "Silent 'kn' sound",
    confidence: 0.9
  },
  {
    pattern: /\bnee\b/gi,
    replacement: "knee",
    description: "Silent 'kn' sound",
    confidence: 0.8
  },
  {
    pattern: /\brite\b/gi,
    replacement: "write",
    description: "Silent 'w' sound",
    confidence: 0.85
  },
  {
    pattern: /\brecieve\b/gi,
    replacement: "receive",
    description: "'i' before 'e' except after 'c'",
    confidence: 0.95
  },
  {
    pattern: /\bbelieve\b/gi,
    replacement: "believe",
    description: "'i' before 'e' rule",
    confidence: 0.9
  },
  {
    pattern: /\bseperate\b/gi,
    replacement: "separate",
    description: "Common vowel confusion",
    confidence: 0.9
  },
  {
    pattern: /\bdefinately\b/gi,
    replacement: "definitely",
    description: "Common spelling error",
    confidence: 0.95
  },
  {
    pattern: /\bthere\s+going\b/gi,
    replacement: "they're going",
    description: "Contraction confusion",
    confidence: 0.8
  },
  {
    pattern: /\byour\s+going\b/gi,
    replacement: "you're going",
    description: "Contraction confusion",
    confidence: 0.8
  },
  {
    pattern: /\bits\s+going\b/gi,
    replacement: "it's going",
    description: "Contraction confusion",
    confidence: 0.7
  },
  {
    pattern: /\bwould\s+of\b/gi,
    replacement: "would have",
    description: "Modal verb confusion",
    confidence: 0.9
  },
  {
    pattern: /\bshould\s+of\b/gi,
    replacement: "should have",
    description: "Modal verb confusion",
    confidence: 0.9
  },
  {
    pattern: /\bcould\s+of\b/gi,
    replacement: "could have",
    description: "Modal verb confusion",
    confidence: 0.9
  },
  {
    pattern: /\bthru\b/gi,
    replacement: "through",
    description: "Phonetic spelling",
    confidence: 0.85
  },
  {
    pattern: /\bu\b/gi,
    replacement: "you",
    description: "Text speak conversion",
    confidence: 0.7
  },
  {
    pattern: /\br\b/gi,
    replacement: "are",
    description: "Text speak conversion",
    confidence: 0.6
  }
];

export class PhoneticEngine {
  private userPreferences: Map<string, UserPreference> = new Map();

  constructor(savedPreferences?: UserPreference[]) {
    if (savedPreferences) {
      savedPreferences.forEach(pref => {
        this.userPreferences.set(pref.pattern, pref);
      });
    }
  }

  analyzText(text: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    for (const pattern of PHONETIC_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      
      while ((match = regex.exec(text)) !== null) {
        const original = match[0];
        const suggestion = pattern.replacement;
        
        // Apply user preference weighting
        const userPref = this.userPreferences.get(pattern.description);
        let adjustedConfidence = pattern.confidence;
        
        if (userPref) {
          const totalInteractions = userPref.accepted + userPref.rejected;
          if (totalInteractions > 0) {
            const acceptanceRate = userPref.accepted / totalInteractions;
            adjustedConfidence = pattern.confidence * (0.5 + acceptanceRate * 0.5);
          }
        }
        
        // Only suggest if different from original and confidence is reasonable
        if (original.toLowerCase() !== suggestion.toLowerCase() && adjustedConfidence > 0.3) {
          suggestions.push({
            original,
            suggestion,
            confidence: adjustedConfidence,
            pattern: pattern.description,
            startIndex: match.index,
            endIndex: match.index + original.length
          });
        }
        
        // Prevent infinite loops
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    }
    
    // Sort by confidence (highest first)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  recordFeedback(patternDescription: string, accepted: boolean): void {
    const existing = this.userPreferences.get(patternDescription) || {
      pattern: patternDescription,
      accepted: 0,
      rejected: 0
    };
    
    if (accepted) {
      existing.accepted++;
    } else {
      existing.rejected++;
    }
    
    this.userPreferences.set(patternDescription, existing);
  }

  getUserPreferences(): UserPreference[] {
    return Array.from(this.userPreferences.values());
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-amber-600";
    return "text-red-600";
  }

  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return "High confidence";
    if (confidence >= 0.6) return "Medium confidence";
    return "Low confidence";
  }
}