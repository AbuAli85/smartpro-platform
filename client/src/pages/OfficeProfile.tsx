import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Phone, Mail, Globe, Star, Calendar, ArrowLeft, DollarSign, Clock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { CanonicalURL } from "@/components/CanonicalURL";
import { Breadcrumb } from "@/components/Breadcrumb";
import ChatWidget from "@/components/ChatWidget";
import { useLanguage } from "@/contexts/LanguageContext";

export default function OfficeProfile() {
  const { t } = useLanguage();
  const [, params] = useRoute("/offices/:slug");
  const slug = params?.slug || "";
  const { isAuthenticated } = useAuth();

  const { data: office, isLoading } = trpc.sanadOffice.getBySlug.useQuery({ slug });
  const { data: reviews } = (trpc.booking as any).getOfficeReviews.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office?.id }
  );

  const { data: services } = trpc.sanadOffice.getServices.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office?.id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("office.notFound")}</h2>
          <Button asChild>
            <Link href="/offices">{t("office.browseOffices")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CanonicalURL path={`/offices/${slug}`} />
      <div className="min-h-screen flex flex-col bg-background">
      

      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: t("nav.sanadOffices"), href: "/offices" },
            { label: office.officeName }
          ]} 
          className="mb-6" 
        />
        
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/offices" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("office.backToOffices")}
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="mb-8">
          {office.coverImageUrl ? (
            <img
              src={office.coverImageUrl}
              alt={office.officeName}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-elegant rounded-lg mb-6 flex items-center justify-center">
              <Building2 className="w-20 h-20 text-white" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{office.officeName}</h1>
                {office.verificationStatus === "verified" && (
                  <Badge className="bg-green-100 text-green-800">✓ {t("office.verified")}</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-4">{office.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{office.governorate}, {office.wilayat}</span>
                </div>
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{office.phone}</span>
                  </div>
                )}
                {office.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{office.email}</span>
                  </div>
                )}
                {office.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {t("office.website")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <Button asChild size="lg" className="bg-gradient-accent">
                <Link href={`/offices/${slug}/book`} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("office.bookService")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">{t("office.about")}</TabsTrigger>
            <TabsTrigger value="services">{t("office.services")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("office.reviews")} ({reviews?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("office.aboutThisOffice")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{t("office.location")}</h4>
                  <p className="text-muted-foreground">{office.wilayat}, {office.governorate}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t("office.contactInformation")}</h4>
                  {office.phone && <p className="text-muted-foreground">{t("office.phone")}: {office.phone}</p>}
                  {office.email && <p className="text-muted-foreground">{t("office.email")}: {office.email}</p>}
                  {office.website && (
                    <p className="text-muted-foreground">
                      {t("office.website")}: <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{office.website}</a>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>{t("office.availableServices")}</CardTitle>
                <CardDescription>{t("office.servicesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                {!services || services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("office.noServices")}</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {services.map((service) => (
                      <Card key={service.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                              <CardDescription>{service.category}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                          )}
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {service.price ? `${service.price} ${service.currency}` : "Custom Quote"}
                              </span>
                            </div>
                            {service.estimatedDeliveryDays && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{service.estimatedDeliveryDays} days</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                          {review.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{review.userName || "Anonymous"}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-accent text-accent" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  {review.reviewText && (
                    <CardContent>
                      <p className="text-muted-foreground">{review.reviewText}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
      
      {/* Chat Widget */}
      {office && <ChatWidget officeId={office.id} officeName={office.officeName} />}
    </>
  );
}
