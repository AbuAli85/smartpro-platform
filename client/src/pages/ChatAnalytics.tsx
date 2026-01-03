import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Clock, MessageCircle, CheckCircle, TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChatAnalytics() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const startDate = new Date();
  if (dateRange === "7d") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (dateRange === "30d") {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setDate(startDate.getDate() - 90);
  }

  const { data: analytics, isLoading } = trpc.chatAnalytics.getAnalytics.useQuery({
    startDate,
    endDate: new Date(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const busiestHoursData = {
    labels: analytics.busiestHours.map((h) => `${h.hour}:00`),
    datasets: [
      {
        label: "Messages",
        data: analytics.busiestHours.map((h) => h.count),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your chat performance and customer engagement
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={dateRange === "7d" ? "default" : "outline"}
            onClick={() => setDateRange("7d")}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === "30d" ? "default" : "outline"}
            onClick={() => setDateRange("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === "90d" ? "default" : "outline"}
            onClick={() => setDateRange("90d")}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active chat conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.resolutionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.closedConversations} of {analytics.totalConversations} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResponseTimeMinutes}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.busiestHours[0]?.hour || 0}:00
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Busiest hour of the day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Busiest Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Message Activity by Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={busiestHoursData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
