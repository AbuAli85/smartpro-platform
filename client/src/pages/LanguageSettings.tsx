import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Check } from "lucide-react";
import { toast } from "sonner";

export default function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">(language);
  
  const updateLanguageMutation = trpc.auth.updateLanguagePreference.useMutation({
    onSuccess: () => {
      setLanguage(selectedLanguage);
      toast.success(t("settings.languageUpdated"));
    },
    onError: (error: unknown) => {
      toast.error(t("settings.languageUpdateFailed"));
      console.error("Failed to update language:", error);
    },
  });

  const handleSave = () => {
    if (!user) {
      toast.error(t("common.error"));
      return;
    }
    
    updateLanguageMutation.mutate({ language: selectedLanguage });
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("settings.languageSettings")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("settings.languageSettingsDesc")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t("settings.preferredLanguage")}</CardTitle>
              <CardDescription>{t("settings.preferredLanguageDesc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">{t("settings.selectLanguage")}</Label>
            <Select
              value={selectedLanguage}
              onValueChange={(value: "en" | "ar") => setSelectedLanguage(value)}
            >
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center justify-between w-full">
                    <span>English</span>
                    {selectedLanguage === "en" && <Check className="w-4 h-4 ml-2" />}
                  </div>
                </SelectItem>
                <SelectItem value="ar">
                  <div className="flex items-center justify-between w-full">
                    <span>العربية (Arabic)</span>
                    {selectedLanguage === "ar" && <Check className="w-4 h-4 ml-2" />}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{t("settings.languageInfo")}</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t("settings.languageInfoPoint1")}</li>
              <li>• {t("settings.languageInfoPoint2")}</li>
              <li>• {t("settings.languageInfoPoint3")}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={updateLanguageMutation.isPending || selectedLanguage === language}
              className="min-w-32"
            >
              {updateLanguageMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
            {selectedLanguage !== language && (
              <Button
                variant="outline"
                onClick={() => setSelectedLanguage(language)}
              >
                {t("common.cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
