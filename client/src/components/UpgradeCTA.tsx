import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, X } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export function UpgradeCTA() {
  const { user } = useAuth();
  const { hasPermission } = useRoleAccess();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user already owns an office
  const { data: offices } = trpc.offices.myOffices.useQuery(undefined, {
    enabled: !!user,
  });

  // Only show to regular users who don't own offices
  const shouldShow = user && 
    !hasPermission("canManageOffice") && 
    (!offices || offices.length === 0) &&
    !isDismissed;

  if (!shouldShow) return null;

  return (
    <Card className="mx-3 mb-4 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-md">
      <CardContent className="p-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-600 dark:bg-blue-500">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {isArabic ? "كن مالك مكتب" : "Become an Office Owner"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic 
                ? "سجل مكتبك واحصل على حجوزات وعملاء جدد" 
                : "Register your office and get bookings from customers"}
            </p>
          </div>
        </div>

        <Link href="/register-office">
          <Button 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white group"
          >
            {isArabic ? "سجل الآن" : "Register Now"}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isArabic ? "المزايا:" : "Benefits:"}
            </span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium">
                {isArabic ? "حجوزات" : "Bookings"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-medium">
                {isArabic ? "تحليلات" : "Analytics"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
