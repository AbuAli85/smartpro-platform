import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export function VerifyEmail() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/verify-email");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    setToken(tokenParam);
  }, []);

  const verifyMutation = trpc.accountRecovery.verifyEmail.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    },
  });

  useEffect(() => {
    if (token && !verifyMutation.isSuccess && !verifyMutation.isError) {
      verifyMutation.mutate({ token });
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verifyMutation.isPending && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {verifyMutation.isSuccess && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {verifyMutation.isError && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
            {!token && (
              <Mail className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verifyMutation.isPending && t("security.verifyingEmail")}
            {verifyMutation.isSuccess && t("security.emailVerified")}
            {verifyMutation.isError && t("security.verificationFailed")}
            {!token && t("security.invalidVerificationLink")}
          </CardTitle>
          <CardDescription>
            {verifyMutation.isPending && t("security.pleaseWait")}
            {verifyMutation.isSuccess && t("security.emailVerifiedSuccess")}
            {verifyMutation.isError && t("security.verificationError")}
            {!token && t("security.noTokenProvided")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifyMutation.isSuccess && (
            <div className="text-center text-sm text-muted-foreground">
              {t("security.redirectingToProfile")}
            </div>
          )}
          {verifyMutation.isError && (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {t("security.verificationLinkExpired")}
              </p>
              <Button
                onClick={() => navigate("/profile")}
                className="w-full"
              >
                {t("security.goToProfile")}
              </Button>
            </div>
          )}
          {!token && (
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              {t("common.goHome")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
