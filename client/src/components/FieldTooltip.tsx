import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FieldTooltipProps {
  content: string;
  contentAr?: string;
  variant?: "help" | "info";
  side?: "top" | "right" | "bottom" | "left";
}

export function FieldTooltip({
  content,
  contentAr,
  variant = "help",
  side = "right",
}: FieldTooltipProps) {
  const { language } = useLanguage();

  const displayContent = language === "ar" && contentAr ? contentAr : content;
  const Icon = variant === "help" ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Icon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{displayContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface FieldLabelWithTooltipProps {
  label: string;
  tooltip?: string;
  tooltipAr?: string;
  required?: boolean;
  htmlFor?: string;
}

export function FieldLabelWithTooltip({
  label,
  tooltip,
  tooltipAr,
  required,
  htmlFor,
}: FieldLabelWithTooltipProps) {
  const { t } = useLanguage();

  return (
    <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium mb-2">
      <span>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </span>
      {tooltip && <FieldTooltip content={tooltip} contentAr={tooltipAr} />}
    </label>
  );
}
