import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Chrome, 
  Globe, 
  MapPin, 
  Clock, 
  Shield,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SessionManagement() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.sessionManagement.getActiveSessions.useQuery();

  const revokeMutation = trpc.sessionManagement.revokeSession.useMutation({
    onSuccess: () => {
      utils.sessionManagement.getActiveSessions.invalidate();
    },
  });

  const revokeAllMutation = trpc.sessionManagement.revokeAllOtherSessions.useMutation({
    onSuccess: () => {
      utils.sessionManagement.getActiveSessions.invalidate();
    },
  });

  const getDeviceIcon = (deviceInfo: any) => {
    if (!deviceInfo) return <Monitor className="h-5 w-5" />;
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5" />;
    if (deviceInfo.device?.toLowerCase().includes("tablet")) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getBrowserIcon = (deviceInfo: any) => {
    if (!deviceInfo?.browser) return <Globe className="h-5 w-5" />;
    const browser = deviceInfo.browser.toLowerCase();
    if (browser.includes("chrome")) return <Chrome className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  const getDeviceDescription = (deviceInfo: any, userAgent: string) => {
    if (!deviceInfo) {
      return userAgent || t("security.unknownDevice");
    }
    
    const parts = [];
    if (deviceInfo.browser) parts.push(deviceInfo.browser);
    if (deviceInfo.os) parts.push(deviceInfo.os);
    if (deviceInfo.device) parts.push(deviceInfo.device);
    
    return parts.length > 0 ? parts.join(" • ") : t("security.unknownDevice");
  };

  const formatLastActive = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: i18n.language === "ar" ? ar : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const activeSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("security.sessionManagement")}</h1>
        <p className="text-muted-foreground">
          {t("security.manageActiveDevices")}
        </p>
      </div>

      {/* Security Alert */}
      {activeSessions.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t("security.sessionSecurityTip")}
          </AlertDescription>
        </Alert>
      )}

      {/* Revoke All Button */}
      {activeSessions.length > 0 && (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                {t("security.revokeAllOtherSessions")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("security.confirmRevokeAll")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("security.revokeAllWarning")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => revokeAllMutation.mutate()}
                  disabled={revokeAllMutation.isPending}
                >
                  {t("security.revokeAll")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className={session.isCurrent ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {getDeviceDescription(session.deviceInfo, session.userAgent)}
                      </CardTitle>
                      {session.isCurrent && (
                        <Badge variant="default">{t("security.currentSession")}</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 flex-wrap">
                      {session.ipAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t("security.lastActive")}: {formatLastActive(session.lastActive)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                {!session.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("security.revoke")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("security.confirmRevoke")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("security.revokeSessionWarning")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeMutation.mutate({ sessionId: session.sessionId })}
                          disabled={revokeMutation.isPending}
                        >
                          {t("security.revoke")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            {session.isCurrent && (
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t("security.currentSessionNote")}
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t("security.noActiveSessions")}</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => navigate("/profile")}>
          {t("common.backToProfile")}
        </Button>
      </div>
    </div>
  );
}
