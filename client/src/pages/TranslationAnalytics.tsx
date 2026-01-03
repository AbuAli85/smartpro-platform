import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Trophy,
  Activity,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function TranslationAnalytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [trendGroupBy, setTrendGroupBy] = useState<"day" | "week" | "month">("day");

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (timeRange) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [timeRange]);

  // Fetch analytics data
  const { data: stats } = trpc.translationAnalytics.getStatisticsSummary.useQuery();
  const { data: trends } = trpc.translationAnalytics.getCompletionTrends.useQuery({
    startDate,
    endDate,
    groupBy: trendGroupBy,
  });
  const { data: leaderboard } = trpc.translationAnalytics.getTranslatorLeaderboard.useQuery({
    startDate,
    endDate,
    limit: 10,
  });
  const { data: recentActivity } = trpc.translationAnalytics.getRecentActivity.useQuery({
    limit: 20,
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Translation Analytics</h1>
        <p className="text-muted-foreground">
          Track translation progress, trends, and translator performance
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === "7d" ? "default" : "outline"}
          onClick={() => setTimeRange("7d")}
        >
          Last 7 Days
        </Button>
        <Button
          variant={timeRange === "30d" ? "default" : "outline"}
          onClick={() => setTimeRange("30d")}
        >
          Last 30 Days
        </Button>
        <Button
          variant={timeRange === "90d" ? "default" : "outline"}
          onClick={() => setTimeRange("90d")}
        >
          Last 90 Days
        </Button>
      </div>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallCompletion.percentage}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.overallCompletion.complete} of {stats.overallCompletion.total} items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Office Translations</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.offices.complete}</div>
              <p className="text-xs text-muted-foreground">
                {stats.offices.partial} partial, {stats.offices.missing} missing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Template Translations</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templates.complete}</div>
              <p className="text-xs text-muted-foreground">
                {stats.templates.partial} partial, {stats.templates.missing} missing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivityCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingRequests} pending requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Translation Completion Trends</CardTitle>
                  <CardDescription>Track translation activity over time</CardDescription>
                </div>
                <Select value={trendGroupBy} onValueChange={(v: any) => setTrendGroupBy(v)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {trends && trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalTranslations"
                      stroke="#8884d8"
                      name="Total Translations"
                    />
                    <Line
                      type="monotone"
                      dataKey="officeTranslations"
                      stroke="#82ca9d"
                      name="Offices"
                    />
                    <Line
                      type="monotone"
                      dataKey="templateTranslations"
                      stroke="#ffc658"
                      name="Templates"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No translation activity in this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translator Leaderboard</CardTitle>
              <CardDescription>Top contributors to translation efforts</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((translator: any, index: number) => (
                    <div
                      key={translator.translatorId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {index < 3 ? (
                            <Trophy
                              className={`h-5 w-5 ${
                                index === 0
                                  ? "text-yellow-500"
                                  : index === 1
                                  ? "text-gray-400"
                                  : "text-orange-600"
                              }`}
                            />
                          ) : (
                            <span className="font-bold text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{translator.translatorName}</div>
                          <div className="text-sm text-muted-foreground">
                            Last active{" "}
                            {formatDistanceToNow(new Date(translator.lastActivity), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{translator.totalTranslations}</div>
                        <div className="text-xs text-muted-foreground">
                          {translator.officeTranslations} offices, {translator.templateTranslations}{" "}
                          templates
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No translation activity in this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Translation Activity</CardTitle>
              <CardDescription>Latest translation updates across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-1">
                        {activity.entityType === "office" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.translatorName}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.actionType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.entityType === "office" ? "Office" : "Template"}:{" "}
                          <span className="font-medium">{activity.entityName}</span>
                        </div>
                        {activity.source && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {activity.source}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No recent translation activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
