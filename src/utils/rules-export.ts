/**
 * Utility functions for importing and exporting custom rules
 */

import { CustomRulesExport, CustomRule } from '@/types/custom-rules';

export function downloadRulesAsJson(rules: CustomRule[], filename?: string) {
  const exportData: CustomRulesExport = {
    version: '1.0.0',
    exportedAt: Date.now(),
    rules,
    metadata: {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      platform: getPlatform()
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `phonocorrect-rules-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyRulesToClipboard(rules: CustomRule[]): Promise<void> {
  const exportData: CustomRulesExport = {
    version: '1.0.0',
    exportedAt: Date.now(),
    rules,
    metadata: {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      platform: getPlatform()
    }
  };

  return navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
}

export async function parseRulesFromJson(jsonString: string): Promise<CustomRulesExport> {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the structure
    if (!data.version || !data.rules || !Array.isArray(data.rules)) {
      throw new Error('Invalid rules file format');
    }

    // Validate each rule
    data.rules.forEach((rule: any, index: number) => {
      if (!rule.misspelling || !rule.correction) {
        throw new Error(`Rule ${index + 1} is missing required fields`);
      }
    });

    return data as CustomRulesExport;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

export async function importRulesFromFile(file: File): Promise<CustomRulesExport> {
  const text = await file.text();
  return parseRulesFromJson(text);
}

export function validateRulesExport(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.version) {
    errors.push('Missing version field');
  }

  if (!data.rules || !Array.isArray(data.rules)) {
    errors.push('Missing or invalid rules array');
  } else {
    data.rules.forEach((rule: any, index: number) => {
      if (!rule.misspelling) {
        errors.push(`Rule ${index + 1}: Missing misspelling field`);
      }
      if (!rule.correction) {
        errors.push(`Rule ${index + 1}: Missing correction field`);
      }
      if (typeof rule.enabled !== 'boolean') {
        errors.push(`Rule ${index + 1}: Invalid enabled field`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function generateShareableRulesLink(rules: CustomRule[]): string {
  const exportData: CustomRulesExport = {
    version: '1.0.0',
    exportedAt: Date.now(),
    rules,
    metadata: {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      platform: getPlatform()
    }
  };

  // Compress and encode the data for URL sharing
  const compressed = btoa(JSON.stringify(exportData));
  const baseUrl = window.location.origin;
  return `${baseUrl}/import-rules?data=${compressed}`;
}

export function parseShareableRulesLink(url: string): CustomRulesExport | null {
  try {
    const urlObj = new URL(url);
    const data = urlObj.searchParams.get('data');
    if (!data) return null;

    const decompressed = atob(data);
    return JSON.parse(decompressed) as CustomRulesExport;
  } catch (error) {
    return null;
  }
}

function getPlatform(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  // Detect platform
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('electron')) return 'desktop';
  if (userAgent.includes('mobile')) return 'mobile';
  return 'web';
}

// Example rules for getting started
export const EXAMPLE_RULES: CustomRule[] = [
  {
    id: 'example-1',
    misspelling: 'teh',
    correction: 'the',
    isRegex: false,
    caseSensitive: false,
    enabled: true,
    description: 'Common typing mistake: teh → the',
    examples: ['I saw teh cat', 'teh quick brown fox'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usage: { timesApplied: 0, timesRejected: 0 }
  },
  {
    id: 'example-2',
    misspelling: 'colou?r',
    correction: 'color',
    isRegex: true,
    caseSensitive: false,
    enabled: true,
    description: 'British to American spelling: colour → color',
    examples: ['The colour red', 'What color is it?'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usage: { timesApplied: 0, timesRejected: 0 }
  },
  {
    id: 'example-3',
    misspelling: 'acheive',
    correction: 'achieve',
    isRegex: false,
    caseSensitive: false,
    enabled: true,
    description: 'Common phonetic misspelling: acheive → achieve',
    examples: ['I want to acheive my goals', 'acheive greatness'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usage: { timesApplied: 0, timesRejected: 0 }
  }
];