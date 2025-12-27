import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Star, Search, Plus, Filter } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdvancedFilters, type FilterState } from "@/components/AdvancedFilters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegionalContent, getGovernoratesForRegion } from "@/hooks/useRegionalContent";

export default function OfficesList() {
  const { t } = useLanguage();
  const { region } = useRegionalContent();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [governorate, setGovernorate] = useState<string>();
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [page, setPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({});
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setAdvancedFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };
  const { isAuthenticated } = useAuth();

  // Apply regional filtering unless "Show all regions" is enabled
  const effectiveGovernorate = useMemo(() => {
    if (showAllRegions) return governorate;
    if (governorate) return governorate; // Manual filter takes precedence
    
    // Apply regional filter from region selector
    const regionalGovernorates = getGovernoratesForRegion(region);
    if (regionalGovernorates && regionalGovernorates.length === 1) {
      return regionalGovernorates[0];
    }
    return undefined;
  }, [region, governorate, showAllRegions]);

  const { data, isLoading } = trpc.sanadOffice.list.useQuery({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    governorate: effectiveGovernorate,
    status: "active",
    category: advancedFilters.category,
    minRating: advancedFilters.minRating,
    availableToday: advancedFilters.availableToday,
    availableThisWeek: advancedFilters.availableThisWeek,
  });
  
  // Sort offices client-side
  const sortedOffices = useMemo(() => {
    if (!data?.offices) return [];
    const offices = [...data.offices];
    
    switch (sortBy) {
      case "rating":
        return offices.sort((a, b) => parseFloat(b.averageRating || "0") - parseFloat(a.averageRating || "0"));
      case "name":
        return offices.sort((a, b) => a.officeName.localeCompare(b.officeName));
      case "reviews":
        return offices.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
      default:
        return offices;
    }
  }, [data?.offices, sortBy]);

  const governorates = [
    "Muscat",
    "Dhofar",
    "Musandam",
    "Al Buraimi",
    "Ad Dakhiliyah",
    "Al Batinah North",
    "Al Batinah South",
    "Ash Sharqiyah North",
    "Ash Sharqiyah South",
    "Al Dhahirah",
    "Al Wusta",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: t("offices.title") }]} className="mb-6" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t("offices.title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("offices.subtitle")}
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild size="lg" className="bg-gradient-accent hover:opacity-90">
              <Link href="/create-office" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("offices.registerYourOffice")}
              </Link>
            </Button>
          )}
        </div>

        {/* Basic Filters */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={t("offices.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={governorate} onValueChange={(value) => {
            setGovernorate(value === "all" ? undefined : value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t("offices.allRegions")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("offices.allRegions")}</SelectItem>
              {governorates.map((gov) => (
                <SelectItem key={gov} value={gov}>
                  {gov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("common.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{t("offices.highestRated")}</SelectItem>
              <SelectItem value="reviews">{t("offices.mostReviews")}</SelectItem>
              <SelectItem value="name">{t("offices.nameAZ")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters 
          filters={advancedFilters} 
          onFiltersChange={handleFiltersChange} 
          className="mb-8"
        />

        {/* Offices Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-40 bg-muted rounded-md mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : data && data.offices.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("offices.showing")} {sortedOffices.length} {t("offices.of")} {data.total} {t("offices.offices")}
                </p>
                {region !== "all" && !showAllRegions && !governorate && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {t("region.filteringByRegion")}: {t(`region.${region}`)}
                  </Badge>
                )}
              </div>
              {region !== "all" && !governorate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRegions(!showAllRegions)}
                  className="text-xs"
                >
                  {showAllRegions ? t("region.filteringByRegion") : t("region.showAllRegions")}
                </Button>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedOffices.map((office) => (
                <Card key={office.id} className="hover:shadow-elegant-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    {office.coverImageUrl ? (
                      <img
                        src={office.coverImageUrl}
                        alt={office.officeName}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-elegant rounded-md mb-4 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <CardTitle className="line-clamp-1">{office.officeName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {office.description || t("offices.professionalServices")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{office.governorate}, {office.wilayat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                        <span className="font-medium">{office.averageRating || "0.0"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({office.totalReviews || 0} {t("offices.reviewsCount")})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {office.verificationStatus === "verified" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          ✓ {t("offices.verified")}
                        </Badge>
                      )}
                      {office.autoAcceptBookings && (
                        <Badge variant="secondary">{t("offices.instantBooking")}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="default" className="w-full">
                      <Link href={`/offices/${office.id}`}>
                        {t("offices.viewOffice")}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.total > data.limit && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t("offices.previous")}
                </Button>
                <span className="flex items-center px-4 text-sm">
                  {t("offices.page")} {page} {t("offices.of")} {Math.ceil(data.total / data.limit)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(data.total / data.limit)}
                  onClick={() => setPage(page + 1)}
                >
                  {t("offices.next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("offices.noOfficesFound")}</h3>
            <p className="text-muted-foreground mb-6">
              {search || governorate
                ? t("offices.adjustSearchCriteria")
                : t("offices.beFirstToRegister")}
            </p>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/create-office">
                  {t("offices.registerYourOffice")}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
