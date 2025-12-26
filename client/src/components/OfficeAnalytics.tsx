import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Calendar, DollarSign, Star, TrendingUp, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateOfficeReport } from "@/utils/generateOfficeReport";

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

interface OfficeAnalyticsProps {
  officeId: number;
}

export function OfficeAnalytics({ officeId }: OfficeAnalyticsProps) {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");
  
  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const { data: analytics, isLoading } = trpc.sanadOffice.getAnalytics.useQuery({
    officeId,
    ...getDateRange(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const dailyBookingsData = {
    labels: (analytics.dailyBookings || []).map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Bookings",
        data: (analytics.dailyBookings || []).map((d) => d.count),
        borderColor: "rgb(0, 51, 102)",
        backgroundColor: "rgba(0, 51, 102, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const statusBreakdownData = {
    labels: (analytics.statusBreakdown || []).map((s) => 
      s.status.charAt(0).toUpperCase() + s.status.slice(1)
    ),
    datasets: [
      {
        data: (analytics.statusBreakdown || []).map((s) => s.count),
        backgroundColor: [
          "rgba(255, 206, 86, 0.8)",  // pending - yellow
          "rgba(75, 192, 192, 0.8)",  // confirmed - teal
          "rgba(54, 162, 235, 0.8)",  // in_progress - blue
          "rgba(76, 175, 80, 0.8)",   // completed - green
          "rgba(255, 99, 132, 0.8)",  // cancelled - red
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(76, 175, 80, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const popularServicesData = {
    labels: (analytics.popularServices || []).map((s) => 
      (s.service || "").length > 30 ? (s.service || "").substring(0, 30) + "..." : (s.service || "")
    ),
    datasets: [
      {
        label: "Bookings",
        data: (analytics.popularServices || []).map((s) => s.count),
        backgroundColor: "rgba(0, 51, 102, 0.8)",
        borderColor: "rgba(0, 51, 102, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleDownloadReport = () => {
    if (!analytics) return;

    const periodLabels = {
      week: "Last 7 Days",
      month: "This Month",
      year: "This Year",
    };

    generateOfficeReport({
      officeName: "Office Name", // You can pass this as a prop
      period: periodLabels[dateRange],
      metrics: {
        totalBookings: analytics.totalBookings || 0,
        confirmedBookings: analytics.statusBreakdown?.find(s => s.status === 'confirmed')?.count || 0,
        completedBookings: analytics.statusBreakdown?.find(s => s.status === 'completed')?.count || 0,
        cancelledBookings: analytics.statusBreakdown?.find(s => s.status === 'cancelled')?.count || 0,
        totalRevenue: analytics.revenue || 0,
        averageRating: analytics.averageRating || 0,
        totalReviews: analytics.totalReviews || 0,
      },
      bookingTrends: (analytics.dailyBookings || []).map((d) => ({
        month: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: d.count,
      })),
      popularServices: (analytics.popularServices || []).map((s) => ({
        service: s.service || "Unknown",
        count: s.count,
      })),
      customerFeedback: [], // You can fetch recent reviews if needed
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector and Download Button */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadReport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <div className="flex gap-2">
        <Button
          variant={dateRange === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("week")}
        >
          Last 7 Days
        </Button>
        <Button
          variant={dateRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("month")}
        >
          This Month
        </Button>
        <Button
          variant={dateRange === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setDateRange("year")}        >
          This Year
        </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "week" ? "Last 7 days" : dateRange === "month" ? "This month" : "This year"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.revenue || 0).toFixed(3)} OMR
            </div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.averageRating || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {analytics.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.totalBookings || 0) > 0
                ? (
                    (((analytics.statusBreakdown || []).find((s) => s.status === "completed")?.count || 0) /
                      (analytics.totalBookings || 1)) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Bookings completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Daily bookings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={dailyBookingsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut
                data={statusBreakdownData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Services */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Services</CardTitle>
          <CardDescription>Most requested services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={popularServicesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
