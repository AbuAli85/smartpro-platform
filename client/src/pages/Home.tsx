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

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <>
      <CanonicalURL path="/" />
      <StructuredData type="organization" data={getSmartProOrganizationSchema()} />
      <div className="min-h-screen flex flex-col">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#003366] via-[#004488] to-[#0055AA] py-20 lg:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/50 to-transparent" />
          
          <div className="container relative">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                🚀 The Future of Business Services
              </Badge>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-6">
                {t("home.hero.title")}
              </h1>
              
              <p className="mt-6 text-xl leading-8 text-blue-100 max-w-2xl mx-auto">
                {t("home.hero.subtitle")}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
                      <Link href="/register-office">Register Your Office</Link>
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
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">500+</div>
                  <div className="text-sm text-blue-200 mt-1">{t("home.stats.verifiedOffices")}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">10K+</div>
                  <div className="text-sm text-blue-200 mt-1">{t("home.stats.servicesCompleted")}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">4.9★</div>
                  <div className="text-sm text-blue-200 mt-1">{t("home.stats.avgRating")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge className="mb-4">{t("home.featureCards.sectionBadge")}</Badge>
              <h2 className="text-4xl font-bold tracking-tight">
                {t("home.featureCards.sectionTitle")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("home.featureCards.sectionSubtitle")}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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

        {/* How It Works Section */}
        <section className="py-20 lg:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge className="mb-4">Simple Process</Badge>
              <h2 className="text-4xl font-bold tracking-tight">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get your business services done in 3 easy steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Browse & Compare</h3>
                  <p className="text-muted-foreground">
                    Search for services, compare prices, and read reviews from verified customers
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800" />
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Book & Pay</h3>
                  <p className="text-muted-foreground">
                    Select your preferred office, choose a time slot, and make secure payment online
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-transparent dark:from-green-800" />
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Track & Receive</h3>
                  <p className="text-muted-foreground">
                    Monitor progress in real-time and receive your completed documents digitally
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
                Are You a Sanad Office?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join SmartPro platform and connect with thousands of SMEs looking for your services. 
                Grow your business with our digital marketplace.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Free Registration</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>More Clients</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>Digital Tools</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>

              <Button asChild size="lg" className="bg-white text-[#003366] hover:bg-blue-50">
                <Link href="/register-office">
                  Register Your Office Now
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
                  The unified platform for business services in Oman
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Customers</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/offices" className="hover:text-white transition-colors">Browse Offices</Link></li>
                  <li><Link href="/templates" className="hover:text-white transition-colors">Document Templates</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white transition-colors">Service Marketplace</Link></li>
                  <li><Link href="/loyalty" className="hover:text-white transition-colors">Loyalty Program</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Offices</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/register-office" className="hover:text-white transition-colors">Register Office</Link></li>
                  <li><Link href="/my-offices" className="hover:text-white transition-colors">Manage Office</Link></li>
                  <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="/owner/chat" className="hover:text-white transition-colors">Chat Inbox</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link href="/profile" className="hover:text-white transition-colors">My Account</Link></li>
                  <li><Link href="/notifications" className="hover:text-white transition-colors">Notifications</Link></li>
                  <li><a href="mailto:support@smartpro.om" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
              <p>© 2025 SmartPro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
