import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, Building2, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  // Calculate date ranges
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);

    return {
      startDate: start,
      endDate: end,
    };
  }, [timeRange]);

  // Fetch admin analytics data
  const { data: platformHealth, isLoading: healthLoading } = trpc.adminAnalytics.platformHealth.useQuery();

  const { data: officePerformance, isLoading: officeLoading } = trpc.adminAnalytics.officePerformance.useQuery({
    startDate,
    endDate,
    limit: 10,
  });

  const { data: userGrowth, isLoading: userGrowthLoading } = trpc.adminAnalytics.userGrowth.useQuery({
    startDate,
    endDate,
    groupBy,
  });

  const { data: revenueByGov, isLoading: revenueLoading } = trpc.adminAnalytics.revenueByGovernorate.useQuery({
    startDate,
    endDate,
  });

  // Prepare chart data
  const userGrowthData = useMemo(() => {
    if (!userGrowth) return null;

    return {
      labels: userGrowth.map((item) => item.period),
      datasets: [
        {
          label: "New Users",
          data: userGrowth.map((item) => item.newUsers),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
        },
      ],
    };
  }, [userGrowth]);

  const revenueByGovData = useMemo(() => {
    if (!revenueByGov) return null;

    return {
      labels: revenueByGov.map((item) => item.governorate),
      datasets: [
        {
          label: "Revenue (OMR)",
          data: revenueByGov.map((item) => parseFloat(item.totalRevenue)),
          backgroundColor: [
            "rgba(99, 102, 241, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(20, 184, 166, 0.8)",
          ],
        },
      ],
    };
  }, [revenueByGov]);

  const isLoading = healthLoading || officeLoading || userGrowthLoading || revenueLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Admin Analytics" }]} className="mb-6" />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor platform health, office performance, and user growth
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
            {[...Array(6)].map((_, i) => (
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
            {/* Platform Health Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformHealth?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Offices</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformHealth?.activeOffices || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {platformHealth?.pendingOffices || 0} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformHealth?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {platformHealth?.completedBookings || 0} completed
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {platformHealth && platformHealth.totalBookings > 0
                      ? ((platformHealth.completedBookings / platformHealth.totalBookings) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Of all bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {userGrowthData && (
                    <Line
                      data={userGrowthData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
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

              {/* Revenue by Governorate */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Governorate</CardTitle>
                  <CardDescription>Revenue distribution across regions</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueByGovData && (
                    <Pie
                      data={revenueByGovData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        plugins: {
                          legend: {
                            position: "right" as const,
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Office Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Offices</CardTitle>
                <CardDescription>Office performance metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Office Name</TableHead>
                      <TableHead>Governorate</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Revenue (OMR)</TableHead>
                      <TableHead className="text-right">Avg Rating</TableHead>
                      <TableHead className="text-right">Completion %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officePerformance && officePerformance.length > 0 ? (
                      officePerformance.map((office) => (
                        <TableRow key={office.officeId}>
                          <TableCell className="font-medium">{office.officeName}</TableCell>
                          <TableCell>{office.governorate}</TableCell>
                          <TableCell className="text-right">{office.totalBookings}</TableCell>
                          <TableCell className="text-right">{office.completedBookings}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(office.totalRevenue).toFixed(3)}
                          </TableCell>
                          <TableCell className="text-right">
                            {parseFloat(office.averageRating).toFixed(1)} ({office.totalReviews})
                          </TableCell>
                          <TableCell className="text-right">{office.completionRate}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No data available for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
