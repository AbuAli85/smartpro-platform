import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, MapPin, TrendingUp, Users, Award } from "lucide-react";
import { Link } from "wouter";

const GOVERNORATES = [
  "Muscat",
  "Dhofar",
  "Musandam",
  "Al Buraimi",
  "Ad Dakhiliyah",
  "Al Batinah North",
  "Al Batinah South",
  "Ash Sharqiyah North",
  "Ash Sharqiyah South",
  "Al Dhahirah",
  "Al Wusta",
];

const INDUSTRIES = [
  "Technology",
  "Retail",
  "Manufacturing",
  "Services",
  "Tourism",
  "Agriculture",
  "Construction",
  "Healthcare",
  "Education",
  "Food & Beverage",
];

export default function SuccessStories() {
  const { t, language } = useLanguage();
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  const { data: stories, isLoading } = trpc.oman.successStories.list.useQuery({
    governorate: selectedGovernorate === "all" ? undefined : selectedGovernorate,
    industry: selectedIndustry === "all" ? undefined : selectedIndustry,
    limit: 50,
  });

  const { data: featuredStories } = trpc.oman.successStories.getFeatured.useQuery({ limit: 3 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "ar" ? "قصص النجاح العمانية" : "Omani Success Stories"}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {language === "ar"
                ? "اكتشف كيف حولت الشركات العمانية أحلامها إلى واقع مع SmartPro"
                : "Discover how Omani businesses turned their dreams into reality with SmartPro"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Featured Stories */}
        {featuredStories && featuredStories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">
              {language === "ar" ? "قصص مميزة" : "Featured Stories"}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredStories.map((story) => (
                <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {story.businessPhotoUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={story.businessPhotoUrl}
                        alt={language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="shrink-0">
                        <MapPin className="w-3 h-3 mr-1" />
                        {story.governorate}
                      </Badge>
                      <Badge variant="outline">{story.industry}</Badge>
                    </div>
                    <CardTitle className="text-xl">
                      {language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" && story.ownerNameAr ? story.ownerNameAr : story.ownerName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {language === "ar" && story.challengeAr ? story.challengeAr : story.challenge}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      {story.jobsCreated && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{story.jobsCreated} {language === "ar" ? "وظيفة" : "jobs"}</span>
                        </div>
                      )}
                      {story.revenueGrowth && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span>{story.revenueGrowth}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/success-stories/${story.id}`}>
                      <Button variant="outline" className="w-full">
                        {language === "ar" ? "اقرأ القصة الكاملة" : "Read Full Story"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <h3 className="font-semibold mb-4">
            {language === "ar" ? "تصفية حسب" : "Filter By"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "المحافظة" : "Governorate"}
              </label>
              <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "ar" ? "جميع المحافظات" : "All Governorates"}
                  </SelectItem>
                  {GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "القطاع" : "Industry"}
              </label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "ar" ? "جميع القطاعات" : "All Industries"}
                  </SelectItem>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* All Stories Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {language === "ar" ? "جميع قصص النجاح" : "All Success Stories"}
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow">
                  {story.businessPhotoUrl && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={story.businessPhotoUrl}
                        alt={language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="shrink-0">
                        <MapPin className="w-3 h-3 mr-1" />
                        {story.governorate}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{story.industry}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {language === "ar" && story.ownerNameAr ? story.ownerNameAr : story.ownerName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {language === "ar" && story.resultsAr ? story.resultsAr : story.results}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs mb-4">
                      {story.jobsCreated && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-primary" />
                          <span>{story.jobsCreated} {language === "ar" ? "وظيفة" : "jobs"}</span>
                        </div>
                      )}
                      {story.revenueGrowth && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span>{story.revenueGrowth}</span>
                        </div>
                      )}
                      {story.yearEstablished && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span>{story.yearEstablished}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/success-stories/${story.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        {language === "ar" ? "اقرأ المزيد" : "Read More"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "لا توجد قصص نجاح" : "No Success Stories Found"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "جرب تغيير معايير البحث"
                    : "Try changing your filter criteria"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === "ar" ? "هل لديك قصة نجاح؟" : "Have a Success Story?"}
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            {language === "ar"
              ? "شارك رحلتك وألهم رواد الأعمال الآخرين في عمان"
              : "Share your journey and inspire other entrepreneurs in Oman"}
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              {language === "ar" ? "شارك قصتك" : "Share Your Story"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
