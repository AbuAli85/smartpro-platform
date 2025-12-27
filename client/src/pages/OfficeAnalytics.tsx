import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Star } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
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
  Filler,
} from "chart.js";

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
  Filler
);

type TimePeriod = "7days" | "30days" | "90days" | "1year";

export default function OfficeAnalytics() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");

  const { data: analytics, isLoading } = trpc.officeOwner.getOfficeAnalytics.useQuery({
    period: timePeriod,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${analytics?.totalRevenue?.toLocaleString() || 0}`,
      change: analytics?.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Bookings",
      value: analytics?.totalBookings || 0,
      change: analytics?.bookingsChange || 0,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Active Customers",
      value: analytics?.activeCustomers || 0,
      change: analytics?.customersChange || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: analytics?.averageRating?.toFixed(1) || "0.0",
      change: analytics?.ratingChange || 0,
      icon: Star,
      color: "text-yellow-600",
    },
  ];

  const bookingTrendsData = {
    labels: analytics?.bookingTrends?.map((d: any) => d.date) || [],
    datasets: [
      {
        label: "Bookings",
        data: analytics?.bookingTrends?.map((d: any) => d.count) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueTrendsData = {
    labels: analytics?.revenueTrends?.map((d: any) => d.date) || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: analytics?.revenueTrends?.map((d: any) => d.amount) || [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const popularServicesData = {
    labels: analytics?.popularServices?.map((s: any) => s.serviceName) || [],
    datasets: [
      {
        label: "Bookings",
        data: analytics?.popularServices?.map((s: any) => s.bookings) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
      },
    ],
  };

  const chartOptions = {
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
      },
    },
  };

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your office performance and growth</p>
        </div>
        <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(kpi.change)}%
                  </span>
                  <span className="ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Number of bookings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Line data={bookingTrendsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Revenue generated over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Line data={revenueTrendsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Services */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Services</CardTitle>
          <CardDescription>Top performing services by booking count</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: "300px" }}>
            <Bar data={popularServicesData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Detailed breakdown of each service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-right p-2">Bookings</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.popularServices?.map((service: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{service.serviceName}</td>
                    <td className="text-right p-2">{service.bookings}</td>
                    <td className="text-right p-2">${service.revenue?.toLocaleString()}</td>
                    <td className="text-right p-2 flex items-center justify-end gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {service.rating?.toFixed(1) || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
