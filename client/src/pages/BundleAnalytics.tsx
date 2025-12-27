import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Award,
  Percent,
  BarChart3,
} from "lucide-react";

export default function BundleAnalytics() {
  // Get user's office
  const { data: userOffices } = trpc.sanadOffice.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Fetch bundles
  const { data: bundles, isLoading } = trpc.serviceBundle.getOfficeBundles.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  if (!officeId) {
    return (
      <div className="container py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Office Found</h3>
            <p className="text-muted-foreground">Please register your office first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate analytics
  const calculateAnalytics = () => {
    if (!bundles || bundles.length === 0) {
      return {
        totalBundles: 0,
        activeBundles: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        avgSavings: 0,
        conversionRate: 0,
        topBundle: null,
      };
    }

    const activeBundles = bundles.filter((b: any) => b.isActive);
    const totalPurchases = bundles.reduce((sum: number, b: any) => sum + (b.purchaseCount || 0), 0);
    const totalRevenue = bundles.reduce(
      (sum: number, b: any) => sum + (b.purchaseCount || 0) * parseFloat(b.discountedPrice || "0"),
      0
    );
    const totalOriginalPrice = bundles.reduce(
      (sum: number, b: any) => sum + (b.purchaseCount || 0) * parseFloat(b.originalPrice || "0"),
      0
    );
    const avgSavings = totalOriginalPrice > 0 ? ((totalOriginalPrice - totalRevenue) / totalOriginalPrice) * 100 : 0;

    // Find top performing bundle
    const topBundle = bundles.reduce((top: any, current: any) => {
      const currentPurchases = current.purchaseCount || 0;
      const topPurchases = top?.purchaseCount || 0;
      return currentPurchases > topPurchases ? current : top;
    }, null);

    return {
      totalBundles: bundles.length,
      activeBundles: activeBundles.length,
      totalPurchases,
      totalRevenue,
      avgSavings,
      conversionRate: 0, // TODO: Calculate from views/purchases
      topBundle,
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bundle Analytics</h1>
        <p className="text-muted-foreground">
          Track performance and revenue impact of your service bundles
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bundles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <span className="text-3xl font-bold">{analytics.totalBundles}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.activeBundles} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold">{analytics.totalPurchases}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bundle Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div>
                <span className="text-3xl font-bold">
                  {analytics.totalRevenue.toLocaleString()} OMR
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Customer Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-8 w-8 text-blue-600" />
              <span className="text-3xl font-bold">{analytics.avgSavings.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Bundle */}
      {analytics.topBundle && (
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              <CardTitle>Top Performing Bundle</CardTitle>
            </div>
            <CardDescription>Your most popular package deal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">{analytics.topBundle.name}</h3>
                <p className="text-muted-foreground mb-4">{analytics.topBundle.description}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {analytics.topBundle.purchaseCount || 0} purchases
                  </Badge>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {analytics.topBundle.discountPercentage}% off
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Original Price:</span>
                  <span className="text-lg line-through">
                    {parseFloat(analytics.topBundle.originalPrice).toFixed(3)} OMR
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bundle Price:</span>
                  <span className="text-2xl font-bold text-primary">
                    {parseFloat(analytics.topBundle.discountedPrice).toFixed(3)} OMR
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="text-xl font-semibold text-green-600">
                    {(
                      (analytics.topBundle.purchaseCount || 0) *
                      parseFloat(analytics.topBundle.discountedPrice)
                    ).toFixed(3)}{" "}
                    OMR
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bundle Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Bundle Performance Breakdown</CardTitle>
          </div>
          <CardDescription>Detailed metrics for each bundle</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading bundles...</div>
          ) : !bundles || bundles.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bundles Yet</h3>
              <p className="text-muted-foreground">
                Create service bundles to start tracking analytics
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Bundle Name</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Services</th>
                    <th className="text-right py-3 px-4 font-semibold">Discount</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Purchases</th>
                    <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {bundles.map((bundle: any) => {
                    const purchases = bundle.purchaseCount || 0;
                    const revenue = purchases * parseFloat(bundle.discountedPrice || "0");
                    const originalTotal = purchases * parseFloat(bundle.originalPrice || "0");
                    const savings = originalTotal - revenue;

                    return (
                      <tr key={bundle.id} className="border-b hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold">{bundle.name}</p>
                            <p className="text-sm text-muted-foreground">{bundle.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant={bundle.isActive ? "default" : "secondary"}>
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline">{bundle.serviceCount || 0} services</Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-primary">
                            {bundle.discountPercentage}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div>
                            <p className="font-semibold">
                              {parseFloat(bundle.discountedPrice).toFixed(3)} OMR
                            </p>
                            <p className="text-xs text-muted-foreground line-through">
                              {parseFloat(bundle.originalPrice).toFixed(3)} OMR
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{purchases}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-green-600">
                            {revenue.toFixed(3)} OMR
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-muted-foreground">
                            {savings.toFixed(3)} OMR
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Bundle Strategy Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Bundles with 20-30% discounts typically see the highest conversion rates
            </li>
            <li>
              • Customers save an average of {analytics.avgSavings.toFixed(1)}% when purchasing
              bundles
            </li>
            <li>
              • Consider creating bundles for frequently requested service combinations
            </li>
            <li>
              • Limited-time bundles with validity periods create urgency and boost sales
            </li>
            <li>
              • Bundle analytics help identify which services work well together
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
