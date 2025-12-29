import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function RequestPasswordReset() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");

  const requestMutation = trpc.accountRecovery.requestPasswordReset.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      requestMutation.mutate({ email });
    }
  };

  if (requestMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t("security.checkYourEmail")}</CardTitle>
            <CardDescription>
              {t("security.passwordResetEmailSent")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t("security.passwordResetInstructions")}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              variant="outline"
            >
              {t("common.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("security.resetPassword")}</CardTitle>
          <CardDescription>
            {t("security.enterEmailForReset")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("common.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={requestMutation.isPending}
              />
            </div>

            {requestMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("security.passwordResetError")}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={requestMutation.isPending || !email}
            >
              {requestMutation.isPending ? t("common.sending") : t("security.sendResetLink")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              {t("common.cancel")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
