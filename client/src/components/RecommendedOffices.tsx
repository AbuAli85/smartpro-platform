import { trpc } from "@/lib/trpc";
import { useRegionalContent } from "@/hooks/useRegionalContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function RecommendedOffices() {
  const { region } = useRegionalContent();
  const { t, language } = useLanguage();
  
  const { data, isLoading } = trpc.recommendations.getRecommended.useQuery({
    region: region === "all" ? null : region,
    limit: 6,
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{t("recommendations.loading")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.count === 0) {
    return null;
  }

  const offices = data.offices;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {region !== "all"
              ? language === "ar"
                ? `أفضل المكاتب في ${region}`
                : `Top Offices in ${region}`
              : t("recommendations.title")}
          </h2>
          <p className="text-gray-600">
            {t("recommendations.subtitle")}
          </p>
        </div>

        {/* Office Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offices.map((office) => (
            <Card key={office.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {language === "ar" ? office.officeNameAr : office.officeName}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{office.governorate}</span>
                    </div>
                  </div>
                  {office.logoUrl && (
                    <img
                      src={office.logoUrl}
                      alt={office.officeName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{office.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ({office.reviewCount} {t("recommendations.reviews")})
                  </span>
                </div>

                {/* Reason Badge */}
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {language === "ar" ? office.reasonAr : office.reason}
                </Badge>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {office.completedBookings} {t("recommendations.completedBookings")}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {language === "ar" ? office.descriptionAr : office.description}
                </p>

                {/* View Office Button */}
                <Button asChild className="w-full">
                  <Link href={`/office/${office.id}`}>
                    {t("recommendations.viewOffice")}
                    <ArrowRight className={`h-4 w-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/offices">
              {t("recommendations.viewAllOffices")}
              <ArrowRight className={`h-4 w-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
