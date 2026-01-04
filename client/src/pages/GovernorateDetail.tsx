import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Building2, TrendingUp, Users, ArrowLeft, Briefcase } from "lucide-react";

export default function GovernorateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  
  const { data: governorate, isLoading } = trpc.oman.governorates.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const { data: stories } = trpc.oman.successStories.getByGovernorate.useQuery(
    { governorate: governorate?.name || "" },
    { enabled: !!governorate?.name }
  );

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!governorate) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === "ar" ? "المحافظة غير موجودة" : "Governorate Not Found"}
        </h1>
        <Link href="/">
          <Button>
            {language === "ar" ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  const name = language === "ar" && governorate.nameAr ? governorate.nameAr : governorate.name;
  const overview = language === "ar" && governorate.overviewAr ? governorate.overviewAr : governorate.overview;
  const economicProfile = language === "ar" && governorate.economicProfileAr ? governorate.economicProfileAr : governorate.economicProfile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-16">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "ar" ? "العودة" : "Back"}
            </Button>
          </Link>
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {governorate.region}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{name}</h1>
            {governorate.capitalCity && (
              <p className="text-lg opacity-90">
                {language === "ar" ? "العاصمة:" : "Capital:"} {language === "ar" && governorate.capitalCityAr ? governorate.capitalCityAr : governorate.capitalCity}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {governorate.coverImageUrl && (
        <div className="container -mt-8 mb-8">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img
              src={governorate.coverImageUrl}
              alt={name}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      )}

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {language === "ar" ? "نظرة عامة" : "Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{overview}</p>
              </CardContent>
            </Card>

            {/* Economic Profile */}
            {economicProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {language === "ar" ? "الملف الاقتصادي" : "Economic Profile"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{economicProfile}</p>
                </CardContent>
              </Card>
            )}

            {/* Key Industries */}
            {governorate.keyIndustries && Array.isArray(governorate.keyIndustries) && governorate.keyIndustries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    {language === "ar" ? "القطاعات الرئيسية" : "Key Industries"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {governorate.keyIndustries.map((industry, idx) => (
                      <Badge key={idx} variant="secondary">{industry}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Stories from this Governorate */}
            {stories && stories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {language === "ar" ? "قصص نجاح من " + name : "Success Stories from " + name}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {stories.slice(0, 4).map((story) => (
                    <Card key={story.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName}
                        </CardTitle>
                        <Badge variant="outline" className="w-fit">{story.industry}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {language === "ar" && story.resultsAr ? story.resultsAr : story.results}
                        </p>
                        <Link href={`/success-stories/${story.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            {language === "ar" ? "اقرأ المزيد" : "Read More"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {governorate.population && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "السكان" : "Population"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{governorate.population.toLocaleString()}</div>
                  </div>
                )}
                {governorate.area && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "المساحة" : "Area"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{governorate.area} {language === "ar" ? "كم²" : "km²"}</div>
                  </div>
                )}
                {governorate.registeredOfficesCount !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {language === "ar" ? "المكاتب المسجلة" : "Registered Offices"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{governorate.registeredOfficesCount}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wilayats */}
            {governorate.wilayats && Array.isArray(governorate.wilayats) && governorate.wilayats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "الولايات" : "Wilayats"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {governorate.wilayats.map((wilayat: any, idx) => (
                      <Badge key={idx} variant="outline">
                        {typeof wilayat === 'string' ? wilayat : wilayat.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 text-center">
                <h3 className="font-bold text-lg mb-2">
                  {language === "ar" ? "ابحث عن خدمات في " + name : "Find Services in " + name}
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  {language === "ar"
                    ? "تصفح المكاتب المسجلة في هذه المحافظة"
                    : "Browse registered offices in this governorate"}
                </p>
                <Link href={`/offices?governorate=${governorate.name}`}>
                  <Button variant="secondary" className="w-full">
                    {language === "ar" ? "تصفح المكاتب" : "Browse Offices"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
