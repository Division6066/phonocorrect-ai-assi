/**
 * Type definitions for custom phonetic rules system
 */

export interface CustomRule {
  id: string;
  misspelling: string;
  correction: string;
  isRegex: boolean;
  caseSensitive: boolean;
  enabled: boolean;
  description?: string;
  examples?: string[];
  createdAt: number;
  updatedAt: number;
  usage: {
    timesApplied: number;
    timesRejected: number;
    lastUsed?: number;
  };
}

export interface RuleValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface RulePreview {
  original: string;
  corrected: string;
  matches: number;
}

export interface CustomRulesExport {
  version: string;
  exportedAt: number;
  rules: CustomRule[];
  metadata: {
    totalRules: number;
    enabledRules: number;
    platform: string;
  };
}

export interface RulePriority {
  type: 'custom' | 'builtin';
  priority: number;
}

export type RuleConflictResolution = 'user-first' | 'builtin-first' | 'ask-user';