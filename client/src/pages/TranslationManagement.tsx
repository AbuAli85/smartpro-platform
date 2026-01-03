import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Upload, Languages, CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/Breadcrumb";

// Import translation dictionaries directly
import { translations } from "@/contexts/LanguageContext";

export default function TranslationManagement() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "missing">("all");

  // Get all translation keys
  const translationKeys = useMemo(() => {
    const keys = Object.keys(translations.en);
    return keys.map((key) => ({
      key,
      en: translations.en[key as keyof typeof translations.en],
      ar: translations.ar[key as keyof typeof translations.ar],
      status: translations.ar[key as keyof typeof translations.ar] ? "complete" : "missing",
    }));
  }, []);

  // Filter translations
  const filteredTranslations = useMemo(() => {
    let filtered = translationKeys;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(query) ||
          item.en.toLowerCase().includes(query) ||
          item.ar?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    return filtered;
  }, [translationKeys, searchQuery, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = translationKeys.length;
    const complete = translationKeys.filter((item) => item.status === "complete").length;
    const missing = total - complete;
    const completionRate = Math.round((complete / total) * 100);

    return { total, complete, missing, completionRate };
  }, [translationKeys]);

  const handleExport = () => {
    try {
      // Create CSV content
      const csvContent = [
        ["Key", "English", "Arabic"],
        ...translationKeys.map((item) => [item.key, item.en, item.ar || ""]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `smartpro-translations-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast.success("Translations exported successfully");
    } catch (error) {
      toast.error("Failed to export translations");
      console.error(error);
    }
  };

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Array<{key: string, en: string, ar: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setCsvFile(file);
      processCSV(file);
    }
  };

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file is empty or invalid");
        setIsProcessing(false);
        return;
      }

      // Parse header
      const header = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      const keyIndex = header.indexOf("Key");
      const enIndex = header.indexOf("English");
      const arIndex = header.indexOf("Arabic");

      if (keyIndex === -1 || enIndex === -1 || arIndex === -1) {
        toast.error("CSV must have columns: Key, English, Arabic");
        setIsProcessing(false);
        return;
      }

      // Parse data
      const updates: Array<{key: string, en: string, ar: string}> = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        if (values.length >= 3) {
          const key = values[keyIndex];
          const en = values[enIndex];
          const ar = values[arIndex];
          
          // Only include rows with changes
          const existing = translationKeys.find(t => t.key === key);
          if (existing && (existing.en !== en || existing.ar !== ar)) {
            updates.push({ key, en, ar });
          }
        }
      }

      setImportPreview(updates);
      toast.success(`Found ${updates.length} translation updates`);
    } catch (error) {
      toast.error("Failed to parse CSV file");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) {
      toast.error("No changes to import");
      return;
    }

    // Generate code snippet for manual update
    const codeSnippet = importPreview.map(item => 
      `// ${item.key}\n"${item.key}": "${item.en}",  // English\n"${item.key}": "${item.ar}",  // Arabic`
    ).join("\n\n");

    // Copy to clipboard
    navigator.clipboard.writeText(codeSnippet).then(() => {
      toast.success("Translation updates copied to clipboard!", {
        description: "Paste into LanguageContext.tsx to apply changes"
      });
      setImportDialogOpen(false);
      setCsvFile(null);
      setImportPreview([]);
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t("nav.adminPanel"), href: "/admin" },
          { label: "Translation Management" },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Languages className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Translation Management</h1>
            <p className="text-muted-foreground">
              Manage platform translations for English and Arabic
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.missing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Translation Keys</CardTitle>
              <CardDescription>
                View and manage all translation keys ({filteredTranslations.length} of {stats.total})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by key or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "complete" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("complete")}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Complete
              </Button>
              <Button
                variant={filterStatus === "missing" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("missing")}
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Missing
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Translation Management
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Translations are currently managed in code. To edit translations, export the CSV,
                  make changes, and contact the development team to update the translation files.
                  A live editing feature is planned for future releases.
                </p>
              </div>
            </div>
          </div>

          {/* Translation Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Key</TableHead>
                  <TableHead className="w-[30%]">English</TableHead>
                  <TableHead className="w-[30%]">Arabic</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations.length > 0 ? (
                  filteredTranslations.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-mono text-xs">{item.key}</TableCell>
                      <TableCell className="text-sm">{item.en}</TableCell>
                      <TableCell className="text-sm" dir="rtl">
                        {item.ar || (
                          <span className="text-muted-foreground italic">Not translated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === "complete" ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No translations found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Translations from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: Key, English, Arabic. Only changed translations will be imported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span>Select CSV File</span>
                </Button>
              </label>
              {csvFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </div>

            {/* Preview */}
            {isProcessing && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Processing CSV file...</p>
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Preview ({importPreview.length} changes)</h4>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Key</TableHead>
                        <TableHead className="w-[35%]">English</TableHead>
                        <TableHead className="w-[35%]">Arabic</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.slice(0, 10).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{item.key}</TableCell>
                          <TableCell className="text-sm">{item.en}</TableCell>
                          <TableCell className="text-sm" dir="rtl">{item.ar}</TableCell>
                        </TableRow>
                      ))}
                      {importPreview.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                            ... and {importPreview.length - 10} more
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={importPreview.length === 0 || isProcessing}
            >
              Copy Updates to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
