import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegionalContent } from "@/hooks/useRegionalContent";
import { useRegionalServices } from "@/hooks/useRegionalServices";

export function FeaturedRegionalServices() {
  const { t } = useLanguage();
  const { region } = useRegionalContent();
  const { popularServices } = useRegionalServices(region);

  if (popularServices.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            {t("services.popularInRegion")} {t(`region.${region}`)}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {region === "all" 
              ? t("home.popularServices") 
              : `${t("services.popularInRegion")} ${t(`region.${region}`)}`}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.popularServicesSubtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((service) => (
            <Card 
              key={service.id} 
              className="hover:shadow-elegant-lg transition-all duration-300 border-2 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{service.icon}</div>
                  <Badge variant="outline">{service.category}</Badge>
                </div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full group">
                  <Link href="/offices" className="flex items-center justify-center gap-2">
                    {t("home.findOffices")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild size="lg" variant="outline">
            <Link href="/offices" className="flex items-center gap-2">
              {t("services.viewAllServices")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
