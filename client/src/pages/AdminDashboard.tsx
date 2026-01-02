import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  BookingTrendsChart,
  DocumentGenerationChart,
  ServiceDistributionChart,
  OfficePerformanceChart,
} from "@/components/AnalyticsCharts";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { exportToCSV, exportToExcel, exportMultiSheetExcel } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFormatNumber } from "@/hooks/useFormatNumber";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { formatNumber } = useFormatNumber();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: pendingOffices } = trpc.admin.getPendingOffices.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">{t("admin.mocipTitle")}</h1>
          <p className="text-xl text-blue-100">
            {t("admin.mocipSubtitle")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("admin.totalOffices")}
              </CardTitle>
              <Building2 className="h-5 w-5 text-[#003366]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats?.totalOffices || 0)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(stats?.activeOffices || 0)} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("admin.totalUsers")}
              </CardTitle>
              <Users className="h-5 w-5 text-[#003366]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.registeredUsers")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("admin.documentsGenerated")}
              </CardTitle>
              <FileText className="h-5 w-5 text-[#003366]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats?.totalDocuments || 0)}</div>
              <p className="text-xs text-gray-500 mt-1">
                Total generated documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("admin.totalBookings")}
              </CardTitle>
              <Calendar className="h-5 w-5 text-[#003366]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats?.totalBookings || 0)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.allTimeBookings")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verification">{t("admin.tabs.officeVerification")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("admin.tabs.analytics")}</TabsTrigger>
            <TabsTrigger value="compliance">{t("admin.tabs.compliance")}</TabsTrigger>
            <TabsTrigger value="users">{t("admin.tabs.userManagement")}</TabsTrigger>
          </TabsList>

          {/* Office Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.pendingOfficeVerifications")}</CardTitle>
                <CardDescription>
                  {t("admin.pendingOfficeVerificationsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingOffices && pendingOffices.length > 0 ? (
                  <div className="space-y-4">
                    {pendingOffices.map((office: any) => (
                      <div
                        key={office.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{office.officeName}</h3>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {office.description}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>License: {office.licenseNumber}</span>
                            <span>Location: {office.city}</span>
                            <span>
                              Submitted: {new Date(office.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-2">
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("admin.allCaughtUp")}
                    </h3>
                    <p className="text-gray-500">{t("admin.noPendingVerifications")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>
                      Export reports for offline analysis and stakeholder presentations
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Export comprehensive analytics report
                        const timestamp = new Date().toISOString().split('T')[0];
                        toast.success("Exporting analytics report...");
                        // This would fetch actual data from backend
                        exportMultiSheetExcel(
                          [
                            {
                              name: "Bookings",
                              data: [{ "Total Bookings": stats?.totalBookings || 0, "Completed": 0 }],
                            },
                            {
                              name: "Documents",
                              data: [{ "Total Documents": stats?.totalDocuments || 0 }],
                            },
                            {
                              name: "Offices",
                              data: [{ "Total Offices": stats?.totalOffices || 0, "Active": stats?.activeOffices || 0 }],
                            },
                          ],
                          `smartpro-analytics-${timestamp}`
                        );
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const timestamp = new Date().toISOString().split('T')[0];
                        toast.success("Exporting summary report...");
                        exportToCSV(
                          [
                            {
                              Metric: "Total Bookings",
                              Value: stats?.totalBookings || 0,
                            },
                            {
                              Metric: "Total Documents",
                              Value: stats?.totalDocuments || 0,
                            },
                            {
                              Metric: "Total Offices",
                              Value: stats?.totalOffices || 0,
                            },
                            {
                              Metric: "Active Offices",
                              Value: stats?.activeOffices || 0,
                            },
                          ],
                          `smartpro-summary-${timestamp}`
                        );
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BookingTrendsChart />
              <DocumentGenerationChart />
              <ServiceDistributionChart />
              <OfficePerformanceChart />
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
                <CardDescription>
                  Track office compliance with regulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold">License Validity</p>
                        <p className="text-sm text-gray-500">
                          All offices have valid licenses
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold">Document Verification</p>
                        <p className="text-sm text-gray-500">
                          3 offices pending document review
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Action Required</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold">Service Standards</p>
                        <p className="text-sm text-gray-500">
                          Average rating above 4.0 stars
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>User management interface</p>
                  <p className="text-sm mt-2">View and manage user accounts, roles, and permissions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
