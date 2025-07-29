import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomRules } from "@/hooks/use-custom-rules";
import { CustomRule, RuleValidationResult } from "@/types/custom-rules";
import { FloppyDisk, X, Warning, Info, Eye } from "@phosphor-icons/react";
import { toast } from "sonner";

interface RuleEditorProps {
  rule?: CustomRule;
  onSave: (rule: CustomRule) => void;
  onCancel: () => void;
}

export function RuleEditor({ rule, onSave, onCancel }: RuleEditorProps) {
  const { validateRule, previewRule, createRule, updateRule } = useCustomRules();
  
  const [formData, setFormData] = useState({
    misspelling: rule?.misspelling || '',
    correction: rule?.correction || '',
    isRegex: rule?.isRegex || false,
    caseSensitive: rule?.caseSensitive || false,
    enabled: rule?.enabled ?? true,
    description: rule?.description || '',
    examples: rule?.examples?.join('\n') || ''
  });

  const [validation, setValidation] = useState<RuleValidationResult>({ isValid: true });
  const [testText, setTestText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form whenever relevant fields change
  const handleValidation = () => {
    const tempRule: Partial<CustomRule> = {
      ...formData,
      examples: formData.examples.split('\n').filter(ex => ex.trim())
    };
    const result = validateRule(tempRule);
    setValidation(result);
  };

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Trigger validation after state update
    setTimeout(handleValidation, 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      const ruleData = {
        misspelling: formData.misspelling.trim(),
        correction: formData.correction.trim(),
        isRegex: formData.isRegex,
        caseSensitive: formData.caseSensitive,
        enabled: formData.enabled,
        description: formData.description.trim() || undefined,
        examples: formData.examples
          .split('\n')
          .map((ex: string) => ex.trim())
          .filter((ex: string) => ex.length > 0)
      };

      let savedRule: CustomRule;
      if (rule) {
        savedRule = await updateRule(rule.id, ruleData);
      } else {
        savedRule = await createRule(ruleData);
      }

      onSave(savedRule);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate preview
  const previews = testText ? previewRule({
    ...formData,
    examples: formData.examples.split('\n').filter(ex => ex.trim())
  }, testText) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {rule ? 'Edit Rule' : 'Create New Rule'}
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!validation.isValid || isSubmitting}
            className="flex items-center gap-2"
          >
            <FloppyDisk size={14} />
            {rule ? 'Update' : 'Create'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X size={14} />
            Cancel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="misspelling">Misspelling Pattern *</Label>
              <Input
                id="misspelling"
                value={formData.misspelling}
                onChange={(e) => updateField('misspelling', e.target.value)}
                placeholder={formData.isRegex ? 'colou?r' : 'seperate'}
                className={!validation.isValid && validation.error?.includes('pattern') ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {formData.isRegex ? 'Regular expression pattern' : 'Exact word or phrase to match'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correction">Correction *</Label>
              <Input
                id="correction"
                value={formData.correction}
                onChange={(e) => updateField('correction', e.target.value)}
                placeholder={formData.isRegex ? 'color' : 'separate'}
                className={!validation.isValid && validation.error?.includes('Correction') ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                What to replace the misspelling with
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of this rule..."
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRegex"
                checked={formData.isRegex}
                onCheckedChange={(checked: boolean) => updateField('isRegex', checked)}
              />
              <Label htmlFor="isRegex" className="text-sm">
                Use regex pattern
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="caseSensitive"
                checked={formData.caseSensitive}
                onCheckedChange={(checked: boolean) => updateField('caseSensitive', checked)}
              />
              <Label htmlFor="caseSensitive" className="text-sm">
                Case sensitive
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked: boolean) => updateField('enabled', checked)}
              />
              <Label htmlFor="enabled" className="text-sm">
                Enable rule
              </Label>
            </div>
          </div>

          {/* Validation Messages */}
          {!validation.isValid && validation.error && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertDescription>{validation.error}</AlertDescription>
            </Alert>
          )}

          {validation.warnings && validation.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="text-sm">{warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testText">Test Text</Label>
            <Textarea
              id="testText"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter some text to test your rule..."
              className="min-h-[100px]"
            />
          </div>

          {previews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <Label className="text-sm font-medium">Preview Results</Label>
              </div>
              {previews.map((preview, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Original: </span>
                        <span className="font-mono">{preview.original}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Corrected: </span>
                        <span className="font-mono">{preview.corrected}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {preview.matches} match{preview.matches !== 1 ? 'es' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {testText && previews.length === 0 && validation.isValid && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No matches found in the test text. Try adding text that contains the misspelling pattern.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examples">Examples (one per line)</Label>
            <Textarea
              id="examples"
              value={formData.examples}
              onChange={(e) => updateField('examples', e.target.value)}
              placeholder="I seperate the documents&#10;Please seperate these items&#10;They live seperate lives"
              className="min-h-[100px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Provide example sentences where this rule would apply. These help other users understand the rule.
            </p>
          </div>

          {formData.isRegex && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800">Regex Help</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-700 space-y-1">
                <div><code>colou?r</code> - matches "color" or "colour"</div>
                <div><code>(seperate|seperates?)</code> - matches "seperate", "seperates"</div>
                <div><code>\bfone\b</code> - matches "fone" as whole word only</div>
                <div><code>would of</code> - matches exact phrase</div>
                <div className="pt-2 text-blue-600">
                  Use capture groups like <code>(word)</code> and reference with <code>$1</code> in correction
                </div>
              </CardContent>
            </Card>
          )}

          {rule && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rule Statistics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>Applied: {rule.usage.timesApplied} times</div>
                <div>Rejected: {rule.usage.timesRejected} times</div>
                <div>Created: {new Date(rule.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(rule.updatedAt).toLocaleDateString()}</div>
                {rule.usage.lastUsed && (
                  <div>Last used: {new Date(rule.usage.lastUsed).toLocaleDateString()}</div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}