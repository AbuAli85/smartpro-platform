import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Languages } from "lucide-react";

export default function ContentTranslation() {
  const { t } = useLanguage();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [officeNameAr, setOfficeNameAr] = useState("");
  const [officeDescriptionAr, setOfficeDescriptionAr] = useState("");
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templateNameAr, setTemplateNameAr] = useState("");
  const [templateDescriptionAr, setTemplateDescriptionAr] = useState("");

  // Fetch all offices
  const { data: officesData, isLoading: officesLoading } = trpc.sanadOffice.list.useQuery({});
  const offices = officesData?.offices || [];
  
  // Fetch all templates
  const { data: templatesData, isLoading: templatesLoading } = trpc.documentTemplate.list.useQuery({});
  const templates = templatesData?.templates || [];

  // Update office translation mutation
  const updateOfficeMutation = trpc.sanadOffice.updateTranslation.useMutation({
    onSuccess: () => {
      toast.success(t("admin.translationUpdated"));
      setSelectedOfficeId(null);
      setOfficeNameAr("");
      setOfficeDescriptionAr("");
    },
    onError: (error) => {
      toast.error(error.message || t("admin.translationError"));
    },
  });

  // Update template translation mutation
  const updateTemplateMutation = trpc.documentTemplate.updateTranslation.useMutation({
    onSuccess: () => {
      toast.success(t("admin.translationUpdated"));
      setSelectedTemplateId(null);
      setTemplateNameAr("");
      setTemplateDescriptionAr("");
    },
    onError: (error) => {
      toast.error(error.message || t("admin.translationError"));
    },
  });

  const handleOfficeSelect = (officeId: number) => {
    const office = offices.find((o: any) => o.id === officeId);
    if (office) {
      setSelectedOfficeId(officeId);
      setOfficeNameAr(office.officeNameAr || "");
      setOfficeDescriptionAr(office.descriptionAr || "");
    }
  };

  const handleSaveOfficeTranslation = () => {
    if (!selectedOfficeId) {
      toast.error(t("admin.selectOfficeFirst"));
      return;
    }

    updateOfficeMutation.mutate({
      officeId: selectedOfficeId,
      officeNameAr,
      descriptionAr: officeDescriptionAr,
    });
  };
  
  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find((tmpl: any) => tmpl.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setTemplateNameAr(template.templateNameAr || "");
      setTemplateDescriptionAr(template.descriptionAr || "");
    }
  };
  
  const handleSaveTemplateTranslation = () => {
    if (!selectedTemplateId) {
      toast.error(t("admin.selectTemplateFirst"));
      return;
    }

    updateTemplateMutation.mutate({
      templateId: selectedTemplateId,
      templateNameAr,
      descriptionAr: templateDescriptionAr,
    });
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Languages className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">{t("admin.contentTranslation")}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {t("admin.contentTranslationDesc")}
        </p>
      </div>

      <Tabs defaultValue="offices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="offices">{t("admin.offices")}</TabsTrigger>
          <TabsTrigger value="templates">{t("admin.templates")}</TabsTrigger>
        </TabsList>

        <TabsContent value="offices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.manageOfficeTranslations")}</CardTitle>
              <CardDescription>
                {t("admin.manageOfficeTranslationsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Office Selection */}
              <div className="space-y-2">
                <Label htmlFor="office-select">{t("admin.selectOffice")}</Label>
                {officesLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </div>
                ) : (
                  <select
                    id="office-select"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedOfficeId || ""}
                    onChange={(e) => handleOfficeSelect(Number(e.target.value))}
                  >
                    <option value="">{t("admin.selectOffice")}</option>
                    {offices.map((office: any) => (
                      <option key={office.id} value={office.id}>
                        {office.officeName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedOfficeId && (
                <>
                  {/* Arabic Name */}
                  <div className="space-y-2">
                    <Label htmlFor="office-name-ar">{t("admin.officeNameArabic")}</Label>
                    <Input
                      id="office-name-ar"
                      value={officeNameAr}
                      onChange={(e) => setOfficeNameAr(e.target.value)}
                      placeholder={t("admin.enterArabicName")}
                      dir="rtl"
                      className="text-right"
                    />
                  </div>

                  {/* Arabic Description */}
                  <div className="space-y-2">
                    <Label htmlFor="office-description-ar">
                      {t("admin.officeDescriptionArabic")}
                    </Label>
                    <Textarea
                      id="office-description-ar"
                      value={officeDescriptionAr}
                      onChange={(e) => setOfficeDescriptionAr(e.target.value)}
                      placeholder={t("admin.enterArabicDescription")}
                      dir="rtl"
                      className="text-right min-h-[120px]"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveOfficeTranslation}
                    disabled={updateOfficeMutation.isPending}
                    className="w-full"
                  >
                    {updateOfficeMutation.isPending ? (
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.manageTemplateTranslations")}</CardTitle>
              <CardDescription>
                {t("admin.manageTemplateTranslationsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template-select">{t("admin.selectTemplate")}</Label>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </div>
                ) : (
                  <select
                    id="template-select"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedTemplateId || ""}
                    onChange={(e) => handleTemplateSelect(Number(e.target.value))}
                  >
                    <option value="">{t("admin.selectTemplate")}</option>
                    {templates.map((template: any) => (
                      <option key={template.id} value={template.id}>
                        {template.templateName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedTemplateId && (
                <>
                  {/* Arabic Name */}
                  <div className="space-y-2">
                    <Label htmlFor="template-name-ar">{t("admin.templateNameArabic")}</Label>
                    <Input
                      id="template-name-ar"
                      value={templateNameAr}
                      onChange={(e) => setTemplateNameAr(e.target.value)}
                      placeholder={t("admin.enterArabicName")}
                      dir="rtl"
                      className="text-right"
                    />
                  </div>

                  {/* Arabic Description */}
                  <div className="space-y-2">
                    <Label htmlFor="template-description-ar">
                      {t("admin.templateDescriptionArabic")}
                    </Label>
                    <Textarea
                      id="template-description-ar"
                      value={templateDescriptionAr}
                      onChange={(e) => setTemplateDescriptionAr(e.target.value)}
                      placeholder={t("admin.enterArabicDescription")}
                      dir="rtl"
                      className="text-right min-h-[120px]"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveTemplateTranslation}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
