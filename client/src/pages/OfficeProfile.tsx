import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Phone, Mail, Globe, Star, Calendar, ArrowLeft, DollarSign, Clock } from "lucide-react";
import { MobileActions, ClickToCall, TapToNavigate } from "@/components/MobileActions";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { useAuth } from "@/_core/hooks/useAuth";
import { CanonicalURL } from "@/components/CanonicalURL";
import { Breadcrumb } from "@/components/Breadcrumb";
import ChatWidget from "@/components/ChatWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { ServiceFilters, ServiceFilterState } from "@/components/ServiceFilters";
import { ReviewList } from "@/components/ReviewList";
import { useMemo, useState } from "react";

export default function OfficeProfile() {
  const { t } = useLanguage();
  const [, params] = useRoute("/offices/:id");
  const officeId = params?.id ? parseInt(params.id) : 0;
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<ServiceFilterState>({
    category: "all",
    minPrice: 0,
    maxPrice: 10000,
  });

  const { data: office, isLoading } = trpc.sanadOffice.getById.useQuery({ id: officeId }, { enabled: officeId > 0 });
  const { data: reviews } = (trpc.booking as any).getOfficeReviews.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office?.id }
  );

  const { data: services } = trpc.sanadOffice.getServices.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office?.id }
  );

  // Calculate max price from services
  const maxPrice = useMemo(() => {
    if (!services || services.length === 0) return 10000;
    return Math.max(...services.map(s => Number(s.price) || 0));
  }, [services]);

  // Filter services based on active filters
  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(service => {
      // Category filter
      if (filters.category !== "all" && service.category !== filters.category) {
        return false;
      }
      // Price filter
      const price = Number(service.price) || 0;
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }, [services, filters]);

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
      <CanonicalURL path={`/offices/${officeId}`} />
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
            <ResponsiveImage
              src={office.coverImageUrl}
              alt={office.officeName}
              className="w-full h-64 rounded-lg mb-6"
              priority
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
              
              {/* Mobile Actions - Visible on mobile */}
              <div className="lg:hidden mb-4">
                <MobileActions
                  phoneNumber={office.phone}
                  address={`${office.governorate}, ${office.wilayat}`}
                  officeName={office.officeName}
                />
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TapToNavigate address={`${office.governorate}, ${office.wilayat}`} />
                </div>
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <ClickToCall phoneNumber={office.phone} />
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

            <div className="flex gap-3">
              {isAuthenticated && (
                <Button asChild size="lg" className="bg-[#003366] hover:bg-[#002244] text-white">
                  <Link href={`/offices/${officeId}/book`} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("office.bookService")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        {isAuthenticated && services && services.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{t("office.readyToBook")}</h3>
              <p className="text-sm text-muted-foreground">{t("office.selectServiceAndBook")}</p>
            </div>
            <Button asChild size="lg" className="bg-[#003366] hover:bg-[#002244] text-white">
              <Link href={`/offices/${officeId}/book`} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("office.bookService")}
              </Link>
            </Button>
          </div>
        )}

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

          <TabsContent value="services" className="space-y-4">
            {/* Service Filters */}
            {services && services.length > 0 && (
              <ServiceFilters
                onFilterChange={setFilters}
                maxPrice={maxPrice}
              />
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("office.availableServices")}</CardTitle>
                    <CardDescription>{t("office.servicesDescription")}</CardDescription>
                  </div>
                  {filteredServices.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t("services.resultsCount").replace("{count}", String(filteredServices.length))}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!services || services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("office.noServices")}</p>
                ) : filteredServices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t("office.noServicesMatchFilters")}</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredServices.map((service) => (
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
                                {service.price ? `${service.price} ${service.currency}` : t("office.customQuote")}
                              </span>
                            </div>
                            {service.estimatedDeliveryDays && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{service.estimatedDeliveryDays} {t("office.days")}</span>
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
            {office && <ReviewList officeId={office.id} />}
          </TabsContent>
        </Tabs>
      </div>
      </div>
      
      {/* Chat Widget */}
      {office && <ChatWidget officeId={office.id} officeName={office.officeName} />}
    </>
  );
}
