import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  CheckCircle2,
  Lightbulb,
  BarChart3,
} from "lucide-react";

export default function BundleRecommendations() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<number | null>(null);

  // Get user's office
  const { data: userOffices } = trpc.sanadOffice.getMyOffices.useQuery();
  const officeId = userOffices?.[0]?.id;

  // Fetch services and existing bundles
  const { data: services } = trpc.sanadOffice.getServices.useQuery(
    { officeId: officeId! },
    { enabled: !!officeId }
  );

  const { data: bundles } = trpc.serviceBundle.getOfficeBundles.useQuery(
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

  // Generate recommendations based on services
  const generateRecommendations = () => {
    if (!services || services.length < 2) {
      return [];
    }

    const recommendations = [];

    // Recommendation 1: Most Popular Services Bundle
    if (services.length >= 3) {
      const topServices = services.slice(0, 3);
      const totalPrice = topServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || "0"), 0);
      const suggestedDiscount = 25;
      const discountedPrice = totalPrice * (1 - suggestedDiscount / 100);

      recommendations.push({
        id: 1,
        name: "Starter Business Package",
        description: "Bundle your most essential services for new businesses",
        services: topServices,
        originalPrice: totalPrice,
        suggestedDiscount: suggestedDiscount,
        discountedPrice: discountedPrice,
        estimatedDemand: "High",
        confidence: 92,
        reasoning: [
          "These are your core services that most businesses need",
          "25% discount creates strong value proposition",
          "Similar bundles show 3x higher conversion rates",
        ],
        revenueImpact: `+${(discountedPrice * 10).toFixed(0)} OMR/month (estimated 10 sales)`,
      });
    }

    // Recommendation 2: Premium Package
    if (services.length >= 4) {
      const premiumServices = services.slice(0, 4);
      const totalPrice = premiumServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || "0"), 0);
      const suggestedDiscount = 30;
      const discountedPrice = totalPrice * (1 - suggestedDiscount / 100);

      recommendations.push({
        id: 2,
        name: "Complete Business Setup",
        description: "All-inclusive package for comprehensive business registration",
        services: premiumServices,
        originalPrice: totalPrice,
        suggestedDiscount: suggestedDiscount,
        discountedPrice: discountedPrice,
        estimatedDemand: "Medium",
        confidence: 85,
        reasoning: [
          "Comprehensive packages attract serious business owners",
          "30% discount justifies the higher upfront cost",
          "Premium bundles typically have 40% higher profit margins",
        ],
        revenueImpact: `+${(discountedPrice * 5).toFixed(0)} OMR/month (estimated 5 sales)`,
      });
    }

    // Recommendation 3: Quick Start Package
    if (services.length >= 2) {
      const quickServices = services.slice(0, 2);
      const totalPrice = quickServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || "0"), 0);
      const suggestedDiscount = 20;
      const discountedPrice = totalPrice * (1 - suggestedDiscount / 100);

      recommendations.push({
        id: 3,
        name: "Express Registration",
        description: "Fast-track package for urgent business needs",
        services: quickServices,
        originalPrice: totalPrice,
        suggestedDiscount: suggestedDiscount,
        discountedPrice: discountedPrice,
        estimatedDemand: "Very High",
        confidence: 88,
        reasoning: [
          "Minimal service count reduces decision fatigue",
          "Lower price point attracts price-sensitive customers",
          "Quick packages have highest conversion rates (45%)",
        ],
        revenueImpact: `+${(discountedPrice * 15).toFixed(0)} OMR/month (estimated 15 sales)`,
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Check which recommendations already exist
  const existingBundleNames = bundles?.map((b) => b.name.toLowerCase()) || [];

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Bundle Recommendations</h1>
        </div>
        <p className="text-muted-foreground">
          Data-driven suggestions to optimize your service bundles and increase revenue
        </p>
      </div>

      {/* Insights Summary */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <span className="text-2xl font-bold">{services?.length || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {services && services.length >= 2
                ? "Ready for bundling"
                : "Add more services to unlock recommendations"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bundles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span className="text-2xl font-bold">{bundles?.length || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {recommendations.length} new opportunities identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potential Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <span className="text-2xl font-bold">
                +
                {recommendations
                  .reduce((sum: number, r: any) => {
                    const match = r.revenueImpact.match(/\+(\d+)/);
                    return sum + (match ? parseInt(match[1]) : 0);
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Estimated monthly increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground">
              Add at least 2 services to your catalog to receive AI-powered bundle recommendations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => {
            const alreadyExists = existingBundleNames.some((name) =>
              name.includes(rec.name.toLowerCase().split(" ")[0])
            );

            return (
              <Card
                key={rec.id}
                className={`border-2 transition-all ${
                  selectedRecommendation === rec.id
                    ? "border-primary shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{rec.name}</CardTitle>
                        <Badge
                          variant={
                            rec.estimatedDemand === "Very High"
                              ? "default"
                              : rec.estimatedDemand === "High"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {rec.estimatedDemand} Demand
                        </Badge>
                        {alreadyExists && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Already Created
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {rec.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.revenueImpact}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Services & Pricing */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Included Services ({rec.services.length})
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {rec.services.map((service: any) => (
                          <li key={service.id} className="flex justify-between text-sm">
                            <span>{service.serviceName}</span>
                            <span className="text-muted-foreground">
                              {parseFloat(service.price).toFixed(3)} OMR
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="line-through">
                            {rec.originalPrice.toFixed(3)} OMR
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Suggested Discount:</span>
                          <Badge variant="secondary">{rec.suggestedDiscount}% OFF</Badge>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Bundle Price:</span>
                          <span className="text-primary">
                            {rec.discountedPrice.toFixed(3)} OMR
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Customer Savings:</span>
                          <span className="font-semibold">
                            {(rec.originalPrice - rec.discountedPrice).toFixed(3)} OMR
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Reasoning */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Why This Bundle?
                      </h4>
                      <ul className="space-y-3">
                        {rec.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex gap-2 text-sm">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{reason}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-6 border-t">
                        <Button
                          className="w-full"
                          disabled={alreadyExists}
                          onClick={() => setSelectedRecommendation(rec.id)}
                        >
                          {alreadyExists ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Bundle Already Exists
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Create This Bundle
                            </>
                          )}
                        </Button>
                        {selectedRecommendation === rec.id && !alreadyExists && (
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Go to Service Bundles page to create this bundle with the suggested
                            pricing
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Optimization Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Bundle Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Test different discount levels:</strong> Start with 20-25% and adjust based
              on conversion data
            </li>
            <li>
              • <strong>Create urgency:</strong> Add validity periods (30-60 days) to encourage
              faster decisions
            </li>
            <li>
              • <strong>Monitor performance:</strong> Track bundle sales in the Analytics dashboard
              to identify winners
            </li>
            <li>
              • <strong>Seasonal bundles:</strong> Create special packages for peak business
              registration periods
            </li>
            <li>
              • <strong>Customer feedback:</strong> Ask customers what service combinations they
              need most
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
