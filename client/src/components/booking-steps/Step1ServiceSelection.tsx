import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Receipt,
  Scale,
  Calculator,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getServiceConfig } from "@/../../shared/serviceRequirements";
import { useLanguage } from "@/contexts/LanguageContext";

const ICON_MAP: Record<string, any> = {
  Building2,
  Receipt,
  Scale,
  Calculator,
  FileText,
};

interface Service {
  id: number;
  serviceName: string;
  price: string;
  estimatedDuration: string;
  description?: string;
}

interface Step1Props {
  services: Service[];
  selectedServiceId: string;
  onServiceSelect: (serviceId: string) => void;
  comparisonMode?: boolean;
  selectedForComparison?: string[];
  onToggleComparison?: (serviceId: string) => void;
  onOpenComparison?: () => void;
  onOpenRecommendation?: () => void;
}

export function Step1ServiceSelection({
  services,
  selectedServiceId,
  onServiceSelect,
  comparisonMode = false,
  selectedForComparison = [],
  onToggleComparison,
  onOpenComparison,
  onOpenRecommendation,
}: Step1Props) {
  const { t } = useLanguage();
  const [expandedService, setExpandedService] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t("booking.selectServiceTitle")}</h2>
          <p className="text-muted-foreground">
            {t("booking.selectServiceDescription")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {onOpenRecommendation && (
            <Button
              variant="default"
              onClick={onOpenRecommendation}
              className="gap-2"
              aria-label={t("booking.getRecommendations")}
            >
              <Sparkles className="w-4 h-4" />
              {t("booking.getRecommendations")}
            </Button>
          )}
          {onOpenComparison && onToggleComparison && (
            <>
              <Button
                variant="outline"
                onClick={onOpenComparison}
                disabled={selectedForComparison.length < 2}
                aria-label={t("booking.compareServices")}
              >
                {t("booking.compareServices")}
                {selectedForComparison.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedForComparison.length}
                  </Badge>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("booking.selectToCompare")}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const config = getServiceConfig(service.serviceName);
          const IconComponent = ICON_MAP[config.icon] || FileText;
          const isSelected = selectedServiceId === service.id.toString();
          const isExpanded = expandedService === service.id;

          return (
            <Card
              key={service.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md relative",
                isSelected && "ring-2 ring-primary",
                selectedForComparison.includes(service.id.toString()) && "ring-2 ring-blue-500"
              )}
              onClick={() => {
                if (isExpanded) {
                  setExpandedService(null);
                } else {
                  setExpandedService(service.id);
                }
              }}
            >
              {onToggleComparison && (
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedForComparison.includes(service.id.toString())}
                    onCheckedChange={() => onToggleComparison(service.id.toString())}
                    disabled={!selectedForComparison.includes(service.id.toString()) && selectedForComparison.length >= 3}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {service.serviceName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-primary">
                          {service.price} OMR
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {config.typicalDuration}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Turnaround: <strong>{config.turnaroundTime}</strong>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      What's Included:
                    </h4>
                    <ul className="space-y-1">
                      {config.whatsIncluded.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      Required Documents:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {config.requiredDocuments.map((doc, index) => (
                        <Badge key={index} variant="secondary">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect(service.id.toString());
                    }}
                    aria-label={isSelected ? t("booking.selected") : t("booking.selectThisService")}
                  >
                    {isSelected ? t("booking.selected") : t("booking.selectThisService")}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {services.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {t("booking.noServicesAvailable")}
          </p>
        </Card>
      )}
    </div>
  );
}
