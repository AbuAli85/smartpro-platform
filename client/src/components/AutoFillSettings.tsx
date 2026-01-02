import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  loadFormData,
  saveFormData,
  clearFormData,
  setAutoFillEnabled,
  isAutoFillEnabled,
  type UserFormData,
} from "@/lib/formAutoFill";
import { Save, Trash2, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AutoFillSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(isAutoFillEnabled());
  const [formData, setFormData] = useState<UserFormData>(loadFormData());

  useEffect(() => {
    setFormData(loadFormData());
  }, []);

  const handleSave = () => {
    saveFormData(formData);
    setAutoFillEnabled(enabled);
    toast({
      title: t("autoFill.saved"),
      description: t("autoFill.savedDesc"),
    });
  };

  const handleClear = () => {
    if (confirm(t("autoFill.confirmClear"))) {
      clearFormData();
      setFormData({ autoFillEnabled: true });
      toast({
        title: t("autoFill.cleared"),
        description: t("autoFill.clearedDesc"),
      });
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setAutoFillEnabled(checked);
  };

  const updateField = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{t("autoFill.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("autoFill.description")}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>

          {enabled && (
            <>
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {t("autoFill.infoMessage")}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t("autoFill.personalInfo")}</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("common.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName || ""}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder={t("common.fullName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("common.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder={t("common.email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("common.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder={t("common.phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredContactMethod">
                      {t("autoFill.preferredContact")}
                    </Label>
                    <Select
                      value={formData.preferredContactMethod || ""}
                      onValueChange={(value: any) =>
                        updateField("preferredContactMethod", value)
                      }
                    >
                      <SelectTrigger id="preferredContactMethod">
                        <SelectValue placeholder={t("autoFill.selectContact")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t("common.email")}</SelectItem>
                        <SelectItem value="phone">{t("common.phone")}</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t("autoFill.addressInfo")}</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="governorate">{t("common.governorate")}</Label>
                    <Input
                      id="governorate"
                      value={formData.governorate || ""}
                      onChange={(e) => updateField("governorate", e.target.value)}
                      placeholder={t("common.governorate")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wilayat">{t("common.wilayat")}</Label>
                    <Input
                      id="wilayat"
                      value={formData.wilayat || ""}
                      onChange={(e) => updateField("wilayat", e.target.value)}
                      placeholder={t("common.wilayat")}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine1">{t("common.address")}</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1 || ""}
                      onChange={(e) => updateField("addressLine1", e.target.value)}
                      placeholder={t("common.address")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("common.postalCode")}</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ""}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder={t("common.postalCode")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{t("autoFill.businessInfo")}</h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t("autoFill.companyName")}</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName || ""}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      placeholder={t("autoFill.companyName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commercialRegistration">
                      {t("autoFill.crNumber")}
                    </Label>
                    <Input
                      id="commercialRegistration"
                      value={formData.commercialRegistration || ""}
                      onChange={(e) =>
                        updateField("commercialRegistration", e.target.value)
                      }
                      placeholder={t("autoFill.crNumber")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRegistration">{t("autoFill.taxNumber")}</Label>
                    <Input
                      id="taxRegistration"
                      value={formData.taxRegistration || ""}
                      onChange={(e) => updateField("taxRegistration", e.target.value)}
                      placeholder={t("autoFill.taxNumber")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("autoFill.clearData")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
