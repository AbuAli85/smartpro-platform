import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Star, DollarSign, Languages, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { OMAN_CITIES, getBilingualLabel } from "../../../shared/omanLocations";

export interface FilterState {
  category?: string;
  minRating?: number;
  availableToday?: boolean;
  availableThisWeek?: boolean;
  priceMin?: number;
  priceMax?: number;
  languages?: string[];
  wilayat?: string;
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
  const { t } = useTranslation();
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

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'priceMin' : 'priceMax']: numValue,
    });
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = filters.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language];
    onFiltersChange({
      ...filters,
      languages: newLanguages.length > 0 ? newLanguages : undefined,
    });
  };

  const handleWilayatChange = (wilayat: string) => {
    onFiltersChange({
      ...filters,
      wilayat: wilayat === "all" ? undefined : wilayat,
    });
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
            <CardTitle className="text-base">{t("offices.filters")}</CardTitle>
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
                {t("offices.clearFilters")}
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
            <label className="text-sm font-medium">{t("offices.category")}</label>
            <Select
              value={filters.category || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("offices.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("offices.allCategories")}</SelectItem>
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
            <label className="text-sm font-medium">{t("offices.rating")}</label>
            <Select
              value={filters.minRating?.toString() || "all"}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("offices.anyRating")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("offices.anyRating")}</SelectItem>
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

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t("offices.priceRange")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
                  {t("offices.minPrice")}
                </Label>
                <Input
                  id="priceMin"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={filters.priceMin || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
                  {t("offices.maxPrice")}
                </Label>
                <Input
                  id="priceMax"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="1000"
                  value={filters.priceMax || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t("offices.languagesSpoken")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Arabic', 'English', 'Hindi', 'Urdu'].map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={filters.languages?.includes(language) || false}
                    onCheckedChange={() => handleLanguageToggle(language)}
                  />
                  <Label
                    htmlFor={`lang-${language}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Wilayat */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("offices.wilayat")}
            </label>
            <Select
              value={filters.wilayat || "all"}
              onValueChange={handleWilayatChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("offices.allWilayats")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("offices.allWilayats")}</SelectItem>
                {OMAN_CITIES.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {getBilingualLabel(city.labelEn, city.labelAr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {(filters.priceMin || filters.priceMax) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {filters.priceMin || 0} - {filters.priceMax || '∞'} OMR
                <button
                  onClick={() => {
                    handlePriceChange('min', '');
                    handlePriceChange('max', '');
                  }}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.languages && filters.languages.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Languages className="h-3 w-3" />
                {filters.languages.join(', ')}
                <button
                  onClick={() => onFiltersChange({ ...filters, languages: undefined })}
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.wilayat && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.wilayat}
                <button
                  onClick={() => handleWilayatChange("all")}
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
