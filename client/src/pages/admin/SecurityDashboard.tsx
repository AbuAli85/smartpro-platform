import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Key, AlertTriangle, Activity, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * Security Dashboard
 * 
 * Admin-only page for monitoring platform security metrics
 */
export default function SecurityDashboard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [timeRange, setTimeRange] = useState(30);

  // Fetch security metrics
  const { data: mfaStats } = trpc.securityDashboard.getMFAStats.useQuery();
  const { data: recentMFAEnrollments } = trpc.securityDashboard.getRecentMFAEnrollments.useQuery({ limit: 10 });
  const { data: passwordResetStats } = trpc.securityDashboard.getPasswordResetStats.useQuery({ days: timeRange });
  const { data: recentPasswordResets } = trpc.securityDashboard.getRecentPasswordResets.useQuery({ limit: 10 });
  const { data: suspiciousActivity } = trpc.securityDashboard.getSuspiciousActivity.useQuery({ limit: 20 });
  const { data: sessionStats } = trpc.securityDashboard.getActiveSessionsStats.useQuery();
  const { data: eventsTrend } = trpc.securityDashboard.getSecurityEventsTrend.useQuery({ days: timeRange });

  const formatDate = (date: Date) => {
    return format(new Date(date), "PPp", { locale: isRTL ? ar : undefined });
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: "default",
      warning: "secondary",
      error: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[severity] || "default"}>{severity}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">
            {isRTL ? "لوحة معلومات الأمان" : "Security Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? "مراقبة المقاييس الأمنية ونشاط المنصة"
              : "Monitor platform security metrics and activity"}
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* MFA Enrollment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? "معدل تفعيل المصادقة الثنائية" : "MFA Enrollment Rate"}
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mfaStats?.enrollmentRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {mfaStats?.mfaEnabled} {isRTL ? "من" : "of"} {mfaStats?.totalUsers}{" "}
              {isRTL ? "مستخدم" : "users"}
            </p>
          </CardContent>
        </Card>

        {/* Password Resets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? "طلبات إعادة تعيين كلمة المرور" : "Password Reset Requests"}
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passwordResetStats?.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {passwordResetStats?.completionRate.toFixed(1)}%{" "}
              {isRTL ? "معدل الإكمال" : "completion rate"}
            </p>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? "الجلسات النشطة" : "Active Sessions"}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats?.totalActiveSessions}</div>
            <p className="text-xs text-muted-foreground">
              {sessionStats?.uniqueUsers} {isRTL ? "مستخدم فريد" : "unique users"}
            </p>
          </CardContent>
        </Card>

        {/* Suspicious Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? "النشاط المشبوه" : "Suspicious Activity"}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousActivity?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "أحداث في آخر 24 ساعة" : "events in last 24h"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "اتجاه الأحداث الأمنية" : "Security Events Trend"}</CardTitle>
          <CardDescription>
            {isRTL
              ? `آخر ${timeRange} يوم`
              : `Last ${timeRange} days`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="loginSuccess"
                stroke="#10b981"
                name={isRTL ? "تسجيل دخول ناجح" : "Login Success"}
              />
              <Line
                type="monotone"
                dataKey="loginFailure"
                stroke="#ef4444"
                name={isRTL ? "فشل تسجيل الدخول" : "Login Failure"}
              />
              <Line
                type="monotone"
                dataKey="mfaEnabled"
                stroke="#3b82f6"
                name={isRTL ? "تفعيل المصادقة الثنائية" : "MFA Enabled"}
              />
              <Line
                type="monotone"
                dataKey="passwordReset"
                stroke="#f59e0b"
                name={isRTL ? "إعادة تعيين كلمة المرور" : "Password Reset"}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="mfa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mfa">
            {isRTL ? "المصادقة الثنائية" : "MFA Enrollments"}
          </TabsTrigger>
          <TabsTrigger value="password">
            {isRTL ? "إعادة تعيين كلمة المرور" : "Password Resets"}
          </TabsTrigger>
          <TabsTrigger value="suspicious">
            {isRTL ? "النشاط المشبوه" : "Suspicious Activity"}
          </TabsTrigger>
        </TabsList>

        {/* MFA Enrollments Tab */}
        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "تفعيلات المصادقة الثنائية الأخيرة" : "Recent MFA Enrollments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "معرف المستخدم" : "User ID"}</TableHead>
                    <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isRTL ? "عنوان IP" : "IP Address"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMFAEnrollments?.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.userId || enrollment.openId}</TableCell>
                      <TableCell>{formatDate(enrollment.timestamp)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {enrollment.ipAddress || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!recentMFAEnrollments?.length && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {isRTL ? "لا توجد بيانات" : "No data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Resets Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "طلبات إعادة تعيين كلمة المرور الأخيرة" : "Recent Password Reset Requests"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "معرف المستخدم" : "User ID"}</TableHead>
                    <TableHead>{isRTL ? "نوع الحدث" : "Event Type"}</TableHead>
                    <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isRTL ? "عنوان IP" : "IP Address"}</TableHead>
                    <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPasswordResets?.map((reset) => (
                    <TableRow key={reset.id}>
                      <TableCell>{reset.userId || reset.openId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reset.eventType === "password_reset_requested"
                            ? isRTL
                              ? "طلب"
                              : "Requested"
                            : isRTL
                            ? "مكتمل"
                            : "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(reset.timestamp)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {reset.ipAddress || "N/A"}
                      </TableCell>
                      <TableCell>
                        {reset.success ? (
                          <Badge variant="default">{isRTL ? "نجح" : "Success"}</Badge>
                        ) : (
                          <Badge variant="destructive">{isRTL ? "فشل" : "Failed"}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!recentPasswordResets?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {isRTL ? "لا توجد بيانات" : "No data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Activity Tab */}
        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>
                {isRTL ? "النشاط المشبوه الأخير" : "Recent Suspicious Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "نوع الحدث" : "Event Type"}</TableHead>
                    <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isRTL ? "عنوان IP" : "IP Address"}</TableHead>
                    <TableHead>{isRTL ? "الخطورة" : "Severity"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousActivity?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="outline">{activity.eventType}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(activity.timestamp)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {activity.ipAddress || "N/A"}
                      </TableCell>
                      <TableCell>{getSeverityBadge(activity.severity)}</TableCell>
                    </TableRow>
                  ))}
                  {!suspiciousActivity?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        {isRTL ? "لا توجد أنشطة مشبوهة" : "No suspicious activity detected"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
