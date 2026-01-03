import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ResetPassword() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    setToken(tokenParam);
  }, []);

  // Verify token validity
  const { data: tokenData, isLoading: isVerifying, isError: isTokenInvalid } = trpc.accountRecovery.verifyResetToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const resetMutation = trpc.accountRecovery.resetPassword.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    },
  });

  const handleReset = () => {
    if (token) {
      resetMutation.mutate({ token });
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl">{t("security.verifyingToken")}</CardTitle>
            <CardDescription>{t("security.pleaseWait")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (!token || isTokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl">{t("security.invalidResetLink")}</CardTitle>
            <CardDescription>
              {t("security.resetLinkExpired")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/request-password-reset")}
              className="w-full"
            >
              {t("security.requestNewLink")}
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              {t("common.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (resetMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t("security.passwordResetComplete")}</CardTitle>
            <CardDescription>
              {t("security.passwordResetSuccessMessage")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              {t("security.redirectingToLogin")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t("security.resetYourPassword")}</CardTitle>
          <CardDescription>
            {t("security.resetPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              {t("security.manusOAuthNote")}
            </AlertDescription>
          </Alert>

          {resetMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {t("security.resetPasswordError")}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleReset}
            className="w-full"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? t("common.processing") : t("security.confirmReset")}
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            {t("common.cancel")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
