import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, CheckCircle, Clock, Megaphone } from "lucide-react";

export default function NotificationPreferences() {
  const { t } = useLanguage();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const updatePreferences = trpc.auth.updateNotificationPreferences.useMutation();
  const utils = trpc.useUtils();

  const [preferences, setPreferences] = useState({
    email: true,
    sms: true,
    confirmations: true,
    reminders: true,
    marketing: false,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updatePreferences.mutateAsync({ preferences });
      await utils.auth.me.invalidate();
      toast.success(t("profile.updateSuccess"));
    } catch (error) {
      toast.error(t("profile.updateError"));
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("notifications.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("notifications.subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications.channels")}
            </CardTitle>
            <CardDescription>{t("notifications.channelsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("notifications.email")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.emailDesc")}
                </p>
              </div>
              <Switch
                id="email"
                checked={preferences.email}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("notifications.sms")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.smsDesc")}
                </p>
              </div>
              <Switch
                id="sms"
                checked={preferences.sms}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, sms: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>{t("notifications.types")}</CardTitle>
            <CardDescription>{t("notifications.typesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="confirmations" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t("notifications.confirmations")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.confirmationsDesc")}
                </p>
              </div>
              <Switch
                id="confirmations"
                checked={preferences.confirmations}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, confirmations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminders" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("notifications.reminders")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.remindersDesc")}
                </p>
              </div>
              <Switch
                id="reminders"
                checked={preferences.reminders}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, reminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  {t("notifications.marketing")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("notifications.marketingDesc")}
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
          >
            {updatePreferences.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
