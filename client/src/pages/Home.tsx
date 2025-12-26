import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Calendar, Shield, Zap, Users } from "lucide-react";
import { StructuredData, getSmartProOrganizationSchema } from "@/components/StructuredData";
import { CanonicalURL } from "@/components/CanonicalURL";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <CanonicalURL path="/" />
      <StructuredData type="organization" data={getSmartProOrganizationSchema()} />
      <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-elegant py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              {t("home.subtitle")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" variant="secondary">
                <Link href="/offices">{t("home.browseOffices")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link href="/templates">{t("home.viewTemplates")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("home.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("home.subtitle")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.offices")}</CardTitle>
                <CardDescription>
                  {t("home.features.officesDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link" className="p-0">
                  <Link href="/offices">{t("home.exploreOffices")} →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>{t("home.features.templates")}</CardTitle>
                <CardDescription>
                  {t("home.features.templatesDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link" className="p-0">
                  <Link href="/templates">{t("home.browseTemplates")} →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("home.features.booking")}</CardTitle>
                <CardDescription>
                  {t("home.features.bookingDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="link" className="p-0">
                  <Link href="/offices">{t("home.bookService")} →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Government Integrated</CardTitle>
                <CardDescription>
                  Direct integration with MOCIP, MOL, and ROP for seamless verification and compliance
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t("home.fast")}</CardTitle>
                <CardDescription>
                  {t("home.fastDesc")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>{t("home.trusted")}</CardTitle>
                <CardDescription>
                  {t("home.trustedDesc")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("home.cta")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("home.ctaDesc")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/offices">{t("home.getStarted")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">{t("home.learnMore")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-elegant flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">SmartPro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SmartPro. National Digital Infrastructure for Business Services.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
