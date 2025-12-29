import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock, Package } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useLanguage } from "@/contexts/LanguageContext";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  // Calculate date ranges
  const { startDate, endDate, previousPeriodStartDate, previousPeriodEndDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - days);

    return {
      startDate: start,
      endDate: end,
      previousPeriodStartDate: prevStart,
      previousPeriodEndDate: prevEnd,
    };
  }, [timeRange]);

  // Fetch analytics data
  const { data: bookingTrends, isLoading: trendsLoading } = trpc.analytics.bookingTrends.useQuery({
    startDate,
    endDate,
    groupBy,
  });

  const { data: popularServices, isLoading: servicesLoading } = trpc.analytics.popularServices.useQuery({
    startDate,
    endDate,
    limit: 10,
  });

  const { data: peakTimes, isLoading: timesLoading } = trpc.analytics.peakTimes.useQuery({
    startDate,
    endDate,
  });

  const { data: revenueMetrics, isLoading: metricsLoading } = trpc.analytics.revenueMetrics.useQuery({
    startDate,
    endDate,
    previousPeriodStartDate,
    previousPeriodEndDate,
  });

  // Prepare chart data
  const bookingTrendsData = useMemo(() => {
    if (!bookingTrends) return null;

    return {
      labels: bookingTrends.map((item) => item.period),
      datasets: [
        {
          label: "Total Bookings",
          data: bookingTrends.map((item) => item.totalBookings),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
        },
        {
          label: "Confirmed",
          data: bookingTrends.map((item) => item.confirmedBookings),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
        {
          label: "Completed",
          data: bookingTrends.map((item) => item.completedBookings),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };
  }, [bookingTrends]);

  const popularServicesData = useMemo(() => {
    if (!popularServices) return null;

    return {
      labels: popularServices.map((item) => item.serviceName),
      datasets: [
        {
          label: "Number of Bookings",
          data: popularServices.map((item) => item.bookingCount),
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(20, 184, 166, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
        },
      ],
    };
  }, [popularServices]);

  const peakTimesData = useMemo(() => {
    if (!peakTimes) return null;

    // Fill in missing hours with 0
    const hourlyData = Array(24).fill(0);
    peakTimes.forEach((item) => {
      hourlyData[item.hour] = item.bookingCount;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Bookings by Hour",
          data: hourlyData,
          backgroundColor: "rgba(99, 102, 241, 0.8)",
        },
      ],
    };
  }, [peakTimes]);

  const isLoading = trendsLoading || servicesLoading || timesLoading || metricsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Analytics" }]} className="mb-6" />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t("pages.analyticsDashboard")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("pages.analyticsDashboardDesc")}
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">By Day</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("analytics.totalRevenue")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics?.currentRevenue.toFixed(3)} OMR
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {revenueMetrics && revenueMetrics.growthPercentage >= 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">
                          +{revenueMetrics.growthPercentage.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">
                          {revenueMetrics?.growthPercentage.toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span>from previous period</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{revenueMetrics?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {revenueMetrics?.completedBookings || 0} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics?.averageBookingValue.toFixed(3)} OMR
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per booking</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics && revenueMetrics.totalBookings > 0
                      ? ((revenueMetrics.completedBookings / revenueMetrics.totalBookings) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Of all bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Booking Trends */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>{t("analytics.bookingTrends")}</CardTitle>
                  <CardDescription>{t("analytics.bookingTrendsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingTrendsData && (
                    <Line
                      data={bookingTrendsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 2.5,
                        plugins: {
                          legend: {
                            position: "top" as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Popular Services */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics.popularServices")}</CardTitle>
                  <CardDescription>{t("analytics.popularServicesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {popularServicesData && (
                    <Bar
                      data={popularServicesData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.2,
                        indexAxis: "y" as const,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Peak Booking Times */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Booking Times</CardTitle>
                  <CardDescription>Bookings by hour of day</CardDescription>
                </CardHeader>
                <CardContent>
                  {peakTimesData && (
                    <Bar
                      data={peakTimesData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.2,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0,
                            },
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
