import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, FileText, Calendar, Shield, Zap, Users, 
  CheckCircle2, ArrowRight, Star, TrendingUp, Clock, 
  MessageCircle, Award, Search
} from "lucide-react";
import { StructuredData, getSmartProOrganizationSchema } from "@/components/StructuredData";
import { CanonicalURL } from "@/components/CanonicalURL";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRegionalContent } from "@/hooks/useRegionalContent";
import { RegionSelector } from "@/components/RegionSelector";
import { FeaturedRegionalServices } from "@/components/FeaturedRegionalServices";
import { RecommendedOffices } from "@/components/RecommendedOffices";
import { CampaignBanner } from "@/components/CampaignBanner";

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { region, setRegion, getRegionalContent } = useRegionalContent();

  return (
    <>
      <CanonicalURL path="/" />
      <StructuredData type="organization" data={getSmartProOrganizationSchema()} />
      <div className="min-h-screen flex flex-col">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#004488] to-[#0055AA] py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/50 to-transparent" />
          
          <div className="container relative">
            <div className="mx-auto max-w-4xl text-center">
              {/* Region Selector */}
              <div className="flex justify-center mb-6">
                <RegionSelector value={region} onChange={setRegion} className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2" />
              </div>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                🚀 {t("home.hero.badge")}
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 px-4">
                {getRegionalContent("home.hero.title")}
              </h1>
              
              {/* Impact Statement Tagline */}
              <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl font-serif italic text-yellow-200 max-w-3xl mx-auto px-4 leading-relaxed">
                {t("home.hero.impactStatement")}
              </p>
              
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-6 sm:leading-7 md:leading-8 text-blue-100 max-w-2xl mx-auto px-4">
                {getRegionalContent("home.hero.subtitle")}
              </p>
              
              <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                {!user ? (
                  <>
                    <Button asChild size="lg" className="bg-white text-[#003366] hover:bg-blue-50 w-full sm:w-auto">
                      <Link href="/offices">
                        {t("home.browseOffices")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline" 
                      className="bg-transparent text-white border-white/30 hover:bg-white/10 w-full sm:w-auto"
                    >
                      <Link href="/register-office">{t("home.hero.registerOffice")}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-white text-[#003366] hover:bg-blue-50 w-full sm:w-auto">
                      <Link href="/bookings">
                        {t("home.hero.myBookings")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline" 
                      className="bg-transparent text-white border-white/30 hover:bg-white/10 w-full sm:w-auto"
                    >
                      <Link href="/offices">{t("home.hero.browseServices")}</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto px-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">500+</div>
                  <div className="text-xs sm:text-sm text-blue-200 mt-1">{t("home.stats.verifiedOffices")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">10K+</div>
                  <div className="text-xs sm:text-sm text-blue-200 mt-1">{t("home.stats.servicesCompleted")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">4.9★</div>
                  <div className="text-xs sm:text-sm text-blue-200 mt-1">{t("home.stats.avgRating")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16 px-4">
              <Badge className="mb-4">{t("home.featureCards.sectionBadge")}</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {t("home.featureCards.sectionTitle")}
              </h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
                {t("home.featureCards.sectionSubtitle")}
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.verifiedOffices")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.verifiedOfficesDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/offices">
                      {t("home.featureCards.exploreOffices")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.marketplace")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.marketplaceDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/marketplace">
                      {t("home.featureCards.browseMarketplace")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.documentTemplates")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.documentTemplatesDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/templates">
                      {t("home.featureCards.viewTemplates")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.easyBooking")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.easyBookingDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/bookings">
                      {t("home.featureCards.myBookings")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.realtimeChat")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.realtimeChatDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/owner/chat">
                      {t("home.featureCards.openChat")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle>{t("home.featureCards.loyaltyRewards")}</CardTitle>
                  <CardDescription>
                    {t("home.featureCards.loyaltyRewardsDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/loyalty">
                      {t("home.featureCards.viewRewards")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Campaign Banner */}
        <CampaignBanner />

        {/* Featured Regional Services */}
        <FeaturedRegionalServices />

        {/* Recommended Offices */}
        <RecommendedOffices />

        {/* How It Works Section */}
        <section className="py-20 lg:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge className="mb-4">{t("home.how.badge")}</Badge>
              <h2 className="text-4xl font-bold tracking-tight">
                {t("home.how.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("home.how.subtitle")}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("home.how.step1.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("home.how.step1.desc")}
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800" />
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("home.how.step2.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("home.how.step2.desc")}
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-transparent dark:from-green-800" />
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("home.how.step3.title")}</h3>
                  <p className="text-muted-foreground">
                    {t("home.how.step3.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section for Office Registration */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-[#003366] to-[#0055AA]">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
                {t("home.cta.title")}
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                {t("home.cta.subtitle")}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>{t("home.cta.benefit1")}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>{t("home.cta.benefit2")}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>{t("home.cta.benefit3")}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>{t("home.cta.benefit4")}</span>
                </div>
              </div>

              <Button asChild size="lg" className="bg-white text-[#003366] hover:bg-blue-50">
                <Link href="/register-office">
                  {t("home.cta.button")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">SmartPro</h3>
                <p className="text-sm text-slate-400">
                  {t("home.footer.tagline")}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">{t("home.footer.forCustomers")}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/offices" className="hover:text-white transition-colors">{t("home.footer.browseOffices")}</Link></li>
                  <li><Link href="/templates" className="hover:text-white transition-colors">{t("home.footer.documentTemplates")}</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white transition-colors">{t("home.footer.serviceMarketplace")}</Link></li>
                  <li><Link href="/loyalty" className="hover:text-white transition-colors">{t("home.footer.loyaltyProgram")}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">{t("home.footer.forOffices")}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/register-office" className="hover:text-white transition-colors">{t("home.footer.registerOffice")}</Link></li>
                  <li><Link href="/my-offices" className="hover:text-white transition-colors">{t("home.footer.manageOffice")}</Link></li>
                  <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">{t("home.footer.dashboard")}</Link></li>
                  <li><Link href="/owner/chat" className="hover:text-white transition-colors">{t("home.footer.chatInbox")}</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">{t("home.footer.support")}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/profile" className="hover:text-white transition-colors">{t("home.footer.myAccount")}</Link></li>
                  <li><Link href="/notifications" className="hover:text-white transition-colors">{t("home.footer.notifications")}</Link></li>
                  <li><a href="mailto:support@smartpro.om" className="hover:text-white transition-colors">{t("home.footer.contactUs")}</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
              <p>{t("home.footer.copyright")}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
