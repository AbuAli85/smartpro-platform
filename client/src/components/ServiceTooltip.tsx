import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, FileText, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceTooltipProps {
  children: React.ReactNode;
  service: {
    serviceName: string;
    serviceNameAr?: string | null;
    price?: string | null;
    estimatedDeliveryDays?: number | null;
    description?: string | null;
    descriptionAr?: string | null;
    priceType?: string;
  };
  showIcon?: boolean;
}

/**
 * Service Tooltip component
 * Shows detailed service information on hover
 * Displays price, duration, and requirements in a compact format
 */
export function ServiceTooltip({ children, service, showIcon = false }: ServiceTooltipProps) {
  const { t, language } = useLanguage();
  
  const serviceName = language === "ar" && service.serviceNameAr 
    ? service.serviceNameAr 
    : service.serviceName;
    
  const description = language === "ar" && service.descriptionAr
    ? service.descriptionAr
    : service.description;

  const formatPrice = (price?: string | null, priceType?: string) => {
    if (!price) return t("service.contactForPrice");
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    
    if (priceType === "hourly") {
      return `${numPrice.toFixed(3)} ${t("service.omrPerHour")}`;
    } else if (priceType === "custom") {
      return t("service.customPricing");
    }
    
    return `${numPrice.toFixed(3)} ${t("service.omr")}`;
  };

  const formatDuration = (days?: number | null) => {
    if (!days) return t("service.variesByRequest");
    
    if (days === 1) return t("service.sameDay");
    if (days < 7) return `${days} ${t("service.days")}`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${weeks === 1 ? t("service.week") : t("service.weeks")}`;
    }
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? t("service.month") : t("service.months")}`;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {children}
            {showIcon && (
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-4 space-y-3"
          sideOffset={5}
        >
          {/* Service Name */}
          <div>
            <h4 className="font-semibold text-sm mb-1">{serviceName}</h4>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Service Details */}
          <div className="space-y-2">
            {/* Price */}
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="font-medium">{t("service.price")}:</span>
              <span className="text-muted-foreground">
                {formatPrice(service.price, service.priceType)}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="font-medium">{t("service.duration")}:</span>
              <span className="text-muted-foreground">
                {formatDuration(service.estimatedDeliveryDays)}
              </span>
            </div>

            {/* Price Type Badge */}
            {service.priceType && service.priceType !== "fixed" && (
              <div className="flex items-center gap-2 text-xs">
                <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <Badge variant="secondary" className="text-xs">
                  {service.priceType === "hourly" ? t("service.hourlyRate") : t("service.customQuote")}
                </Badge>
              </div>
            )}
          </div>

          {/* Hover Hint */}
          <p className="text-[10px] text-muted-foreground italic border-t pt-2">
            {t("service.clickForDetails")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact service info badge with tooltip
 * Shows key info at a glance with detailed tooltip on hover
 */
export function ServiceInfoBadge({ service }: { service: ServiceTooltipProps["service"] }) {
  const { t } = useLanguage();
  
  const price = service.price ? `${parseFloat(service.price).toFixed(1)} OMR` : t("service.varies");
  const duration = service.estimatedDeliveryDays 
    ? `${service.estimatedDeliveryDays}d`
    : t("service.varies");

  return (
    <ServiceTooltip service={service} showIcon>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{price}</span>
        <span>•</span>
        <span>{duration}</span>
      </div>
    </ServiceTooltip>
  );
}
