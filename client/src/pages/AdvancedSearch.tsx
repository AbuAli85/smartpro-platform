import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Star, DollarSign, Filter, X } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

const GOVERNORATES = [
  "Muscat",
  "Dhofar",
  "Musandam",
  "Al Buraimi",
  "Ad Dakhiliyah",
  "Ad Dhahirah",
  "Ash Sharqiyah North",
  "Ash Sharqiyah South",
  "Al Batinah North",
  "Al Batinah South",
  "Al Wusta",
];

const SERVICE_CATEGORIES = [
  "Business Registration",
  "Legal Services",
  "Accounting & Tax",
  "HR & Payroll",
  "Marketing & Branding",
  "IT Services",
  "Consulting",
  "Training",
];

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [governorate, setGovernorate] = useState<string>("");
  const [wilayat, setWilayat] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number]>([10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name" | "newest">("rating");
  const [page, setPage] = useState(1);

  // Fetch offices with filters
  const { data, isLoading } = trpc.sanadOffice.list.useQuery({
    page,
    limit: 12,
    search: searchQuery || undefined,
    governorate: governorate || undefined,
    wilayat: wilayat || undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxPrice: priceRange[0],
    serviceTypes: selectedCategories.length > 0 ? selectedCategories : undefined,
    sortBy,
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGovernorate("");
    setWilayat("");
    setMinRating(0);
    setPriceRange([10000]);
    setSelectedCategories([]);
    setSortBy("rating");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    governorate ||
    wilayat ||
    minRating > 0 ||
    priceRange[0] < 10000 ||
    selectedCategories.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Advanced Search" },
          ]}
          className="mb-6"
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find the Perfect Office</h1>
          <p className="text-muted-foreground">
            Search and filter through our network of verified Sanad offices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label className="mb-2 block">Search by Name</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Office name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location Filters */}
                <div>
                  <Label className="mb-2 block">Governorate</Label>
                  <Select value={governorate} onValueChange={setGovernorate}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Governorates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Governorates</SelectItem>
                      {GOVERNORATES.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {governorate && governorate !== "all" && (
                  <div>
                    <Label className="mb-2 block">Wilayat</Label>
                    <Input
                      placeholder="Enter wilayat..."
                      value={wilayat}
                      onChange={(e) => setWilayat(e.target.value)}
                    />
                  </div>
                )}

                {/* Rating Filter */}
                <div>
                  <Label className="mb-2 block">Minimum Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= minRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {minRating > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {minRating}+ stars
                    </p>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <Label className="mb-2 block">Maximum Price</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number])}
                    min={0}
                    max={10000}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">0 OMR</span>
                    <span className="font-semibold">{priceRange[0]} OMR</span>
                  </div>
                </div>

                {/* Service Categories */}
                <div>
                  <Label className="mb-3 block">Service Categories</Label>
                  <div className="space-y-2">
                    {SERVICE_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label
                          htmlFor={category}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {data?.total || 0} offices found
              </p>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {governorate && governorate !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {governorate}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setGovernorate("")}
                    />
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {minRating}+ stars
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setMinRating(0)}
                    />
                  </Badge>
                )}
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleCategoryToggle(cat)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && data && data.offices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.offices.map((office: any) => (
                  <Card key={office.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                      {office.coverImageUrl ? (
                        <img
                          src={office.coverImageUrl}
                          alt={office.officeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
                          {office.officeName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-1">
                        {office.officeName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {office.wilayat}, {office.governorate}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">
                            {office.averageRating || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({office.totalReviews || 0} reviews)
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {office.status}
                        </Badge>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/offices/${office.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && data && data.offices.length === 0 && (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No offices found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    {hasActiveFilters && (
                      <Button onClick={clearFilters} variant="outline">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Pagination */}
            {data && data.total > data.limit && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(data.total / data.limit)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(data.total / data.limit)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
