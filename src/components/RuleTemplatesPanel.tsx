import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  PHONETIC_TEMPLATES, 
  getTemplatesByCategory, 
  getTemplatesByDifficulty,
  searchTemplates,
  RuleTemplate 
} from "@/utils/phonetic-templates";
import { useCustomRules } from "@/hooks/use-custom-rules";
import { CustomRule } from "@/types/custom-rules";
import { generateId } from "@/utils/id-utils";
import { 
  Template,
  Search, 
  Plus, 
  Check,
  BookOpen,
  GraduationCap,
  Star,
  TrendUp,
  Globe,
  Lightbulb,
  Eye,
  EyeSlash,
  Download,
  Info
} from "@phosphor-icons/react";
import { toast } from "sonner";

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800', 
  advanced: 'bg-red-100 text-red-800'
};

const DIFFICULTY_ICONS = {
  beginner: BookOpen,
  intermediate: GraduationCap,
  advanced: Star
};

export function RuleTemplatesPanel() {
  const { createRule, customRules } = useCustomRules();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showPreview, setShowPreview] = useState<RuleTemplate | null>(null);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);

  // Get filtered templates
  const getFilteredTemplates = (): RuleTemplate[] => {
    let templates = PHONETIC_TEMPLATES;

    // Search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    return templates;
  };

  const templates = getFilteredTemplates();
  const categorizedTemplates = getTemplatesByCategory();
  const categories = Object.keys(categorizedTemplates);

  // Check if rule already exists
  const ruleExists = (misspelling: string, correction: string): boolean => {
    return customRules.some(rule => 
      rule.misspelling.toLowerCase() === misspelling.toLowerCase() &&
      rule.correction.toLowerCase() === correction.toLowerCase()
    );
  };

  // Get template statistics
  const getTemplateStats = (template: RuleTemplate) => {
    const existingRules = template.rules.filter(rule => 
      ruleExists(rule.misspelling, rule.correction)
    );
    return {
      total: template.rules.length,
      existing: existingRules.length,
      new: template.rules.length - existingRules.length
    };
  };

  // Apply selected rules from preview
  const handleApplySelectedRules = async () => {
    if (!showPreview) return;

    setIsApplying(true);
    try {
      let applied = 0;
      let skipped = 0;

      for (const rule of showPreview.rules) {
        const ruleId = `${rule.misspelling}-${rule.correction}`;
        
        if (selectedRules.has(ruleId) && !ruleExists(rule.misspelling, rule.correction)) {
          const newRule: CustomRule = {
            ...rule,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            usage: { timesApplied: 0, timesRejected: 0 }
          };
          
          await createRule(newRule);
          applied++;
        } else if (selectedRules.has(ruleId)) {
          skipped++;
        }
      }

      toast.success(`Applied ${applied} rules${skipped > 0 ? `, skipped ${skipped} existing` : ''}`);
      setShowPreview(null);
      setSelectedRules(new Set());
    } catch (error) {
      toast.error('Failed to apply rules');
    } finally {
      setIsApplying(false);
    }
  };

  // Apply entire template
  const handleApplyTemplate = async (template: RuleTemplate) => {
    setIsApplying(true);
    try {
      let applied = 0;
      let skipped = 0;

      for (const rule of template.rules) {
        if (!ruleExists(rule.misspelling, rule.correction)) {
          const newRule: CustomRule = {
            ...rule,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            usage: { timesApplied: 0, timesRejected: 0 }
          };
          
          await createRule(newRule);
          applied++;
        } else {
          skipped++;
        }
      }

      toast.success(`Applied ${applied} rules from "${template.name}"${skipped > 0 ? `, skipped ${skipped} existing` : ''}`);
    } catch (error) {
      toast.error('Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  // Handle rule selection in preview
  const handleRuleToggle = (rule: any) => {
    const ruleId = `${rule.misspelling}-${rule.correction}`;
    const newSelected = new Set(selectedRules);
    
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    
    setSelectedRules(newSelected);
  };

  // Select all new rules in preview
  const handleSelectAllNew = () => {
    if (!showPreview) return;
    
    const newRules = showPreview.rules.filter(rule => 
      !ruleExists(rule.misspelling, rule.correction)
    );
    
    const newSelected = new Set<string>();
    newRules.forEach(rule => {
      newSelected.add(`${rule.misspelling}-${rule.correction}`);
    });
    
    setSelectedRules(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Template size={20} />
            Rule Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Apply pre-built phonetic correction patterns to quickly set up common rules
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {templates.length} templates available
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates, patterns, or words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {categories.slice(0, 5).map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('all')}
          >
            All Levels
          </Button>
          <Button
            size="sm"
            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('beginner')}
            className="flex items-center gap-1"
          >
            <BookOpen size={12} />
            Beginner
          </Button>
          <Button
            size="sm"
            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('intermediate')}
            className="flex items-center gap-1"
          >
            <GraduationCap size={12} />
            Intermediate
          </Button>
          <Button
            size="sm"
            variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('advanced')}
            className="flex items-center gap-1"
          >
            <Star size={12} />
            Advanced
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No templates found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => {
            const stats = getTemplateStats(template);
            const DifficultyIcon = DIFFICULTY_ICONS[template.difficulty];

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${DIFFICULTY_COLORS[template.difficulty]}`}
                        >
                          <DifficultyIcon size={10} className="mr-1" />
                          {template.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{stats.total} rules total</span>
                        {stats.existing > 0 && (
                          <span className="text-yellow-600">
                            {stats.existing} already added
                          </span>
                        )}
                        {stats.new > 0 && (
                          <span className="text-green-600">
                            {stats.new} new rules
                          </span>
                        )}
                      </div>

                      {/* Sample Rules Preview */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Sample patterns:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.rules.slice(0, 3).map((rule, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                              <code className="bg-muted px-1 rounded">{rule.misspelling}</code>
                              <span className="text-muted-foreground">→</span>
                              <code className="bg-primary/10 px-1 rounded">{rule.correction}</code>
                            </div>
                          ))}
                          {template.rules.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{template.rules.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPreview(template)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Preview
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                        disabled={isApplying || stats.new === 0}
                        className="flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Apply All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Template size={20} />
              {showPreview?.name}
              <Badge className={`text-xs ${DIFFICULTY_COLORS[showPreview?.difficulty || 'beginner']}`}>
                {showPreview?.difficulty}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {showPreview && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {showPreview.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs">
                  <Badge variant="outline">
                    {showPreview.category}
                  </Badge>
                  <span className="text-muted-foreground">
                    {showPreview.rules.length} rules in this template
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAllNew}
                  >
                    Select All New
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedRules(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedRules.size} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={handleApplySelectedRules}
                    disabled={isApplying || selectedRules.size === 0}
                    className="flex items-center gap-1"
                  >
                    <Download size={12} />
                    Apply Selected
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {showPreview.rules.map((rule, index) => {
                    const ruleId = `${rule.misspelling}-${rule.correction}`;
                    const exists = ruleExists(rule.misspelling, rule.correction);
                    const isSelected = selectedRules.has(ruleId);

                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          exists ? 'bg-muted/50 opacity-60' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRuleToggle(rule)}
                            disabled={exists}
                            className="mt-0.5"
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm">
                                {rule.misspelling}
                              </code>
                              <span className="text-muted-foreground">→</span>
                              <code className="bg-primary/10 px-2 py-1 rounded text-sm">
                                {rule.correction}
                              </code>
                              
                              {exists && (
                                <Badge variant="secondary" className="text-xs">
                                  Already added
                                </Badge>
                              )}
                              
                              {rule.isRegex && (
                                <Badge variant="outline" className="text-xs">
                                  Regex
                                </Badge>
                              )}
                            </div>

                            {rule.description && (
                              <p className="text-sm text-muted-foreground">
                                {rule.description}
                              </p>
                            )}

                            {rule.examples && rule.examples.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Examples:
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {rule.examples.slice(0, 2).map((example, i) => (
                                    <div key={i} className="bg-muted/30 px-2 py-1 rounded">
                                      {example}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              {showPreview.rules.some(rule => !rule.enabled) && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Some rules in this template are disabled by default because they may require 
                    context-specific decisions. You can enable them individually after reviewing.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}