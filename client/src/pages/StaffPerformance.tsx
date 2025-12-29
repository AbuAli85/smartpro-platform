import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Clock, CheckCircle, MessageSquare, Award } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StaffPerformance() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  
  // Get user's office
  const { data: userOffices } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Get performance metrics
  const { data: metrics, isLoading } = trpc.chatAssignment.getPerformanceMetrics.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Get performance trends
  const { data: trends } = trpc.chatAssignment.getPerformanceTrends.useQuery(
    { officeId: officeId!, days: dateRange },
    { enabled: !!officeId }
  );
  
  // Get satisfaction trends
  const { data: satisfactionTrends } = trpc.chatRatings.getSatisfactionTrends.useQuery(
    { days: dateRange },
    { enabled: !!officeId }
  );

  // Calculate team averages
  const teamStats = metrics
    ? {
        totalConversations: metrics.reduce((sum, m) => sum + m.totalConversations, 0),
        avgResponseTime: Math.round(
          metrics.reduce((sum, m) => sum + m.avgResponseTimeMinutes, 0) / metrics.length
        ),
        avgResolutionRate: Math.round(
          metrics.reduce((sum, m) => sum + m.resolutionRate, 0) / metrics.length
        ),
        activeConversations: metrics.reduce((sum, m) => sum + m.activeConversations, 0),
      }
    : null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "manager":
        return "secondary";
      case "agent":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPerformanceBadge = (value: number, type: "response" | "resolution") => {
    if (type === "response") {
      // Lower is better for response time
      if (value <= 5) return { variant: "default" as const, label: "Excellent" };
      if (value <= 15) return { variant: "secondary" as const, label: "Good" };
      return { variant: "outline" as const, label: "Needs Improvement" };
    } else {
      // Higher is better for resolution rate
      if (value >= 80) return { variant: "default" as const, label: "Excellent" };
      if (value >= 60) return { variant: "secondary" as const, label: "Good" };
      return { variant: "outline" as const, label: "Needs Improvement" };
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("pages.staffPerformance")}</h1>
          <p className="text-muted-foreground">
            {t("pages.staffPerformanceDesc")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Team Overview Cards */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{teamStats.totalConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                  <p className="text-2xl font-bold">{teamStats.activeConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{teamStats.avgResponseTime}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold">{teamStats.avgResolutionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Trends Charts */}
      {trends && trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Response Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Time Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value} min`, 'Avg Response Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resolution Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resolution Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResolutionRate" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Satisfaction Trend Chart */}
      {satisfactionTrends && satisfactionTrends.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer Satisfaction Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                  domain={[0, 5]}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value.toFixed(2)} stars`, 'Avg Satisfaction']}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Average satisfaction score over the past {dateRange} days
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Individual Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && metrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Total Chats</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Closed</TableHead>
                  <TableHead className="text-center">Avg Response Time</TableHead>
                  <TableHead className="text-center">Resolution Rate</TableHead>
                  <TableHead className="text-center">Satisfaction</TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => {
                  const responseBadge = getPerformanceBadge(
                    metric.avgResponseTimeMinutes,
                    "response"
                  );
                  const resolutionBadge = getPerformanceBadge(
                    metric.resolutionRate,
                    "resolution"
                  );

                  return (
                    <TableRow key={metric.staffId}>
                      <TableCell className="font-medium">{metric.userName}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(metric.role)}>
                          {metric.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{metric.totalConversations}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{metric.activeConversations}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{metric.closedConversations}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{metric.avgResponseTimeMinutes}m</span>
                          <Badge variant={responseBadge.variant} className="text-xs">
                            {responseBadge.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{metric.resolutionRate}%</span>
                          <Badge variant={resolutionBadge.variant} className="text-xs">
                            {resolutionBadge.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {metric.avgSatisfaction ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-2xl">⭐</span>
                              <span className="font-medium">{metric.avgSatisfaction.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({metric.totalRatings} ratings)</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No ratings</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {metric.avgResponseTimeMinutes <= 10 && metric.resolutionRate >= 70 ? (
                          <Badge variant="default" className="gap-1">
                            <Award className="h-3 w-3" />
                            Top Performer
                          </Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t("empty.noPerformanceData")}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("empty.noPerformanceDataDesc")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {metrics && metrics.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics
                .filter((m) => m.avgResponseTimeMinutes <= 5)
                .map((m) => (
                  <div key={m.staffId} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        {m.userName} has excellent response time
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Average response time of {m.avgResponseTimeMinutes} minutes is outstanding
                      </p>
                    </div>
                  </div>
                ))}

              {metrics
                .filter((m: any) => m.resolutionRate >= 80)
                .map((m: any) => (
                  <div key={m.staffId} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {m.userName} has high resolution rate
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {m.resolutionRate}% of conversations successfully resolved
                      </p>
                    </div>
                  </div>
                ))}

              {metrics
                .filter((m: any) => m.avgResponseTimeMinutes > 20)
                .map((m: any) => (
                  <div key={m.staffId} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        {m.userName} could improve response time
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Consider workload balancing or additional training
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
