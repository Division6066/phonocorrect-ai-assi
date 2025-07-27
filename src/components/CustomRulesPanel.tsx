import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomRules } from "@/hooks/use-custom-rules";
import { RuleEditor } from "@/components/RuleEditor";
import { CustomRule } from "@/types/custom-rules";
import { 
  Plus, 
  DotsThreeVertical, 
  Pencil, 
  Trash, 
  Eye, 
  EyeSlash,
  Download,
  Upload,
  FileText,
  Warning,
  CheckCircle,
  Clock,
  TrendUp,
  Share,
  Copy
} from "@phosphor-icons/react";
import { downloadRulesAsJson, copyRulesToClipboard, EXAMPLE_RULES } from "@/utils/rules-export";
import { toast } from "sonner";

export function CustomRulesPanel() {
  const {
    customRules,
    enabledRules,
    stats,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    exportRules,
    importRules,
    clearAllRules,
    validateRule
  } = useCustomRules();

  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomRule | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Filter rules based on search and tab
  const filteredRules = customRules.filter(rule => {
    const matchesSearch = !searchQuery || 
      rule.misspelling.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.correction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'enabled' && rule.enabled) ||
      (selectedTab === 'disabled' && !rule.enabled) ||
      (selectedTab === 'regex' && rule.isRegex);

    return matchesSearch && matchesTab;
  });

  const handleEditRule = (rule: CustomRule) => {
    setEditingRule(rule);
    setShowEditor(true);
  };

  const handleCreateRule = () => {
    setEditingRule(undefined);
    setShowEditor(true);
  };

  const handleSaveRule = (savedRule: CustomRule) => {
    setShowEditor(false);
    setEditingRule(undefined);
  };

  const handleDeleteRule = async (rule: CustomRule) => {
    if (confirm(`Delete rule "${rule.misspelling}" → "${rule.correction}"?`)) {
      try {
        await deleteRule(rule.id);
      } catch (error) {
        toast.error('Failed to delete rule');
      }
    }
  };

  const handleExportRules = () => {
    try {
      downloadRulesAsJson(customRules);
      toast.success(`Exported ${customRules.length} rules`);
    } catch (error) {
      toast.error('Failed to export rules');
    }
  };

  const handleCopyRules = async () => {
    try {
      await copyRulesToClipboard(customRules);
      toast.success(`Copied ${customRules.length} rules to clipboard`);
    } catch (error) {
      toast.error('Failed to copy rules to clipboard');
    }
  };

  const handleLoadExamples = async () => {
    try {
      for (const exampleRule of EXAMPLE_RULES) {
        await createRule(exampleRule);
      }
      toast.success(`Loaded ${EXAMPLE_RULES.length} example rules`);
    } catch (error) {
      toast.error('Failed to load example rules');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
  };

  const handleImportRules = async (overwrite: boolean = false) => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const importData = JSON.parse(text);
      
      const result = await importRules(importData, { 
        overwrite,
        skipDuplicates: !overwrite 
      });
      
      setShowImportDialog(false);
      setImportFile(null);
    } catch (error) {
      toast.error('Failed to import rules. Please check the file format.');
    }
  };

  const handleClearAllRules = () => {
    if (confirm(`Delete all ${customRules.length} custom rules? This cannot be undone.`)) {
      clearAllRules();
    }
  };

  if (showEditor) {
    return (
      <Card>
        <CardContent className="p-6">
          <RuleEditor
            rule={editingRule}
            onSave={handleSaveRule}
            onCancel={() => setShowEditor(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Custom Phonetic Rules</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your own correction patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateRule} className="flex items-center gap-2">
            <Plus size={14} />
            New Rule
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DotsThreeVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportRules}>
                <Download size={14} className="mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyRules}>
                <Copy size={14} className="mr-2" />
                Copy to Clipboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById('import-input')?.click()}>
                <Upload size={14} className="mr-2" />
                Import from JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLoadExamples} disabled={customRules.length > 0}>
                <Plus size={14} className="mr-2" />
                Load Example Rules
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleClearAllRules}
                className="text-destructive"
                disabled={customRules.length === 0}
              >
                <Trash size={14} className="mr-2" />
                Clear All Rules
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            id="import-input"
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.enabled}</div>
                <div className="text-xs text-muted-foreground">Enabled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <EyeSlash size={16} className="text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.disabled}</div>
                <div className="text-xs text-muted-foreground">Disabled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendUp size={16} className="text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsage}</div>
                <div className="text-xs text-muted-foreground">Total Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All ({customRules.length})</TabsTrigger>
            <TabsTrigger value="enabled">Enabled ({stats.enabled})</TabsTrigger>
            <TabsTrigger value="disabled">Disabled ({stats.disabled})</TabsTrigger>
            <TabsTrigger value="regex">Regex ({customRules.filter(r => r.isRegex).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Rules List */}
      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <FileText size={48} className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">No rules found</h3>
                <p className="text-sm text-muted-foreground">
                  {customRules.length === 0 
                    ? "Create your first custom rule to get started"
                    : "Try adjusting your search or filter"
                  }
                </p>
              </div>
              {customRules.length === 0 && (
                <div className="space-y-2">
                  <Button onClick={handleCreateRule} className="w-full">
                    <Plus size={14} className="mr-2" />
                    Create First Rule
                  </Button>
                  <Button onClick={handleLoadExamples} variant="outline" className="w-full">
                    Load Example Rules
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const validation = validateRule(rule);
            const hasWarnings = validation.warnings && validation.warnings.length > 0;
            
            return (
              <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {rule.misspelling}
                          </code>
                          <span className="text-muted-foreground">→</span>
                          <code className="bg-primary/10 px-2 py-1 rounded text-sm">
                            {rule.correction}
                          </code>
                        </div>
                        
                        <div className="flex gap-1">
                          {rule.isRegex && (
                            <Badge variant="outline" className="text-xs">
                              Regex
                            </Badge>
                          )}
                          {rule.caseSensitive && (
                            <Badge variant="outline" className="text-xs">
                              Case
                            </Badge>
                          )}
                          {!rule.enabled && (
                            <Badge variant="secondary" className="text-xs">
                              Disabled
                            </Badge>
                          )}
                          {hasWarnings && (
                            <Badge variant="outline" className="text-xs text-yellow-600">
                              <Warning size={10} className="mr-1" />
                              Warning
                            </Badge>
                          )}
                        </div>
                      </div>

                      {rule.description && (
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Applied: {rule.usage.timesApplied}</span>
                        <span>Rejected: {rule.usage.timesRejected}</span>
                        {rule.usage.lastUsed && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            Last used: {new Date(rule.usage.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRule(rule.id)}
                        className="p-2"
                      >
                        {rule.enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="p-2">
                            <DotsThreeVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                            <Pencil size={14} className="mr-2" />
                            Edit Rule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleRule(rule.id)}>
                            {rule.enabled ? (
                              <>
                                <EyeSlash size={14} className="mr-2" />
                                Disable Rule
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-2" />
                                Enable Rule
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRule(rule)}
                            className="text-destructive"
                          >
                            <Trash size={14} className="mr-2" />
                            Delete Rule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {hasWarnings && (
                    <Alert className="mt-3">
                      <Warning className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {validation.warnings?.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Custom Rules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              How would you like to handle duplicate rules?
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleImportRules(false)}
                className="flex-1"
              >
                Skip Duplicates
              </Button>
              <Button 
                onClick={() => handleImportRules(true)}
                variant="outline"
                className="flex-1"
              >
                Overwrite Existing
              </Button>
            </div>
            <Button 
              onClick={() => setShowImportDialog(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}