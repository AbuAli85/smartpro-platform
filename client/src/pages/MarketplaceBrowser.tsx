import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, MapPin, Clock, Building2, Filter, Search, X, TrendingUp, AlertCircle, ChevronDown } from "lucide-react";
import { BidSubmissionDialog } from "@/components/BidSubmissionDialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useArabicNumbers } from "@/hooks/useArabicNumbers";

type SortOption = "newest" | "oldest" | "budget-high" | "budget-low" | "urgent";

export default function MarketplaceBrowser() {
  const { t, language } = useLanguage();
  const { formatNumber } = useArabicNumbers();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  
  // Filters
  const [serviceType, setServiceType] = useState<string>("all");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [location, setLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: requests, isLoading, refetch } = trpc.serviceMarketplace.listRequests.useQuery({
    status: "open",
    category: serviceType !== "all" ? serviceType : undefined,
    governorate: location !== "all" ? location : undefined,
  });

  // Client-side filtering and sorting
  const filteredAndSortedRequests = useMemo(() => {
    if (!requests) return [];

    let filtered = [...requests];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.serviceType?.toLowerCase().includes(query) ||
          req.description?.toLowerCase().includes(query) ||
          req.location?.toLowerCase().includes(query)
      );
    }

    // Apply budget filter
    if (minBudget) {
      const min = parseFloat(minBudget);
      filtered = filtered.filter((req) => req.maxBudget >= min);
    }
    if (maxBudget) {
      const max = parseFloat(maxBudget);
      filtered = filtered.filter((req) => req.minBudget <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "budget-high":
          return b.maxBudget - a.maxBudget;
        case "budget-low":
          return a.minBudget - b.minBudget;
        case "urgent":
          const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 4) - 
                 (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 4);
        default:
          return 0;
      }
    });

    return filtered;
  }, [requests, searchQuery, minBudget, maxBudget, sortBy]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredAndSortedRequests.length) {
      return { total: 0, avgBudget: 0, urgentCount: 0, totalBids: 0 };
    }

    const total = filteredAndSortedRequests.length;
    const avgBudget = filteredAndSortedRequests.reduce((sum, req) => sum + (req.minBudget + req.maxBudget) / 2, 0) / total;
    const urgentCount = filteredAndSortedRequests.filter((req) => req.urgency === "urgent" || req.urgency === "high").length;
    const totalBids = filteredAndSortedRequests.reduce((sum, req) => sum + (req.bidCount || 0), 0);

    return { total, avgBudget, urgentCount, totalBids };
  }, [filteredAndSortedRequests]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (serviceType !== "all") count++;
    if (location !== "all") count++;
    if (minBudget) count++;
    if (maxBudget) count++;
    if (searchQuery) count++;
    return count;
  }, [serviceType, location, minBudget, maxBudget, searchQuery]);

  const handleOpenBidDialog = (request: any) => {
    setSelectedRequest(request);
    setBidDialogOpen(true);
  };

  const handleBidSubmitted = () => {
    toast.success(t("marketplace.bidSubmitted") || "Bid Submitted Successfully!");
    refetch();
    setBidDialogOpen(false);
  };

  const clearAllFilters = () => {
    setServiceType("all");
    setLocation("all");
    setMinBudget("");
    setMaxBudget("");
    setSearchQuery("");
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return t("marketplace.noDeadline") || "No deadline";
    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) return t("marketplace.noDeadline") || "No deadline";
    const formatted = d.toLocaleDateString(language === "ar" ? "ar-OM" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formatted;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading.serviceRequests") || "Loading service requests..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("pages.serviceRequestMarketplace")}</h1>
          <p className="text-muted-foreground">
            {t("pages.serviceRequestMarketplaceDesc")}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("marketplace.stats.totalRequests") || "Total Requests"}</p>
                  <p className="text-2xl font-bold">{formatNumber(statistics.total)}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("marketplace.stats.avgBudget") || "Avg Budget"}</p>
                  <p className="text-2xl font-bold">{formatNumber(Math.round(statistics.avgBudget))} {t("currency.omr") || "OMR"}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("marketplace.stats.urgent") || "Urgent"}</p>
                  <p className="text-2xl font-bold">{formatNumber(statistics.urgentCount)}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("marketplace.stats.totalBids") || "Total Bids"}</p>
                  <p className="text-2xl font-bold">{formatNumber(statistics.totalBids)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("marketplace.search.placeholder") || "Search by service type, description, or location..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("marketplace.sort.newest") || "Newest First"}</SelectItem>
                <SelectItem value="oldest">{t("marketplace.sort.oldest") || "Oldest First"}</SelectItem>
                <SelectItem value="budget-high">{t("marketplace.sort.budgetHigh") || "Highest Budget"}</SelectItem>
                <SelectItem value="budget-low">{t("marketplace.sort.budgetLow") || "Lowest Budget"}</SelectItem>
                <SelectItem value="urgent">{t("marketplace.sort.urgent") || "Most Urgent"}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {t("marketplace.filters.title") || "Filters"}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {formatNumber(activeFilterCount)}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">{t("marketplace.filters.active") || "Active filters"}:</span>
            {serviceType !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {t("marketplace.serviceType")}: {serviceType}
                <button onClick={() => setServiceType("all")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {location !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {t("marketplace.location")}: {location}
                <button onClick={() => setLocation("all")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {minBudget && (
              <Badge variant="secondary" className="gap-1">
                {t("marketplace.filters.minBudget") || "Min"}: {formatNumber(minBudget)} {t("currency.omr") || "OMR"}
                <button onClick={() => setMinBudget("")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {maxBudget && (
              <Badge variant="secondary" className="gap-1">
                {t("marketplace.filters.maxBudget") || "Max"}: {formatNumber(maxBudget)} {t("currency.omr") || "OMR"}
                <button onClick={() => setMaxBudget("")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                {t("marketplace.filters.search") || "Search"}: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs">
              {t("marketplace.filters.clearAll") || "Clear All"}
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5" />
                {t("marketplace.filters.title") || "Filters"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>{t("marketplace.serviceType") || "Service Type"}</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("marketplace.filters.allServices") || "All Services"}</SelectItem>
                      <SelectItem value="Commercial Registration">{t("marketplace.serviceTypes.commercialRegistration") || "Commercial Registration"}</SelectItem>
                      <SelectItem value="Tax Registration">{t("marketplace.serviceTypes.taxRegistration") || "Tax Registration"}</SelectItem>
                      <SelectItem value="VAT Registration">{t("marketplace.serviceTypes.vatRegistration") || "VAT Registration"}</SelectItem>
                      <SelectItem value="License Renewal">{t("marketplace.serviceTypes.licenseRenewal") || "License Renewal"}</SelectItem>
                      <SelectItem value="Legal Consultation">{t("marketplace.serviceTypes.legalConsultation") || "Legal Consultation"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("marketplace.filters.minBudget") || "Min Budget"} ({t("currency.omr") || "OMR"})</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label>{t("marketplace.filters.maxBudget") || "Max Budget"} ({t("currency.omr") || "OMR"})</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <Label>{t("marketplace.location") || "Location"}</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("marketplace.filters.allLocations") || "All Locations"}</SelectItem>
                      <SelectItem value="Muscat">{t("marketplace.governorates.muscat") || "Muscat"}</SelectItem>
                      <SelectItem value="Salalah">{t("marketplace.governorates.dhofar") || "Salalah"}</SelectItem>
                      <SelectItem value="Sohar">{t("marketplace.governorates.alBatinahNorth") || "Sohar"}</SelectItem>
                      <SelectItem value="Nizwa">{t("marketplace.governorates.adDakhiliyah") || "Nizwa"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Requests Grid */}
        {filteredAndSortedRequests && filteredAndSortedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRequests.map((request: any) => {
              const isUrgent = request.urgency === "urgent" || request.urgency === "high";
              return (
                <Card 
                  key={request.id} 
                  className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    isUrgent ? "border-red-500 border-2" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{request.serviceType}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {t("marketplace.filters.posted") || "Posted"} {formatDate(request.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={isUrgent ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {request.urgency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                      {request.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
                        <DollarSign className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold">
                          {formatNumber(request.minBudget)} - {formatNumber(request.maxBudget)} {t("currency.omr") || "OMR"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-xs">
                          {t("marketplace.deadline") || "Deadline"}: {formatDate(request.deadline)}
                        </span>
                      </div>

                      {request.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs">{request.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium">
                          {formatNumber(request.bidCount || 0)} {t("marketplace.bidsSubmitted") || "bids submitted"}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleOpenBidDialog(request)}
                    >
                      {t("actions.submitBid") || "Submit Bid"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {activeFilterCount > 0 
                  ? t("empty.noMatchingRequests") || "No matching requests found"
                  : t("empty.noServiceRequestsFound") || "No service requests found"
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeFilterCount > 0
                  ? t("empty.tryAdjustingFilters") || "Try adjusting your filters to see more results"
                  : t("empty.noServiceRequestsFoundDesc") || "Check back later for new opportunities"
                }
              </p>
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearAllFilters}>
                  {t("marketplace.filters.clearAll") || "Clear All Filters"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedRequest && (
        <BidSubmissionDialog
          open={bidDialogOpen}
          onOpenChange={setBidDialogOpen}
          request={selectedRequest}
          onBidSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  );
}
