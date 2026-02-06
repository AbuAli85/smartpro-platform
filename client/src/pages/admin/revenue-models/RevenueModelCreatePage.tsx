import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelFormWizard } from "@/components/admin/revenue-models/ModelFormWizard";

export default function RevenueModelCreatePage() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isRTL = i18n.language === "ar";

  const onSuccess = () => {
    setLocation("/admin/revenue-models");
  };

  return (
    <div className="container mx-auto py-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold">{t("admin.revenueModels.new")}</h1>
        <p className="text-muted-foreground">{t("admin.revenueModels.createSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.revenueModels.wizard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ModelFormWizard onSuccess={onSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}
