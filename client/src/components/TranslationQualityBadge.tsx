import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface TranslationQualityBadgeProps {
  nameAr?: string | null;
  descriptionAr?: string | null;
}

export default function TranslationQualityBadge({
  nameAr,
  descriptionAr,
}: TranslationQualityBadgeProps) {
  const { t } = useLanguage();

  const hasName = nameAr && nameAr.trim().length > 0;
  const hasDescription = descriptionAr && descriptionAr.trim().length > 0;

  let status: "complete" | "partial" | "missing";
  let icon: React.ReactNode;
  let variant: "default" | "secondary" | "destructive";

  if (hasName && hasDescription) {
    status = "complete";
    icon = <CheckCircle2 className="h-3 w-3" />;
    variant = "default";
  } else if (hasName || hasDescription) {
    status = "partial";
    icon = <AlertCircle className="h-3 w-3" />;
    variant = "secondary";
  } else {
    status = "missing";
    icon = <XCircle className="h-3 w-3" />;
    variant = "destructive";
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {icon}
      {t(`admin.${status}`)}
    </Badge>
  );
}
