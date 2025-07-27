import { useKV } from '@/lib/spark-hooks';
import { useState, useCallback, useMemo } from 'react';
import { CustomRule, RuleValidationResult, RulePreview, CustomRulesExport, RuleConflictResolution } from '@/types/custom-rules';
import { generateId } from '@/utils/id-utils';
import { toast } from 'sonner';

// Storage keys
const CUSTOM_RULES_KEY = 'phonocorrect-custom-rules';
const RULES_SETTINGS_KEY = 'phonocorrect-rules-settings';

interface RulesSettings {
  conflictResolution: RuleConflictResolution;
  autoBackup: boolean;
  maxRules: number;
}

const DEFAULT_SETTINGS: RulesSettings = {
  conflictResolution: 'user-first',
  autoBackup: true,
  maxRules: 100
};

export function useCustomRules() {
  const [customRules, setCustomRules] = useKV<CustomRule[]>(CUSTOM_RULES_KEY, []);
  const [settings, setSettings] = useKV<RulesSettings>(RULES_SETTINGS_KEY, DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Get enabled rules sorted by priority (most used first)
  const enabledRules = useMemo(() => {
    return customRules
      .filter(rule => rule.enabled)
      .sort((a, b) => {
        // Sort by usage frequency
        const aScore = a.usage.timesApplied - (a.usage.timesRejected * 0.5);
        const bScore = b.usage.timesApplied - (b.usage.timesRejected * 0.5);
        return bScore - aScore;
      });
  }, [customRules]);

  // Validate a rule
  const validateRule = useCallback((rule: Partial<CustomRule>): RuleValidationResult => {
    const warnings: string[] = [];
    
    if (!rule.misspelling?.trim()) {
      return { isValid: false, error: 'Misspelling pattern is required' };
    }

    if (!rule.correction?.trim()) {
      return { isValid: false, error: 'Correction is required' };
    }

    // Validate regex if enabled
    if (rule.isRegex) {
      try {
        new RegExp(rule.misspelling, rule.caseSensitive ? 'g' : 'gi');
      } catch (error) {
        return { 
          isValid: false, 
          error: `Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }

      // Check for common regex gotchas
      if (rule.misspelling.includes('.*') && !rule.misspelling.includes('(')) {
        warnings.push('Using .* without capture groups may produce unexpected results');
      }
    }

    // Check for duplicate patterns
    const existing = customRules.find(r => 
      r.id !== rule.id && 
      r.misspelling.toLowerCase() === rule.misspelling?.toLowerCase() &&
      r.isRegex === rule.isRegex
    );
    
    if (existing) {
      warnings.push(`Similar rule already exists: "${existing.misspelling}" → "${existing.correction}"`);
    }

    // Check correction doesn't contain misspelling (infinite loop prevention)
    if (rule.correction?.toLowerCase().includes(rule.misspelling?.toLowerCase() || '')) {
      warnings.push('Correction contains the misspelling - this may cause infinite corrections');
    }

    return { isValid: true, warnings };
  }, [customRules]);

  // Preview rule application
  const previewRule = useCallback((rule: Partial<CustomRule>, testText: string): RulePreview[] => {
    if (!rule.misspelling || !rule.correction || !testText) {
      return [];
    }

    const previews: RulePreview[] = [];
    
    try {
      if (rule.isRegex) {
        const regex = new RegExp(rule.misspelling, rule.caseSensitive ? 'g' : 'gi');
        const corrected = testText.replace(regex, rule.correction);
        const matches = (testText.match(regex) || []).length;
        
        if (matches > 0) {
          previews.push({
            original: testText,
            corrected,
            matches
          });
        }
      } else {
        const flags = rule.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(escapeRegExp(rule.misspelling), flags);
        const corrected = testText.replace(regex, rule.correction);
        const matches = (testText.match(regex) || []).length;
        
        if (matches > 0) {
          previews.push({
            original: testText,
            corrected,
            matches
          });
        }
      }
    } catch (error) {
      // Return empty preview for invalid regex
    }

    return previews;
  }, []);

  // Create new rule
  const createRule = useCallback(async (ruleData: Omit<CustomRule, 'id' | 'createdAt' | 'updatedAt' | 'usage'>) => {
    if (customRules.length >= settings.maxRules) {
      throw new Error(`Maximum number of rules (${settings.maxRules}) reached`);
    }

    const validation = validateRule(ruleData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const newRule: CustomRule = {
      ...ruleData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usage: {
        timesApplied: 0,
        timesRejected: 0
      }
    };

    setCustomRules(current => [...current, newRule]);
    toast.success(`Rule created: "${newRule.misspelling}" → "${newRule.correction}"`);
    
    return newRule;
  }, [customRules.length, settings.maxRules, validateRule, setCustomRules]);

  // Update existing rule
  const updateRule = useCallback(async (id: string, updates: Partial<CustomRule>) => {
    const existing = customRules.find(r => r.id === id);
    if (!existing) {
      throw new Error('Rule not found');
    }

    const updatedRule = { ...existing, ...updates, updatedAt: Date.now() };
    const validation = validateRule(updatedRule);
    
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setCustomRules(current => 
      current.map(rule => rule.id === id ? updatedRule : rule)
    );

    toast.success('Rule updated successfully');
    return updatedRule;
  }, [customRules, validateRule, setCustomRules]);

  // Delete rule
  const deleteRule = useCallback(async (id: string) => {
    const existing = customRules.find(r => r.id === id);
    if (!existing) {
      throw new Error('Rule not found');
    }

    setCustomRules(current => current.filter(rule => rule.id !== id));
    toast.success(`Rule deleted: "${existing.misspelling}"`);
  }, [customRules, setCustomRules]);

  // Toggle rule enabled/disabled
  const toggleRule = useCallback(async (id: string) => {
    await updateRule(id, { 
      enabled: !customRules.find(r => r.id === id)?.enabled 
    });
  }, [customRules, updateRule]);

  // Record rule usage
  const recordRuleUsage = useCallback(async (id: string, accepted: boolean) => {
    const rule = customRules.find(r => r.id === id);
    if (!rule) return;

    const updates: Partial<CustomRule> = {
      usage: {
        ...rule.usage,
        timesApplied: accepted ? rule.usage.timesApplied + 1 : rule.usage.timesApplied,
        timesRejected: accepted ? rule.usage.timesRejected : rule.usage.timesRejected + 1,
        lastUsed: Date.now()
      }
    };

    setCustomRules(current =>
      current.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }, [customRules, setCustomRules]);

  // Apply custom rules to text
  const applyCustomRules = useCallback((text: string): { text: string; appliedRules: string[] } => {
    let result = text;
    const appliedRules: string[] = [];

    for (const rule of enabledRules) {
      try {
        const oldResult = result;
        
        if (rule.isRegex) {
          const regex = new RegExp(rule.misspelling, rule.caseSensitive ? 'g' : 'gi');
          result = result.replace(regex, rule.correction);
        } else {
          const flags = rule.caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(escapeRegExp(rule.misspelling), flags);
          result = result.replace(regex, rule.correction);
        }

        if (result !== oldResult) {
          appliedRules.push(rule.id);
        }
      } catch (error) {
        console.warn(`Failed to apply rule ${rule.id}:`, error);
      }
    }

    return { text: result, appliedRules };
  }, [enabledRules]);

  // Export rules
  const exportRules = useCallback((selectedRuleIds?: string[]): CustomRulesExport => {
    const rulesToExport = selectedRuleIds 
      ? customRules.filter(rule => selectedRuleIds.includes(rule.id))
      : customRules;

    return {
      version: '1.0.0',
      exportedAt: Date.now(),
      rules: rulesToExport,
      metadata: {
        totalRules: rulesToExport.length,
        enabledRules: rulesToExport.filter(r => r.enabled).length,
        platform: typeof window !== 'undefined' ? (
          window.navigator.userAgent.includes('electron') ? 'desktop' : 'web'
        ) : 'unknown'
      }
    };
  }, [customRules]);

  // Import rules
  const importRules = useCallback(async (exportData: CustomRulesExport, options: { 
    overwrite?: boolean;
    skipDuplicates?: boolean;
  } = {}) => {
    setIsLoading(true);
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      for (const rule of exportData.rules) {
        try {
          // Check for duplicates
          const existing = customRules.find(r => 
            r.misspelling === rule.misspelling && r.isRegex === rule.isRegex
          );

          if (existing) {
            if (options.overwrite) {
              await updateRule(existing.id, {
                ...rule,
                id: existing.id, // Keep existing ID
                createdAt: existing.createdAt, // Keep original creation date
                updatedAt: Date.now()
              });
              imported++;
            } else if (!options.skipDuplicates) {
              // Create with modified name
              await createRule({
                ...rule,
                misspelling: `${rule.misspelling} (imported)`,
                description: `${rule.description || ''} (imported copy)`.trim()
              });
              imported++;
            } else {
              skipped++;
            }
          } else {
            await createRule(rule);
            imported++;
          }
        } catch (error) {
          console.error('Error importing rule:', rule, error);
          errors++;
        }
      }

      toast.success(`Import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
    } finally {
      setIsLoading(false);
    }

    return { imported, skipped, errors };
  }, [customRules, updateRule, createRule]);

  // Clear all rules
  const clearAllRules = useCallback(async () => {
    setCustomRules([]);
    toast.success('All custom rules cleared');
  }, [setCustomRules]);

  return {
    // State
    customRules,
    enabledRules,
    settings,
    isLoading,

    // Rule management
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    recordRuleUsage,

    // Validation and preview
    validateRule,
    previewRule,

    // Rule application
    applyCustomRules,

    // Import/export
    exportRules,
    importRules,
    clearAllRules,

    // Settings
    updateSettings: setSettings,

    // Stats
    stats: {
      total: customRules.length,
      enabled: enabledRules.length,
      disabled: customRules.length - enabledRules.length,
      totalUsage: customRules.reduce((sum, rule) => sum + rule.usage.timesApplied, 0)
    }
  };
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}