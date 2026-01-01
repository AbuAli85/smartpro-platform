import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useArabicNumbers } from "@/hooks/useArabicNumbers";

interface BudgetRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function BudgetRangeSlider({ 
  min, 
  max, 
  step = 10, 
  value, 
  onChange 
}: BudgetRangeSliderProps) {
  const { t } = useLanguage();
  const { formatNumber } = useArabicNumbers();
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const handleMinChange = useCallback((newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localMax - step));
    setLocalMin(clampedMin);
    onChange([clampedMin, localMax]);
  }, [localMax, min, step, onChange]);

  const handleMaxChange = useCallback((newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localMin + step));
    setLocalMax(clampedMax);
    onChange([localMin, clampedMax]);
  }, [localMin, max, step, onChange]);

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {t("marketplace.filters.budgetRange") || "Budget Range"}
        </Label>
        <span className="text-sm text-muted-foreground">
          {formatNumber(localMin)} - {formatNumber(localMax)} {t("currency.omr") || "OMR"}
        </span>
      </div>

      {/* Dual Range Slider */}
      <div className="relative h-8 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-secondary rounded-full" />
        
        {/* Active Range */}
        <div 
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`
          }}
        />

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
          style={{ zIndex: localMin > max - (max - min) / 4 ? 5 : 3 }}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1">
            {t("marketplace.filters.minBudget") || "Min"}
          </Label>
          <Input
            type="number"
            min={min}
            max={localMax - step}
            step={step}
            value={localMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1">
            {t("marketplace.filters.maxBudget") || "Max"}
          </Label>
          <Input
            type="number"
            min={localMin + step}
            max={max}
            step={step}
            value={localMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="h-9"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange([0, 500])}
          className="px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          0-500
        </button>
        <button
          onClick={() => onChange([500, 1000])}
          className="px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          500-1K
        </button>
        <button
          onClick={() => onChange([1000, 2500])}
          className="px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          1K-2.5K
        </button>
        <button
          onClick={() => onChange([2500, 5000])}
          className="px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          2.5K-5K
        </button>
        <button
          onClick={() => onChange([5000, 10000])}
          className="px-3 py-1 text-xs rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          5K+
        </button>
      </div>
    </div>
  );
}
