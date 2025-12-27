import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceFiltersProps {
  onFilterChange: (filters: ServiceFilterState) => void;
  maxPrice: number;
}

export interface ServiceFilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
}

export function ServiceFilters({ onFilterChange, maxPrice }: ServiceFiltersProps) {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  useEffect(() => {
    onFilterChange({
      category,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  }, [category, priceRange, onFilterChange]);

  const handleClearFilters = () => {
    setCategory("all");
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters = category !== "all" || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("services.filters")}</h3>
              {hasActiveFilters && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {t("services.active")}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {t("services.clearFilters")}
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>{t("services.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("services.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("services.allCategories")}</SelectItem>
                  <SelectItem value="legal">{t("services.legal")}</SelectItem>
                  <SelectItem value="business">{t("services.business")}</SelectItem>
                  <SelectItem value="tax">{t("services.tax")}</SelectItem>
                  <SelectItem value="registration">{t("services.registration")}</SelectItem>
                  <SelectItem value="consultation">{t("services.consultation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label>
                {t("services.priceRange")}: {priceRange[0]} - {priceRange[1]} OMR
              </Label>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={maxPrice}
                step={10}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 OMR</span>
                <span>{maxPrice} OMR</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
