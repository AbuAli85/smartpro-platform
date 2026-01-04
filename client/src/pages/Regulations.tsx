import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Search, AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const CATEGORIES = [
  { value: "business_registration", labelEn: "Business Registration", labelAr: "تسجيل الأعمال" },
  { value: "licensing", labelEn: "Licensing", labelAr: "الترخيص" },
  { value: "tax", labelEn: "Tax & VAT", labelAr: "الضرائب وضريبة القيمة المضافة" },
  { value: "labor", labelEn: "Labor Law", labelAr: "قانون العمل" },
  { value: "sme_support", labelEn: "SME Support", labelAr: "دعم المشاريع الصغيرة والمتوسطة" },
  { value: "industry_specific", labelEn: "Industry Specific", labelAr: "خاص بالقطاع" },
  { value: "general", labelEn: "General", labelAr: "عام" },
];

const PRIORITIES = [
  { value: "critical", labelEn: "Critical", labelAr: "حرج", icon: AlertCircle, color: "text-red-600" },
  { value: "high", labelEn: "High", labelAr: "عالي", icon: AlertCircle, color: "text-orange-600" },
  { value: "medium", labelEn: "Medium", labelAr: "متوسط", icon: Clock, color: "text-yellow-600" },
  { value: "low", labelEn: "Low", labelAr: "منخفض", icon: CheckCircle2, color: "text-green-600" },
];

export default function Regulations() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const { data: regulations, isLoading } = trpc.oman.regulations.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    priority: selectedPriority === "all" ? undefined : selectedPriority,
    search: searchQuery || undefined,
    limit: 50,
  });

  const { data: criticalRegulations } = trpc.oman.regulations.getCritical.useQuery();

  const getPriorityConfig = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[2];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "ar" ? "دليل الامتثال التنظيمي" : "Regulatory Compliance Guide"}
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              {language === "ar"
                ? "كل ما تحتاج لمعرفته حول متطلبات تسجيل الأعمال والامتثال في عمان"
                : "Everything you need to know about business registration and compliance requirements in Oman"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Critical Regulations Alert */}
        {criticalRegulations && criticalRegulations.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                {language === "ar" ? "متطلبات حرجة" : "Critical Requirements"}
              </CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "هذه المتطلبات إلزامية لجميع الشركات"
                  : "These requirements are mandatory for all businesses"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalRegulations.map((reg) => (
                  <Link key={reg.id} href={`/regulations/${reg.slug}`}>
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-semibold">
                            {language === "ar" && reg.titleAr ? reg.titleAr : reg.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === "ar" && reg.summaryAr ? reg.summaryAr : reg.summary}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "ابحث عن اللوائح..." : "Search regulations..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "الفئة" : "Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع الفئات" : "All Categories"}
                    </SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === "ar" ? cat.labelAr : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "ar" ? "الأولوية" : "Priority"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === "ar" ? "جميع الأولويات" : "All Priorities"}
                    </SelectItem>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {language === "ar" ? p.labelAr : p.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regulations List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {language === "ar" ? "جميع اللوائح" : "All Regulations"}
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : regulations && regulations.length > 0 ? (
            <div className="space-y-4">
              {regulations.map((reg) => {
                const priorityConfig = getPriorityConfig(reg.priority);
                const PriorityIcon = priorityConfig.icon;
                const category = CATEGORIES.find(c => c.value === reg.category);
                
                return (
                  <Card key={reg.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className={priorityConfig.color}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {language === "ar" ? priorityConfig.labelAr : priorityConfig.labelEn}
                            </Badge>
                            <Badge variant="secondary">
                              {language === "ar" ? category?.labelAr : category?.labelEn}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">
                            {language === "ar" && reg.titleAr ? reg.titleAr : reg.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {language === "ar" && reg.summaryAr ? reg.summaryAr : reg.summary}
                          </CardDescription>
                        </div>
                        <Link href={`/regulations/${reg.slug}`}>
                          <Button>
                            {language === "ar" ? "التفاصيل" : "Details"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {reg.issuingAuthority && (
                          <div>
                            <span className="font-semibold">{language === "ar" ? "الجهة المصدرة:" : "Issuing Authority:"}</span>{" "}
                            {language === "ar" && reg.issuingAuthorityAr ? reg.issuingAuthorityAr : reg.issuingAuthority}
                          </div>
                        )}
                        {reg.estimatedDuration && (
                          <div>
                            <span className="font-semibold">{language === "ar" ? "المدة:" : "Duration:"}</span>{" "}
                            {reg.estimatedDuration}
                          </div>
                        )}
                        {reg.estimatedCost && (
                          <div>
                            <span className="font-semibold">{language === "ar" ? "التكلفة:" : "Cost:"}</span>{" "}
                            {reg.estimatedCost}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "لم يتم العثور على لوائح" : "No Regulations Found"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar"
                    ? "جرب تغيير معايير البحث أو الفلاتر"
                    : "Try changing your search criteria or filters"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === "ar" ? "هل تحتاج إلى مساعدة في الامتثال؟" : "Need Help with Compliance?"}
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            {language === "ar"
              ? "تواصل مع مكاتب الخدمات المتخصصة لمساعدتك في استكمال جميع المتطلبات"
              : "Connect with specialized service offices to help you complete all requirements"}
          </p>
          <Link href="/offices">
            <Button size="lg" variant="secondary">
              {language === "ar" ? "تصفح المكاتب" : "Browse Offices"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
