import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, Lightbulb, Sparkles, History, ChevronDown, ChevronUp } from "lucide-react";

interface EnhancedTranslationEditorProps {
  entityType: "office" | "template";
  entityId: number;
  entityName: string;
  entityDescription?: string;
  initialNameAr?: string;
  initialDescriptionAr?: string;
  onSave: (data: { nameAr: string; descriptionAr: string }) => void;
  isSaving: boolean;
}

export default function EnhancedTranslationEditor({
  entityType,
  entityId,
  entityName,
  entityDescription,
  initialNameAr = "",
  initialDescriptionAr = "",
  onSave,
  isSaving,
}: EnhancedTranslationEditorProps) {
  const { t } = useLanguage();
  const [nameAr, setNameAr] = useState(initialNameAr);
  const [descriptionAr, setDescriptionAr] = useState(initialDescriptionAr);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Translation memory suggestions for name
  const { data: nameSuggestions, isLoading: nameSuggestionsLoading } = trpc.translationMemory.findSimilar.useQuery(
    {
      sourceText: entityName,
      context: `${entityType}_name`,
      limit: 5,
    },
    { enabled: entityName.length > 3 }
  );

  // Translation memory suggestions for description
  const { data: descSuggestions, isLoading: descSuggestionsLoading } = trpc.translationMemory.findSimilar.useQuery(
    {
      sourceText: entityDescription || "",
      context: `${entityType}_description`,
      limit: 5,
    },
    { enabled: !!entityDescription && entityDescription.length > 10 }
  );

  // Auto-translate mutation
  const autoTranslateMutation = trpc.autoTranslate[entityType === "office" ? "translateOffice" : "translateTemplate"].useMutation({
    onSuccess: (data: any) => {
      if (data.translations.nameAr) {
        setNameAr(data.translations.nameAr.translatedText);
      }
      if (data.translations.descriptionAr) {
        setDescriptionAr(data.translations.descriptionAr.translatedText);
      }
      toast.success("Auto-translation completed. Please review and save.");
    },
    onError: (error) => {
      toast.error(error.message || "Auto-translation failed");
    },
  });

  // Version history
  const { data: versionHistory, isLoading: versionHistoryLoading } = trpc.translationMemory.getVersionHistory.useQuery(
    {
      entityType,
      entityId,
      limit: 10,
    },
    { enabled: showVersionHistory }
  );

  const handleAutoTranslate = () => {
    const input: any = {
      fields: ["name", "description"],
      applyTranslation: false,
    };

    if (entityType === "office") {
      input.officeId = entityId;
    } else {
      input.templateId = entityId;
    }

    autoTranslateMutation.mutate(input);
  };

  const handleSave = () => {
    onSave({ nameAr, descriptionAr });
  };

  return (
    <div className="space-y-6">
      {/* Auto-Translate Button */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">AI-Powered Translation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically translate content to Arabic using AI. Review and edit before saving.
              </p>
              <Button
                onClick={handleAutoTranslate}
                disabled={autoTranslateMutation.isPending}
                variant="outline"
                size="sm"
              >
                {autoTranslateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Auto-Translate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name Translation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="name-ar">
            {entityType === "office" ? t("admin.officeNameArabic") : t("admin.templateNameArabic")}
          </Label>
          {nameSuggestions && nameSuggestions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNameSuggestions(!showNameSuggestions)}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              {nameSuggestions.length} {t("admin.suggestions")}
              {showNameSuggestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          )}
        </div>

        {showNameSuggestions && nameSuggestions && nameSuggestions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Translation Memory Suggestions:
                </p>
                {nameSuggestions.map((suggestion: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded bg-white dark:bg-slate-900 border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setNameAr(suggestion.translatedText);
                      setShowNameSuggestions(false);
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" dir="rtl">
                        {suggestion.translatedText}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From: "{suggestion.sourceText}"
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.similarityScore * 100)}% match
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Input
          id="name-ar"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder={t("admin.enterArabicName")}
          dir="rtl"
          className="text-right"
        />
      </div>

      {/* Description Translation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="description-ar">
            {entityType === "office" ? t("admin.officeDescriptionArabic") : t("admin.templateDescriptionArabic")}
          </Label>
          {descSuggestions && descSuggestions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDescSuggestions(!showDescSuggestions)}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              {descSuggestions.length} {t("admin.suggestions")}
              {showDescSuggestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          )}
        </div>

        {showDescSuggestions && descSuggestions && descSuggestions.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Translation Memory Suggestions:
                </p>
                {descSuggestions.map((suggestion: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded bg-white dark:bg-slate-900 border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setDescriptionAr(descriptionAr + (descriptionAr ? " " : "") + suggestion.translatedText);
                      setShowDescSuggestions(false);
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium" dir="rtl">
                        {suggestion.translatedText}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From: "{suggestion.sourceText.substring(0, 60)}..."
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.similarityScore * 100)}% match
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Textarea
          id="description-ar"
          value={descriptionAr}
          onChange={(e) => setDescriptionAr(e.target.value)}
          placeholder={t("admin.enterArabicDescription")}
          dir="rtl"
          className="text-right min-h-[150px]"
        />
      </div>

      {/* Version History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle className="text-lg">Version History</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              {showVersionHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>View previous translations and rollback if needed</CardDescription>
        </CardHeader>
        {showVersionHistory && (
          <CardContent>
            {versionHistoryLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading history...</span>
              </div>
            ) : versionHistory && versionHistory.length > 0 ? (
              <div className="space-y-3">
                {versionHistory.map((version: any) => (
                  <div key={version.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{version.fieldName === "nameAr" ? "Name" : "Description"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()} by {version.changedByName}
                        </p>
                      </div>
                      <Badge variant="outline">{version.source}</Badge>
                    </div>
                    <div className="space-y-1">
                      {version.oldValue && (
                        <p className="text-sm text-muted-foreground" dir="rtl">
                          <span className="font-medium">Old:</span> {version.oldValue}
                        </p>
                      )}
                      <p className="text-sm" dir="rtl">
                        <span className="font-medium">New:</span> {version.newValue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No version history available</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("common.saving")}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {t("common.save")}
          </>
        )}
      </Button>
    </div>
  );
}
