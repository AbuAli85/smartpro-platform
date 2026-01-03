import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

export function NotificationSettings() {
  const { isSupported, isSubscribed, error, subscribe, unsubscribe } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePush = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const success = await unsubscribe();
        if (success) {
          toast.success("Push notifications disabled");
        } else {
          toast.error("Failed to disable push notifications");
        }
      } else {
        const success = await subscribe();
        if (success) {
          toast.success("Push notifications enabled");
        } else {
          toast.error(error || "Failed to enable push notifications");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Get notified about booking updates, messages, and important events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="push-notifications" className="font-medium">
                Enable Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time updates even when the app is closed
              </p>
            </div>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleTogglePush}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        {isSubscribed && (
          <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
            ✓ You will receive push notifications for:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>New booking confirmations</li>
              <li>Booking status changes</li>
              <li>New messages from offices</li>
              <li>Document ready notifications</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
