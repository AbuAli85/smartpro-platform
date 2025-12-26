import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  category?: string;
  minRating?: number;
  availableToday?: boolean;
  availableThisWeek?: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const serviceCategories = [
  "Company Formation",
  "Licensing",
  "Accounting & Bookkeeping",
  "Tax Services",
  "Legal Services",
  "HR & Payroll",
  "Business Consulting",
  "Document Services",
  "Translation",
  "Other",
];

export function AdvancedFilters({ filters, onFiltersChange, className }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === "all" ? undefined : category,
    });
  };

  const handleRatingChange = (rating: string) => {
    onFiltersChange({
      ...filters,
      minRating: rating === "all" ? undefined : parseFloat(rating),
    });
  };

  const handleAvailabilityChange = (type: "today" | "week", checked: boolean) => {
    if (type === "today") {
      onFiltersChange({
        ...filters,
        availableToday: checked,
        availableThisWeek: checked ? false : filters.availableThisWeek,
      });
    } else {
      onFiltersChange({
        ...filters,
        availableThisWeek: checked,
        availableToday: checked ? false : filters.availableToday,
      });
    }
  };

  const clearFilters = () => {
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
              value={filters.category || "all"}
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
                <SelectItem value="4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4+ Stars
                  </div>
                </SelectItem>
                <SelectItem value="4.5">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4.5+ Stars
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    3+ Stars
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Availability</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availableToday"
                  checked={filters.availableToday || false}
                  onCheckedChange={(checked) =>
                    handleAvailabilityChange("today", checked as boolean)
                  }
                />
                <Label
                  htmlFor="availableToday"
                  className="text-sm font-normal cursor-pointer"
                >
                  Available Today
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availableThisWeek"
                  checked={filters.availableThisWeek || false}
                  onCheckedChange={(checked) =>
                    handleAvailabilityChange("week", checked as boolean)
                  }
                />
                <Label
                  htmlFor="availableThisWeek"
                  className="text-sm font-normal cursor-pointer"
                >
                  Available This Week
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Active Filter Chips */}
      {!isExpanded && activeFilterCount > 0 && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.category}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.minRating && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {filters.minRating}+ Stars
                <button
                  onClick={() => handleRatingChange("all")}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.availableToday && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Available Today
                <button
                  onClick={() => handleAvailabilityChange("today", false)}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.availableThisWeek && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Available This Week
                <button
                  onClick={() => handleAvailabilityChange("week", false)}
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
