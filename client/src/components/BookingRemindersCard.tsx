import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, BellOff, Clock, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingRemindersCardProps {
  bookingId: number;
  scheduledDate?: Date;
  status: string;
}

export function BookingRemindersCard({ bookingId, scheduledDate, status }: BookingRemindersCardProps) {
  const { t } = useLanguage();

  // Fetch reminder settings
  const { data: reminderSettings, refetch } = trpc.booking.getReminderSettings.useQuery({ bookingId });

  const utils = trpc.useUtils();
  const updateReminderMutation = trpc.booking.updateReminderSettings.useMutation({
    onSuccess: () => {
      toast.success(t("reminders.settingsUpdated"));
      refetch();
      utils.booking.getReminderSettings.invalidate({ bookingId });
    },
    onError: (error) => {
      toast.error(error.message || t("reminders.updateError"));
    },
  });

  const handleToggleReminder = (reminderType: string, enabled: boolean) => {
    updateReminderMutation.mutate({
      bookingId,
      reminderType,
      enabled,
    });
  };

  // Calculate reminder times
  const getReminderTime = (hoursBefore: number) => {
    if (!scheduledDate) return null;
    const reminderDate = new Date(scheduledDate);
    reminderDate.setHours(reminderDate.getHours() - hoursBefore);
    return reminderDate;
  };

  const reminderTypes = [
    {
      id: "24h",
      label: t("reminders.24hoursBefore"),
      description: t("reminders.24hoursDesc"),
      hoursBefore: 24,
      icon: Bell,
      enabled: reminderSettings?.reminder24h ?? true,
    },
    {
      id: "2h",
      label: t("reminders.2hoursBefore"),
      description: t("reminders.2hoursDesc"),
      hoursBefore: 2,
      icon: Clock,
      enabled: reminderSettings?.reminder2h ?? true,
    },
    {
      id: "email",
      label: t("reminders.emailReminder"),
      description: t("reminders.emailDesc"),
      hoursBefore: 24,
      icon: Mail,
      enabled: reminderSettings?.emailReminder ?? true,
    },
    {
      id: "sms",
      label: t("reminders.smsReminder"),
      description: t("reminders.smsDesc"),
      hoursBefore: 2,
      icon: MessageSquare,
      enabled: reminderSettings?.smsReminder ?? false,
    },
  ];

  // Don't show reminders for cancelled or completed bookings
  if (status === "cancelled" || status === "completed") {
    return null;
  }

  // Don't show if no scheduled date
  if (!scheduledDate) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("reminders.title")}
        </CardTitle>
        <CardDescription>{t("reminders.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reminder Schedule */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">{t("reminders.scheduledFor")}</p>
              <p className="text-sm text-blue-800 mt-1">
                {format(scheduledDate, "EEEE, MMMM d, yyyy 'at' HH:mm")}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {formatDistanceToNow(scheduledDate, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t("reminders.notificationSettings")}</h4>
          {reminderTypes.map((reminder) => {
            const reminderTime = getReminderTime(reminder.hoursBefore);
            const Icon = reminder.icon;

            return (
              <div
                key={reminder.id}
                className={cn(
                  "flex items-start justify-between p-3 border rounded-lg transition-colors",
                  reminder.enabled ? "bg-background" : "bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={cn(
                      "flex-shrink-0 mt-1",
                      reminder.enabled ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Label
                        htmlFor={`reminder-${reminder.id}`}
                        className={cn(
                          "font-medium text-sm cursor-pointer",
                          !reminder.enabled && "text-muted-foreground"
                        )}
                      >
                        {reminder.label}
                      </Label>
                      {reminder.enabled && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {t("reminders.active")}
                        </Badge>
                      )}
                    </div>
                    <p className={cn("text-xs", reminder.enabled ? "text-muted-foreground" : "text-muted-foreground/70")}>
                      {reminder.description}
                    </p>
                    {reminder.enabled && reminderTime && reminderTime > new Date() && (
                      <p className="text-xs text-primary mt-1">
                        {t("reminders.willBeSentAt")} {format(reminderTime, "MMM d, HH:mm")}
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  id={`reminder-${reminder.id}`}
                  checked={reminder.enabled}
                  onCheckedChange={(checked) => handleToggleReminder(reminder.id, checked)}
                  disabled={updateReminderMutation.isPending}
                />
              </div>
            );
          })}
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p>{t("reminders.infoNote")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
