# Custom Phonetic Rules System

## Overview

The custom phonetic rules system allows users to create, manage, and apply their own correction patterns in PhonoCorrect AI. This feature provides personalized spelling assistance that learns from user preferences and adapts to specific writing needs.

## Features

### Rule Management
- **Create Custom Rules**: Define misspelling patterns and their corrections
- **Regex Support**: Use regular expressions for advanced pattern matching
- **Rule Validation**: Real-time validation with helpful error messages
- **Preview & Testing**: Test rules against sample text before saving
- **Enable/Disable**: Toggle rules on/off without deleting them

### Rule Application Priority
1. **Custom Rules** (highest priority) - User-defined patterns are applied first
2. **Built-in Rules** (lower priority) - System patterns fill gaps not covered by custom rules

### Import/Export
- **JSON Export**: Download rules as structured JSON files
- **Clipboard Copy**: Quick sharing via clipboard
- **Import from File**: Load rules from JSON files
- **Example Rules**: Pre-built examples to get started

### Rule Statistics
- Track usage patterns (applied/rejected counts)
- Performance metrics and last usage timestamps
- Rule effectiveness analysis

## Technical Implementation

### Data Structure

```typescript
interface CustomRule {
  id: string;
  misspelling: string;      // Pattern to match
  correction: string;       // Replacement text
  isRegex: boolean;        // Whether to treat as regex
  caseSensitive: boolean;  // Case sensitivity
  enabled: boolean;        // Active state
  description?: string;    // User description
  examples?: string[];     // Example sentences
  createdAt: number;       // Creation timestamp
  updatedAt: number;       // Last modified
  usage: {
    timesApplied: number;  // Success count
    timesRejected: number; // Rejection count
    lastUsed?: number;     // Last usage timestamp
  };
}
```

### Storage
- **Local Storage**: SQLite-compatible structure using KV store
- **Cloud Sync**: Firebase Firestore integration for premium users
- **Offline-First**: Works completely offline with optional sync

### Rule Engine Integration

The `usePhonoEngine` hook now integrates custom rules:

```typescript
// 1. Apply custom rules first (highest priority)
const { text: customCorrectedText, appliedRules } = applyCustomRules(text);

// 2. Apply built-in patterns to remaining text
// Built-in rules only process text not already corrected by custom rules
```

## User Interface

### Custom Rules Panel
- **Rule List**: Display all rules with status indicators
- **Search & Filter**: Find rules by pattern, type, or status
- **Bulk Operations**: Export, import, and manage multiple rules
- **Quick Actions**: Enable/disable, edit, delete from list view

### Rule Editor
- **Tabbed Interface**: Basic settings, preview/test, advanced options
- **Real-time Validation**: Immediate feedback on rule validity
- **Pattern Preview**: Test patterns against sample text
- **Regex Helper**: Tips and examples for regex patterns

### Statistics Dashboard
- **Usage Metrics**: Rule application and rejection rates
- **Performance Tracking**: Most effective rules
- **Learning Insights**: Pattern recognition improvements

## File Formats

### Export Format
```json
{
  "version": "1.0.0",
  "exportedAt": 1703980800000,
  "rules": [
    {
      "id": "rule-123",
      "misspelling": "teh",
      "correction": "the",
      "isRegex": false,
      "caseSensitive": false,
      "enabled": true,
      "description": "Common typing mistake",
      "examples": ["I saw teh cat"],
      "createdAt": 1703980800000,
      "updatedAt": 1703980800000,
      "usage": {
        "timesApplied": 5,
        "timesRejected": 0
      }
    }
  ],
  "metadata": {
    "totalRules": 1,
    "enabledRules": 1,
    "platform": "web"
  }
}
```

## API Reference

### useCustomRules Hook

```typescript
const {
  // State
  customRules,        // All custom rules
  enabledRules,       // Only enabled rules
  stats,              // Usage statistics
  
  // Rule Management
  createRule,         // Create new rule
  updateRule,         // Update existing rule
  deleteRule,         // Remove rule
  toggleRule,         // Enable/disable rule
  
  // Validation & Preview
  validateRule,       // Check rule validity
  previewRule,        // Test rule against text
  
  // Application
  applyCustomRules,   // Apply rules to text
  recordRuleUsage,    // Track usage stats
  
  // Import/Export
  exportRules,        // Generate export data
  importRules,        // Import from data
  clearAllRules       // Remove all rules
} = useCustomRules();
```

### Integration with Main Engine

The phonetic engine now prioritizes custom rules:

1. **Custom Rule Processing**: User rules are applied first with highest confidence
2. **Conflict Resolution**: Custom rules override built-in patterns for the same text
3. **Feedback Loop**: Rule effectiveness is tracked and used for future prioritization

## Example Usage

### Creating a Simple Rule
```typescript
await createRule({
  misspelling: 'teh',
  correction: 'the',
  isRegex: false,
  caseSensitive: false,
  enabled: true,
  description: 'Common typing mistake'
});
```

### Creating a Regex Rule
```typescript
await createRule({
  misspelling: 'colou?r',
  correction: 'color',
  isRegex: true,
  caseSensitive: false,
  enabled: true,
  description: 'British to American spelling'
});
```

### Exporting Rules
```typescript
// Export all rules
const exportData = exportRules();
downloadRulesAsJson(customRules, 'my-rules.json');

// Export specific rules
const selectedRules = ['rule-1', 'rule-2'];
const exportData = exportRules(selectedRules);
```

## Advanced Features

### Regular Expression Support
- **Pattern Matching**: Use regex for complex patterns
- **Capture Groups**: Reference matched groups in corrections using `$1`, `$2`, etc.
- **Case Insensitive**: Optional case sensitivity control
- **Word Boundaries**: Use `\b` for whole-word matching

### Validation System
- **Syntax Checking**: Validate regex patterns before saving
- **Conflict Detection**: Warn about overlapping rules
- **Performance Warnings**: Alert about potentially slow patterns
- **Safety Checks**: Prevent infinite correction loops

### Performance Optimization
- **Rule Prioritization**: Most effective rules are applied first
- **Caching**: Compiled patterns are cached for performance
- **Lazy Loading**: Rules are loaded on-demand
- **Memory Management**: Efficient storage and retrieval

## Future Enhancements

### Planned Features
- **Shared Rule Libraries**: Community rule sharing
- **Machine Learning**: Automatic rule suggestion based on corrections
- **Context Awareness**: Rules that consider surrounding text
- **Collaborative Editing**: Team rule management
- **Rule Templates**: Common pattern templates
- **Version Control**: Rule change tracking and rollback

### Integration Points
- **Mobile Keyboards**: Custom rules in iOS/Android keyboards
- **Browser Extensions**: Rules applied across web browsing
- **Desktop Applications**: System-wide rule application
- **Cloud Services**: Sync across devices and platforms

## Troubleshooting

### Common Issues
1. **Rules Not Applying**: Check if rule is enabled and pattern matches
2. **Regex Errors**: Validate pattern syntax in the editor
3. **Performance Issues**: Avoid overly complex regex patterns
4. **Import Failures**: Verify JSON format and rule structure

### Best Practices
1. **Start Simple**: Use literal patterns before moving to regex
2. **Test Thoroughly**: Use the preview feature to verify behavior
3. **Be Specific**: Avoid overly broad patterns that might over-correct
4. **Regular Maintenance**: Review and update rules based on usage stats
5. **Backup Rules**: Export rules regularly as backup