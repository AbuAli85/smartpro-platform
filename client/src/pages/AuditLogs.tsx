import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Shield, AlertTriangle, Info, XCircle, CheckCircle, Clock, MapPin, Monitor } from "lucide-react";
import { format } from "date-fns";

type EventType = "login_success" | "login_failure" | "logout" | "session_expired" | "role_changed" | "permission_denied" | "password_reset_requested" | "password_reset_completed" | "mfa_enabled" | "mfa_disabled" | "mfa_verified" | "mfa_failed" | "email_verified" | "account_locked" | "account_unlocked";
type Severity = "info" | "warning" | "error" | "critical";

export default function AuditLogs() {
  const { t } = useTranslation();
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Get statistics
  const { data: stats } = trpc.auditLog.getStats.useQuery({});

  // Get audit logs
  const { data: logs, isLoading } = trpc.auditLog.getAllLogs.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    eventTypes: eventTypeFilter !== "all" ? [eventTypeFilter] : undefined,
    severity: severityFilter !== "all" ? [severityFilter] : undefined,
  });

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    const variants: Record<Severity, "default" | "secondary" | "destructive" | "outline"> = {
      critical: "destructive",
      error: "destructive",
      warning: "secondary",
      info: "outline",
    };
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getEventIcon = (eventType: EventType) => {
    if (eventType === "login_success") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (eventType === "login_failure") return <XCircle className="h-4 w-4 text-red-500" />;
    if (eventType === "logout") return <Clock className="h-4 w-4 text-gray-500" />;
    return <Shield className="h-4 w-4 text-blue-500" />;
  };

  const getEventLabel = (eventType: EventType) => {
    return eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Security Audit Logs</h1>
        <p className="text-muted-foreground">
          Monitor authentication events and security activities across the platform
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful Logins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulLogins.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Logins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedLogins.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Logouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.logouts.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.criticalEvents.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by event type and severity</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <Select value={eventTypeFilter} onValueChange={(v) => setEventTypeFilter(v as EventType | "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failure">Login Failure</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="session_expired">Session Expired</SelectItem>
                <SelectItem value="role_changed">Role Changed</SelectItem>
                <SelectItem value="permission_denied">Permission Denied</SelectItem>
                <SelectItem value="mfa_enabled">MFA Enabled</SelectItem>
                <SelectItem value="mfa_disabled">MFA Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Severity</label>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as Severity | "all")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>Recent authentication and security events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getSeverityIcon(log.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getEventIcon(log.eventType)}
                          <span className="font-semibold">{getEventLabel(log.eventType)}</span>
                          {getSeverityBadge(log.severity)}
                          <Badge variant={log.success ? "outline" : "destructive"}>
                            {log.success ? "Success" : "Failed"}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(log.createdAt), "PPpp")}</span>
                          </div>

                          {log.ipAddress && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {log.ipAddress}
                                {log.city && log.country && ` • ${log.city}, ${log.country}`}
                              </span>
                            </div>
                          )}

                          {log.userAgent && (
                            <div className="flex items-center gap-2">
                              <Monitor className="h-3 w-3" />
                              <span className="truncate max-w-md">{log.userAgent}</span>
                            </div>
                          )}

                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                              {JSON.stringify(log.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      {log.userId && <div>User ID: {log.userId}</div>}
                      {log.openId && <div className="text-xs truncate max-w-[150px]">{log.openId}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {logs && logs.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!logs || logs.length < pageSize}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
