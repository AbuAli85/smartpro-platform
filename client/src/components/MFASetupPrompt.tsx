import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";

export function MFASetupPrompt() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Only show for admins without MFA
  if (!user || user.role !== "admin" || user.mfaEnabled) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        {t("security.mfaRequiredForAdmin")}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{t("security.mfaRequiredDescription")}</p>
        <Button
          onClick={() => navigate("/security/mfa")}
          variant="default"
          size="sm"
        >
          {t("security.setupMFA")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
