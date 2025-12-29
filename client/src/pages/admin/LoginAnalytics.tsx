import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, Users, Shield, Clock, Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";

type TimeRange = "24h" | "7d" | "30d" | "90d";

export default function LoginAnalytics() {
  const { t, language } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  // Fetch analytics data
  const { data: summary, isLoading: summaryLoading } = trpc.loginAnalytics.getSummary.useQuery({ timeRange });
  const { data: trends, isLoading: trendsLoading } = trpc.loginAnalytics.getTrends.useQuery({ 
    timeRange, 
    groupBy: timeRange === "24h" ? "hour" : "day" 
  });
  const { data: authMethods, isLoading: methodsLoading } = trpc.loginAnalytics.getAuthMethods.useQuery({ timeRange });
  const { data: geoDistribution, isLoading: geoLoading } = trpc.loginAnalytics.getGeographicDistribution.useQuery({ timeRange });
  const { data: recentAttempts, isLoading: attemptsLoading } = trpc.loginAnalytics.getRecentAttempts.useQuery({ 
    limit: 20, 
    eventType: "all" 
  });
  const { data: hourlyPatterns, isLoading: patternsLoading } = trpc.loginAnalytics.getHourlyPatterns.useQuery({ 
    timeRange: timeRange === "90d" ? "30d" : timeRange 
  });

  const timeRangeLabels = {
    "24h": language === "ar" ? "آخر 24 ساعة" : "Last 24 Hours",
    "7d": language === "ar" ? "آخر 7 أيام" : "Last 7 Days",
    "30d": language === "ar" ? "آخر 30 يوم" : "Last 30 Days",
    "90d": language === "ar" ? "آخر 90 يوم" : "Last 90 Days",
  };

  const COLORS = ["#003366", "#0066CC", "#3399FF", "#66B2FF", "#99CCFF"];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "ar" ? "تحليلات تسجيل الدخول" : "Login Analytics"}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === "ar" 
                ? "مراقبة أنماط المصادقة والأمان" 
                : "Monitor authentication patterns and security"}
            </p>
          </div>
          
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{timeRangeLabels["24h"]}</SelectItem>
              <SelectItem value="7d">{timeRangeLabels["7d"]}</SelectItem>
              <SelectItem value="30d">{timeRangeLabels["30d"]}</SelectItem>
              <SelectItem value="90d">{timeRangeLabels["90d"]}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "إجمالي تسجيلات الدخول" : "Total Logins"}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryLoading ? "..." : summary?.totalLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? timeRangeLabels[timeRange] : timeRangeLabels[timeRange]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "معدل النجاح" : "Success Rate"}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? "..." : `${summary?.successRate.toFixed(1) || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "ar" 
                  ? `${summary?.successfulLogins || 0} ناجح من ${summary?.totalLogins || 0}` 
                  : `${summary?.successfulLogins || 0} of ${summary?.totalLogins || 0} successful`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "المستخدمون الفريدون" : "Unique Users"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryLoading ? "..." : summary?.uniqueUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "مستخدمون نشطون" : "Active users"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === "ar" ? "المحاولات الفاشلة" : "Failed Attempts"}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryLoading ? "..." : summary?.failedLogins || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "يتطلب المراقبة" : "Requires monitoring"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">
              {language === "ar" ? "الاتجاهات" : "Trends"}
            </TabsTrigger>
            <TabsTrigger value="methods">
              {language === "ar" ? "طرق المصادقة" : "Auth Methods"}
            </TabsTrigger>
            <TabsTrigger value="geography">
              {language === "ar" ? "التوزيع الجغرافي" : "Geography"}
            </TabsTrigger>
            <TabsTrigger value="patterns">
              {language === "ar" ? "الأنماط الزمنية" : "Time Patterns"}
            </TabsTrigger>
            <TabsTrigger value="recent">
              {language === "ar" ? "المحاولات الأخيرة" : "Recent Attempts"}
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "اتجاهات تسجيل الدخول" : "Login Trends"}</CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "تسجيلات الدخول الناجحة والفاشلة بمرور الوقت" 
                    : "Successful and failed logins over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="successful" 
                        stroke="#10b981" 
                        name={language === "ar" ? "ناجح" : "Successful"} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="failed" 
                        stroke="#ef4444" 
                        name={language === "ar" ? "فاشل" : "Failed"} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auth Methods Tab */}
          <TabsContent value="methods" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "طرق المصادقة" : "Authentication Methods"}</CardTitle>
                  <CardDescription>
                    {language === "ar" ? "توزيع طرق تسجيل الدخول" : "Distribution of login methods"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {methodsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={authMethods || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.method}: ${entry.percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {(authMethods || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === "ar" ? "تفاصيل الطرق" : "Method Details"}</CardTitle>
                  <CardDescription>
                    {language === "ar" ? "عدد تسجيلات الدخول لكل طريقة" : "Login count by method"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {methodsLoading ? (
                      <p className="text-muted-foreground text-center py-8">
                        {language === "ar" ? "جاري التحميل..." : "Loading..."}
                      </p>
                    ) : (authMethods || []).length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        {language === "ar" ? "لا توجد بيانات" : "No data available"}
                      </p>
                    ) : (
                      (authMethods || []).map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{method.method}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{method.count}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {method.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "التوزيع الجغرافي" : "Geographic Distribution"}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "تسجيلات الدخول حسب الموقع" : "Logins by location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geoLoading ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === "ar" ? "جاري التحميل..." : "Loading..."}
                    </p>
                  ) : (geoDistribution || []).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === "ar" ? "لا توجد بيانات جغرافية" : "No geographic data available"}
                    </p>
                  ) : (
                    (geoDistribution || []).slice(0, 10).map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{location.city}</p>
                            <p className="text-sm text-muted-foreground">{location.country}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{location.count}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "الأنماط الزمنية" : "Hourly Patterns"}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "نشاط تسجيل الدخول حسب الساعة" : "Login activity by hour of day"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patternsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyPatterns || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: language === "ar" ? "الساعة" : "Hour", position: "insideBottom", offset: -5 }} />
                      <YAxis label={{ value: language === "ar" ? "عدد تسجيلات الدخول" : "Login Count", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#003366" name={language === "ar" ? "تسجيلات الدخول" : "Logins"} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Attempts Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "المحاولات الأخيرة" : "Recent Login Attempts"}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "آخر 20 محاولة تسجيل دخول" : "Last 20 login attempts"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attemptsLoading ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === "ar" ? "جاري التحميل..." : "Loading..."}
                    </p>
                  ) : (recentAttempts || []).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {language === "ar" ? "لا توجد محاولات" : "No attempts found"}
                    </p>
                  ) : (
                    (recentAttempts || []).map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {attempt.eventType === "login_success" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {attempt.eventType === "login_success" 
                                ? (language === "ar" ? "تسجيل دخول ناجح" : "Successful Login")
                                : (language === "ar" ? "فشل تسجيل الدخول" : "Failed Login")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {attempt.ipAddress} • {format(new Date(attempt.createdAt), "PPp")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={attempt.eventType === "login_success" ? "default" : "destructive"}>
                          {attempt.eventType === "login_success" 
                            ? (language === "ar" ? "ناجح" : "Success")
                            : (language === "ar" ? "فاشل" : "Failed")}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
