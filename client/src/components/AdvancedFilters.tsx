import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  serviceCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: "instant" | "same_day" | "any";
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const serviceCategories = [
  "Business Registration",
  "Commercial License",
  "Document Attestation",
  "NOC Certificates",
  "Trade License",
  "Tax Registration",
  "Import/Export Documentation",
  "Legal Consultation",
  "Translation Services",
  "Other Services",
];

export function AdvancedFilters({ filters, onFiltersChange, className }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 500,
  ]);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      serviceCategory: category === "all" ? undefined : category,
    });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handlePriceCommit = () => {
    onFiltersChange({
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
    });
  };

  const handleRatingChange = (rating: string) => {
    onFiltersChange({
      ...filters,
      minRating: rating === "all" ? undefined : parseInt(rating),
    });
  };

  const handleAvailabilityChange = (availability: string) => {
    onFiltersChange({
      ...filters,
      availability: availability === "any" ? undefined : (availability as "instant" | "same_day"),
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof FilterState] !== undefined
  ).length;

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Service Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Category</label>
            <Select
              value={filters.serviceCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Price Range (OMR)</label>
              <span className="text-sm text-muted-foreground">
                {priceRange[0]} - {priceRange[1] >= 500 ? "500+" : priceRange[1]}
              </span>
            </div>
            <Slider
              min={0}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceCommit}
              className="w-full"
            />
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Rating</label>
            <Select
              value={filters.minRating?.toString() || "all"}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Availability</label>
            <Select
              value={filters.availability || "any"}
              onValueChange={handleAvailabilityChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Availability</SelectItem>
                <SelectItem value="instant">Instant Booking</SelectItem>
                <SelectItem value="same_day">Same-Day Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}

      {/* Active Filter Chips */}
      {!isExpanded && activeFilterCount > 0 && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.serviceCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.serviceCategory}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.minPrice || 0} - {filters.maxPrice || "500+"} OMR
                <button
                  onClick={() => {
                    setPriceRange([0, 500]);
                    onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined });
                  }}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.minRating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.minRating}+ Stars
                <button
                  onClick={() => handleRatingChange("all")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.availability && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.availability === "instant" ? "Instant Booking" : "Same-Day Service"}
                <button
                  onClick={() => handleAvailabilityChange("any")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
