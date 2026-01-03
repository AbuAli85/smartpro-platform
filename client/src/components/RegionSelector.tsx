import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export type Region = "all" | "muscat" | "dhofar" | "batinah" | "sharqiyah" | "dakhliyah";

interface RegionSelectorProps {
  value: Region;
  onChange: (region: Region) => void;
  className?: string;
}

export function RegionSelector({ value, onChange, className }: RegionSelectorProps) {
  const { t } = useLanguage();

  const regions: { value: Region; label: string }[] = [
    { value: "all", label: t("region.allOman") },
    { value: "muscat", label: t("region.muscat") },
    { value: "dhofar", label: t("region.dhofar") },
    { value: "batinah", label: t("region.batinah") },
    { value: "sharqiyah", label: t("region.sharqiyah") },
    { value: "dakhliyah", label: t("region.dakhliyah") },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("region.selectRegion")} />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
