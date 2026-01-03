import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, Calendar, XCircle, DollarSign, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function BookingAnalyticsDashboard() {
  const { t } = useLanguage();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);

  // Get user's offices
  const { data: userOffices, isLoading: officesLoading } = trpc.officeOwner.getMyOffices.useQuery();

  // Get analytics data
  const { data: metrics, isLoading: metricsLoading } = trpc.bookingAnalytics.getMetricsSummary.useQuery(
    { officeId: selectedOfficeId!, days: timeRange },
    { enabled: !!selectedOfficeId }
  );

  // Set default office when offices load
  useMemo(() => {
    if (userOffices && userOffices.length > 0 && !selectedOfficeId) {
      setSelectedOfficeId(userOffices[0].id);
    }
  }, [userOffices, selectedOfficeId]);

  if (officesLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!userOffices || userOffices.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("bookingAnalytics.noOffices")}
            </CardTitle>
            <CardDescription>{t("bookingAnalytics.noOfficesDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("bookingAnalytics.title")}</h1>
            <p className="text-muted-foreground">{t("bookingAnalytics.description")}</p>
          </div>
          <div className="flex gap-3">
            <Select
              value={selectedOfficeId?.toString()}
              onValueChange={(value) => setSelectedOfficeId(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("bookingAnalytics.selectOffice")} />
              </SelectTrigger>
              <SelectContent>
                {userOffices.map((office) => (
                  <SelectItem key={office.id} value={office.id.toString()}>
                    {office.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t("bookingAnalytics.last7Days")}</SelectItem>
                <SelectItem value="30">{t("bookingAnalytics.last30Days")}</SelectItem>
                <SelectItem value="90">{t("bookingAnalytics.last90Days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {metricsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : metrics ? (
          <>
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bookingAnalytics.conversionRate")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalBookings} / {metrics.totalViews} {t("bookingAnalytics.views")}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bookingAnalytics.totalBookings")}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">{t("bookingAnalytics.inSelectedPeriod")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bookingAnalytics.avgBookingValue")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.avgBookingValue.toFixed(3)} OMR</div>
                  <p className="text-xs text-muted-foreground">{t("bookingAnalytics.perBooking")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bookingAnalytics.cancellations")}</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalCancellations}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalBookings > 0
                      ? ((metrics.totalCancellations / metrics.totalBookings) * 100).toFixed(1)
                      : 0}
                    % {t("bookingAnalytics.cancellationRate")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Popular Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t("bookingAnalytics.popularTimeSlots")}
                </CardTitle>
                <CardDescription>{t("bookingAnalytics.popularTimeSlotsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.popularTimeSlots && metrics.popularTimeSlots.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.popularTimeSlots}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timeSlot" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookingCount" fill="#8884d8" name={t("bookingAnalytics.bookings")} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    {t("bookingAnalytics.noData")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cancellation Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {t("bookingAnalytics.cancellationReasons")}
                </CardTitle>
                <CardDescription>{t("bookingAnalytics.cancellationReasonsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.cancellationReasons && metrics.cancellationReasons.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={metrics.cancellationReasons}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.reason.substring(0, 20)}... (${entry.percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {metrics.cancellationReasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {metrics.cancellationReasons.map((reason, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{reason.reason}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">{reason.count}</div>
                            <div className="text-xs text-muted-foreground">{reason.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    {t("bookingAnalytics.noCancellations")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <TrendingUp className="h-5 w-5" />
                  {t("bookingAnalytics.recommendations")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.conversionRate < 10 && (
                  <div className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("bookingAnalytics.lowConversionTitle")}</p>
                      <p className="text-sm text-muted-foreground">{t("bookingAnalytics.lowConversionDesc")}</p>
                    </div>
                  </div>
                )}
                {metrics.totalCancellations / metrics.totalBookings > 0.2 && (
                  <div className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("bookingAnalytics.highCancellationTitle")}</p>
                      <p className="text-sm text-muted-foreground">{t("bookingAnalytics.highCancellationDesc")}</p>
                    </div>
                  </div>
                )}
                {metrics.popularTimeSlots && metrics.popularTimeSlots.length > 0 && (
                  <div className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <Clock className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t("bookingAnalytics.peakHoursTitle")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("bookingAnalytics.peakHoursDesc")}: {metrics.popularTimeSlots[0]?.timeSlot}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">{t("bookingAnalytics.noDataAvailable")}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
