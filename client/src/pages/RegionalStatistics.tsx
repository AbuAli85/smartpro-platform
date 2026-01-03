import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, TrendingUp, AlertCircle, Building2, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#003366", "#0055AA", "#0077CC", "#4A90E2", "#7FB3D5", "#B4D7E9"];

const GOVERNORATE_NAMES: Record<string, { en: string; ar: string }> = {
  "Muscat": { en: "Muscat", ar: "مسقط" },
  "Dhofar": { en: "Dhofar", ar: "ظفار" },
  "Batinah North": { en: "Batinah North", ar: "الباطنة شمال" },
  "Batinah South": { en: "Batinah South", ar: "الباطنة جنوب" },
  "Sharqiyah North": { en: "Sharqiyah North", ar: "الشرقية شمال" },
  "Sharqiyah South": { en: "Sharqiyah South", ar: "الشرقية جنوب" },
  "Dakhliyah": { en: "Dakhliyah", ar: "الداخلية" },
  "Dhahirah": { en: "Dhahirah", ar: "الظاهرة" },
  "Buraimi": { en: "Buraimi", ar: "البريمي" },
  "Musandam": { en: "Musandam", ar: "مسندم" },
  "Wusta": { en: "Wusta", ar: "الوسطى" },
};

export default function RegionalStatistics() {
  const { t, language } = useLanguage();
  const { data: stats, isLoading } = trpc.admin.getRegionalStatistics.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {t("common.error")}
            </CardTitle>
            <CardDescription>{t("common.errorLoadingData")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const officeDistributionData = stats.officesByRegion.map((item: any) => ({
    name: language === "ar" ? GOVERNORATE_NAMES[item.governorate]?.ar || item.governorate : GOVERNORATE_NAMES[item.governorate]?.en || item.governorate,
    offices: item.count,
    percentage: ((item.count / stats.totalOffices) * 100).toFixed(1),
  }));

  const bookingTrendsData = stats.bookingsByRegion.map((item) => ({
    name: language === "ar" ? GOVERNORATE_NAMES[item.governorate]?.ar || item.governorate : GOVERNORATE_NAMES[item.governorate]?.en || item.governorate,
    bookings: item.count,
    revenue: item.revenue || 0,
  }));

  const serviceDemandData = stats.servicesByRegion.slice(0, 10).map((item) => ({
    service: item.serviceName,
    demand: item.count,
    governorate: language === "ar" ? GOVERNORATE_NAMES[item.governorate]?.ar || item.governorate : GOVERNORATE_NAMES[item.governorate]?.en || item.governorate,
  }));

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {t("regionalStats.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("regionalStats.subtitle")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("regionalStats.totalOffices")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOffices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("regionalStats.acrossRegions").replace("{count}", stats.officesByRegion.length.toString())}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("regionalStats.totalBookings")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("regionalStats.allRegions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("regionalStats.totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalRevenue.toLocaleString()} {t("common.currency")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("regionalStats.combinedRevenue")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("regionalStats.topRegion")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {language === "ar" 
                ? GOVERNORATE_NAMES[stats.topRegion]?.ar || stats.topRegion
                : GOVERNORATE_NAMES[stats.topRegion]?.en || stats.topRegion}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("regionalStats.byBookings")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Office Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("regionalStats.officeDistribution")}
          </CardTitle>
          <CardDescription>
            {t("regionalStats.officeDistributionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={officeDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="offices" fill="#003366" name={t("regionalStats.offices")} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Booking Trends and Revenue */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("regionalStats.bookingTrends")}</CardTitle>
            <CardDescription>
              {t("regionalStats.bookingTrendsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingTrendsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.bookings}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="bookings"
                >
                  {bookingTrendsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("regionalStats.revenueByRegion")}</CardTitle>
            <CardDescription>
              {t("regionalStats.revenueByRegionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0055AA" name={t("regionalStats.revenue")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Demand */}
      <Card>
        <CardHeader>
          <CardTitle>{t("regionalStats.serviceDemand")}</CardTitle>
          <CardDescription>
            {t("regionalStats.serviceDemandDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceDemandData.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{item.service}</div>
                  <div className="text-sm text-muted-foreground">{item.governorate}</div>
                </div>
                <Badge variant="secondary">{item.demand} {t("regionalStats.requests")}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Underserved Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            {t("regionalStats.underservedAreas")}
          </CardTitle>
          <CardDescription>
            {t("regionalStats.underservedAreasDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.underservedAreas.map((area: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {language === "ar" 
                      ? GOVERNORATE_NAMES[area.governorate]?.ar || area.governorate
                      : GOVERNORATE_NAMES[area.governorate]?.en || area.governorate}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {area.officeCount} {t("regionalStats.offices")}
                  </div>
                </div>
                <Badge variant="destructive">
                  {t("regionalStats.needsExpansion")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
