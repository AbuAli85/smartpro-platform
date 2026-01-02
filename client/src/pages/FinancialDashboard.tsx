import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function FinancialDashboard() {
  const { t } = useLanguage();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const [paymentStatus, setPaymentStatus] = useState<"completed" | "pending" | "cancelled" | "all">("all");

  // Fetch offices
  const { data: offices, isLoading: officesLoading } = trpc.officeOwner.getMyOffices.useQuery();
  const officeId = selectedOfficeId || offices?.[0]?.id;

  // Fetch financial data
  const { data: overview } = trpc.financialManagement.getFinancialOverview.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  const { data: payments } = trpc.financialManagement.getPaymentHistory.useQuery(
    { officeId: officeId!, status: paymentStatus, limit: 50 },
    { enabled: !!officeId }
  );

  const { data: trends } = trpc.financialManagement.getRevenueTrends.useQuery(
    { officeId: officeId!, period: selectedPeriod },
    { enabled: !!officeId }
  );

  const { data: servicePricing } = trpc.financialManagement.getServicePricing.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  // Export report mutation
  const exportReport = trpc.financialManagement.exportFinancialReport.useMutation({
    onSuccess: (data) => {
      // Convert data to CSV
      if (data.format === "csv") {
        const csv = convertToCSV(data.data);
        downloadCSV(csv, `financial-report-${data.period.startDate}-${data.period.endDate}.csv`);
        toast.success("Report exported successfully");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return "";
    
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    if (!officeId) return;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    exportReport.mutate({
      officeId,
      startDate,
      endDate,
      format: "csv",
    });
  };

  if (officesLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!offices || offices.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Offices Found</CardTitle>
            <CardDescription>
              You don't have any registered offices yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your revenue, payments, and financial performance
          </p>
        </div>

        <div className="flex gap-2">
          {offices.length > 1 && (
            <Select
              value={officeId?.toString()}
              onValueChange={(value) => setSelectedOfficeId(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id.toString()}>
                    {office.officeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleExportReport} disabled={exportReport.isPending}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalRevenue.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">
                From {overview.completedBookings} completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pendingRevenue.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">
                From {overview.pendingBookings} confirmed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.completedBookings > 0
                  ? (overview.totalRevenue / overview.completedBookings).toFixed(2)
                  : "0.00"} OMR
              </div>
              <p className="text-xs text-muted-foreground">
                Per completed booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Last 30 Days</div>
              <p className="text-xs text-muted-foreground">
                {new Date(overview.period.startDate).toLocaleDateString()} - {new Date(overview.period.endDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="services">Service Analysis</TabsTrigger>
        </TabsList>

        {/* Revenue Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {trends && trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (OMR)" />
                    <Line type="monotone" dataKey="bookingCount" stroke="#82ca9d" name="Bookings" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No trend data available</p>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Service */}
          {overview && overview.revenueByService.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>Distribution of revenue across services</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overview.revenueByService}
                      dataKey="revenue"
                      nameKey="serviceName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {overview.revenueByService.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All transactions and bookings</CardDescription>
              </div>
              <Select value={paymentStatus} onValueChange={(value: any) => setPaymentStatus(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {payments && payments.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.customerEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.serviceDescription}</TableCell>
                        <TableCell>
                          {payment.scheduledDate 
                            ? new Date(payment.scheduledDate).toLocaleDateString()
                            : new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{payment.price} OMR</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No payments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Analysis Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Revenue and booking statistics by service</CardDescription>
            </CardHeader>
            <CardContent>
              {servicePricing && servicePricing.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total Bookings</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Conversion Rate</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicePricing.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.serviceName}</div>
                            {service.serviceNameAr && (
                              <div className="text-sm text-muted-foreground">{service.serviceNameAr}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{service.price} OMR</TableCell>
                        <TableCell>{service.totalBookings}</TableCell>
                        <TableCell>{service.completedBookings}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {service.conversionRate.toFixed(1)}%
                            {service.conversionRate >= 70 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{service.totalRevenue.toFixed(2)} OMR</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No service data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
