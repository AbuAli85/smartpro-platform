import { useSocket } from "@/contexts/SocketContext";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function ConnectionStatusIndicator() {
  const { isConnected } = useSocket();
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
        isConnected
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
      title={isConnected ? "Real-time updates active" : "Connecting..."}
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>{t("common.connected")}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>{t("common.offline")}</span>
        </>
      )}
    </div>
  );
}
