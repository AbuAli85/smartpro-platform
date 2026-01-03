import { useOffline } from "@/hooks/useOffline";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { isOffline, wasOffline } = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOffline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline]);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] lg:left-64">
      <Alert
        className={cn(
          "rounded-none border-x-0 border-t-0 transition-colors",
          isOffline
            ? "bg-destructive/10 border-destructive text-destructive"
            : "bg-green-50 border-green-500 text-green-700"
        )}
      >
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="h-5 w-5" />
          ) : (
            <Wifi className="h-5 w-5" />
          )}
          <AlertDescription className="font-medium">
            {isOffline
              ? "You're offline. Some features may be unavailable."
              : "Connection restored! Syncing data..."}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
