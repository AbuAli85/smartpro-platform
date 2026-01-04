import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Building2, TrendingUp, Users, Award, ArrowLeft, Calendar } from "lucide-react";

export default function SuccessStoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  
  const { data: story, isLoading } = trpc.oman.successStories.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === "ar" ? "قصة النجاح غير موجودة" : "Success Story Not Found"}
        </h1>
        <Link href="/success-stories">
          <Button>
            {language === "ar" ? "العودة إلى قصص النجاح" : "Back to Success Stories"}
          </Button>
        </Link>
      </div>
    );
  }

  const businessName = language === "ar" && story.businessNameAr ? story.businessNameAr : story.businessName;
  const ownerName = language === "ar" && story.ownerNameAr ? story.ownerNameAr : story.ownerName;
  const challenge = language === "ar" && story.challengeAr ? story.challengeAr : story.challenge;
  const solution = language === "ar" && story.solutionAr ? story.solutionAr : story.solution;
  const results = language === "ar" && story.resultsAr ? story.resultsAr : story.results;
  const testimonial = language === "ar" && story.testimonialAr ? story.testimonialAr : story.testimonial;
  const smartproImpact = language === "ar" && story.smartproImpactAr ? story.smartproImpactAr : story.smartproImpact;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12">
        {/* Back Button */}
        <Link href="/success-stories">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "ar" ? "العودة إلى قصص النجاح" : "Back to Success Stories"}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {story.businessPhotoUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={story.businessPhotoUrl}
                  alt={businessName}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  {story.governorate}
                </Badge>
                <Badge variant="outline">{story.industry}</Badge>
                {story.yearEstablished && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {language === "ar" ? "تأسست في" : "Est."} {story.yearEstablished}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{businessName}</h1>
              <p className="text-xl text-muted-foreground">{ownerName}</p>
            </div>

            {/* Challenge */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  {language === "ar" ? "التحدي" : "The Challenge"}
                </h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{challenge}</p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  {language === "ar" ? "الحل" : "The Solution"}
                </h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{solution}</p>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  {language === "ar" ? "النتائج" : "The Results"}
                </h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6">{results}</p>
                
                {/* Impact Metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  {story.jobsCreated && (
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                      <div className="text-3xl font-bold">{story.jobsCreated}</div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "وظيفة تم إنشاؤها" : "Jobs Created"}
                      </div>
                    </div>
                  )}
                  {story.revenueGrowth && (
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                      <div className="text-3xl font-bold">{story.revenueGrowth}</div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "نمو الإيرادات" : "Revenue Growth"}
                      </div>
                    </div>
                  )}
                  {story.customersServed && (
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-3xl font-bold">{story.customersServed.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "عميل تم خدمته" : "Customers Served"}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial */}
            {testimonial && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <blockquote className="text-lg italic leading-relaxed">
                    "{testimonial}"
                  </blockquote>
                  <p className="mt-4 font-semibold">— {ownerName}</p>
                </CardContent>
              </Card>
            )}

            {/* SmartPro Impact */}
            {smartproImpact && (
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">
                    {language === "ar" ? "كيف ساعدت SmartPro" : "How SmartPro Helped"}
                  </h2>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{smartproImpact}</p>
                  {story.smartproServicesUsed && Array.isArray(story.smartproServicesUsed) && story.smartproServicesUsed.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold mb-2">
                        {language === "ar" ? "الخدمات المستخدمة:" : "Services Used:"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {story.smartproServicesUsed.map((service, idx) => (
                          <Badge key={idx} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Photos */}
            {story.additionalPhotos && Array.isArray(story.additionalPhotos) && story.additionalPhotos.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {language === "ar" ? "المزيد من الصور" : "More Photos"}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {story.additionalPhotos.map((photo, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`${businessName} - ${idx + 1}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Photo */}
            {story.ownerPhotoUrl && (
              <Card>
                <CardContent className="pt-6">
                  <img
                    src={story.ownerPhotoUrl}
                    alt={ownerName}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-bold text-lg">{ownerName}</h3>
                  <p className="text-muted-foreground">
                    {language === "ar" ? "المؤسس" : "Founder"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Facts */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-4">
                  {language === "ar" ? "معلومات سريعة" : "Quick Facts"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "المحافظة" : "Governorate"}
                    </div>
                    <div className="font-semibold">{story.governorate}</div>
                  </div>
                  {story.wilayat && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "الولاية" : "Wilayat"}
                      </div>
                      <div className="font-semibold">{story.wilayat}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar" ? "القطاع" : "Industry"}
                    </div>
                    <div className="font-semibold">{story.industry}</div>
                  </div>
                  {story.yearEstablished && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "سنة التأسيس" : "Year Established"}
                      </div>
                      <div className="font-semibold">{story.yearEstablished}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Awards */}
            {story.awardsReceived && Array.isArray(story.awardsReceived) && story.awardsReceived.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    {language === "ar" ? "الجوائز والتقدير" : "Awards & Recognition"}
                  </h3>
                  <ul className="space-y-2">
                    {story.awardsReceived.map((award: any, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-yellow-600 mt-1 shrink-0" />
                        <span className="text-sm">{award}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6 text-center">
                <h3 className="font-bold text-lg mb-2">
                  {language === "ar" ? "ابدأ قصة نجاحك" : "Start Your Success Story"}
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  {language === "ar"
                    ? "انضم إلى آلاف الشركات الناجحة في عمان"
                    : "Join thousands of successful businesses in Oman"}
                </p>
                <Link href="/register-office">
                  <Button variant="secondary" className="w-full">
                    {language === "ar" ? "سجل مكتبك" : "Register Your Office"}
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
