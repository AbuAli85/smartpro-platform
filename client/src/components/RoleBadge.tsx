import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type UserRole } from "@/hooks/useRoleAccess";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoleBadgeProps {
  role: UserRole;
  showTooltip?: boolean;
  className?: string;
}

const ROLE_CONFIG: Record<UserRole, { label: string, labelAr: string, color: string, description: string, descriptionAr: string }> = {
  user: {
    label: "User",
    labelAr: "مستخدم",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    description: "Browse offices, book services, and manage your requests",
    descriptionAr: "تصفح المكاتب، احجز الخدمات، وأدر طلباتك"
  },
  sanad_owner: {
    label: "Office Owner",
    labelAr: "مالك مكتب",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "Manage your office, staff, bookings, and analytics",
    descriptionAr: "إدارة مكتبك، الموظفين، الحجوزات، والتحليلات"
  },
  sanad_staff: {
    label: "Staff Member",
    labelAr: "موظف",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    description: "Handle bookings and communicate with customers",
    descriptionAr: "إدارة الحجوزات والتواصل مع العملاء"
  },
  sme_owner: {
    label: "Business Owner",
    labelAr: "صاحب عمل",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Post service requests and manage marketplace bids",
    descriptionAr: "نشر طلبات الخدمة وإدارة عروض السوق"
  },
  gig_worker: {
    label: "Freelancer",
    labelAr: "مستقل",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Provide translation services and earn rewards",
    descriptionAr: "تقديم خدمات الترجمة وكسب المكافآت"
  },
  government_official: {
    label: "Official",
    labelAr: "مسؤول حكومي",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    description: "Verify offices and monitor system analytics",
    descriptionAr: "التحقق من المكاتب ومراقبة تحليلات النظام"
  },
  admin: {
    label: "Administrator",
    labelAr: "مدير النظام",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    description: "Full system access and management capabilities",
    descriptionAr: "وصول كامل للنظام وقدرات الإدارة"
  },
};

export function RoleBadge({ role, showTooltip = false, className }: RoleBadgeProps) {
  const { language } = useLanguage();
  const config = ROLE_CONFIG[role];
  const isArabic = language === 'ar';

  const badge = (
    <Badge 
      variant="secondary" 
      className={`${config.color} text-xs font-medium px-2 py-0.5 ${className}`}
    >
      {isArabic ? config.labelAr : config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <div className="flex items-center gap-1.5">
      {badge}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-sm">
            {isArabic ? config.descriptionAr : config.description}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
