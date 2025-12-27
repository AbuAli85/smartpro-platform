import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Filter, Download, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Categories will be translated dynamically in the component

export default function Templates() {
  const { t } = useLanguage();
  
  // Categories with translations
  const CATEGORIES = [
    { value: "all", label: t("templates.allTemplates") },
    { value: "employment", label: t("templates.employment") },
    { value: "noc", label: t("templates.nocCertificates") },
    { value: "business", label: t("templates.business") },
    { value: "legal", label: t("templates.legal") },
    { value: "immigration", label: t("templates.immigration") },
  ];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.documentTemplate.list.useQuery({
    page,
    limit: 12,
    category: category === "all" ? undefined : category,
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{t("templates.title")}</h1>
            <p className="text-xl text-blue-100">
              {t("templates.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t("templates.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {t("common.filter")}
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data && data.templates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.templates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <FileText className="h-8 w-8 text-[#003366]" />
                      <div className="flex gap-2">
                        {template.isOfficial && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t("templates.official")}
                          </Badge>
                        )}
                        {template.isPremium && (
                          <Badge variant="secondary" className="bg-[#FFD700] text-gray-900">
                            {t("templates.premium")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-[#003366] transition-colors">
                      {template.templateName}
                    </CardTitle>
                    {template.templateNameAr && (
                      <p className="text-sm text-gray-500 font-arabic">{template.templateNameAr}</p>
                    )}
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {template.usageCount || 0}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <Link href={`/templates/${template.id}`}>
                        <Button size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          {t("templates.view")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.total > data.limit && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t("templates.previous")}
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  {t("templates.page")} {page} {t("offices.of")} {Math.ceil(data.total / data.limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / data.limit)}
                >
                  {t("templates.next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("templates.noTemplatesFound")}</h3>
            <p className="text-gray-500">{t("templates.tryAdjustingFilters")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
