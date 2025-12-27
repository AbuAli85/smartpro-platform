import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, TrendingUp, Trophy, Medal, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function RegionalLeaderboards() {
  const { t, language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>("Muscat");

  const regions = [
    { name: "Muscat", nameAr: "مسقط" },
    { name: "Dhofar", nameAr: "ظفار" },
    { name: "Al Batinah North", nameAr: "الباطنة الشمالية" },
    { name: "Ash Sharqiyah North", nameAr: "الشرقية الشمالية" },
    { name: "Ad Dakhiliyah", nameAr: "الداخلية" },
  ];

  const { data, isLoading } = trpc.recommendations.getTopByRegion.useQuery({
    region: selectedRegion,
    limit: 10,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (rank === 3) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#003366] via-[#004488] to-[#0055AA] py-12">
        <div className="container">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8" />
              <h1 className="text-4xl font-bold">{t("leaderboards.title")}</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t("leaderboards.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Region Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <Tabs value={selectedRegion} onValueChange={setSelectedRegion} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
              {regions.map((region) => (
                <TabsTrigger
                  key={region.name}
                  value={region.name}
                  className="data-[state=active]:bg-[#003366] data-[state=active]:text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {language === "ar" ? region.nameAr : region.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Leaderboard Content */}
      <section className="py-12">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data && data.offices.length > 0 ? (
            <>
              {/* Region Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {t("leaderboards.topOfficesIn").replace(
                    "{region}",
                    language === "ar"
                      ? regions.find((r) => r.name === selectedRegion)?.nameAr || selectedRegion
                      : selectedRegion
                  )}
                </h2>
                <p className="text-gray-600">{t("leaderboards.rankedBy")}</p>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-4">
                {data.offices.map((office, index) => {
                  const rank = index + 1;
                  return (
                    <Card
                      key={office.id}
                      className={`hover:shadow-lg transition-all ${
                        rank <= 3 ? "border-2" : ""
                      } ${
                        rank === 1
                          ? "border-yellow-400 bg-yellow-50/50"
                          : rank === 2
                          ? "border-gray-400 bg-gray-50/50"
                          : rank === 3
                          ? "border-amber-400 bg-amber-50/50"
                          : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Rank Icon */}
                          <div className="flex-shrink-0 w-12 flex items-center justify-center">
                            {getRankIcon(rank)}
                          </div>

                          {/* Office Logo */}
                          {office.logoUrl && (
                            <img
                              src={office.logoUrl}
                              alt={office.officeName}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}

                          {/* Office Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {language === "ar" ? office.officeNameAr : office.officeName}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{office.governorate}</span>
                                </div>
                              </div>
                              <Badge className={`${getRankBadgeColor(rank)} border`}>
                                {t("leaderboards.rank").replace("{rank}", rank.toString())}
                              </Badge>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 my-4">
                              <div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{office.rating.toFixed(1)}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {office.reviewCount} {t("leaderboards.reviews")}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{office.completedBookings}</div>
                                <div className="text-xs text-gray-600">{t("leaderboards.completed")}</div>
                              </div>
                              <div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span>{office.score.toFixed(0)}</span>
                                </div>
                                <div className="text-xs text-gray-600">{t("leaderboards.score")}</div>
                              </div>
                            </div>

                            {/* Reason Badge */}
                            <Badge variant="secondary" className="mb-3">
                              {language === "ar" ? office.reasonAr : office.reason}
                            </Badge>

                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {language === "ar" ? office.descriptionAr : office.description}
                            </p>

                            {/* View Office Button */}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/office/${office.id}`}>
                                {t("leaderboards.viewOffice")}
                                <ArrowRight
                                  className={`h-4 w-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`}
                                />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t("leaderboards.noOffices")}</h3>
                <p className="text-gray-600">{t("leaderboards.noOfficesDesc")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white border-t">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">{t("leaderboards.ctaTitle")}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{t("leaderboards.ctaDesc")}</p>
          <Button asChild size="lg">
            <Link href="/register-office">
              {t("leaderboards.registerOffice")}
              <ArrowRight className={`h-5 w-5 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
