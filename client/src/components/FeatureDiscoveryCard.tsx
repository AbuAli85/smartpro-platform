import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useRoleAccess, type RolePermissions } from "@/hooks/useRoleAccess";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

interface Feature {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  href: string;
  permission?: keyof RolePermissions;
}

const FEATURES_BY_ROLE: Record<string, Feature[]> = {
  user: [
    {
      title: "Browse Offices",
      titleAr: "تصفح المكاتب",
      description: "Find verified business service offices across Oman",
      descriptionAr: "ابحث عن مكاتب خدمات الأعمال المعتمدة في عموم عمان",
      href: "/offices"
    },
    {
      title: "Book Services",
      titleAr: "احجز الخدمات",
      description: "Schedule appointments and track your bookings",
      descriptionAr: "حدد المواعيد وتتبع حجوزاتك",
      href: "/bookings",
      permission: "canCreateBooking"
    },
    {
      title: "Request Services",
      titleAr: "اطلب الخدمات",
      description: "Post service requests and receive bids from providers",
      descriptionAr: "انشر طلبات الخدمة واستلم العروض من مقدمي الخدمات",
      href: "/request-service",
      permission: "canPostServiceRequest"
    },
  ],
  sanad_owner: [
    {
      title: "Manage Your Office",
      titleAr: "إدارة مكتبك",
      description: "Update office info, services, and availability",
      descriptionAr: "تحديث معلومات المكتب والخدمات والتوفر",
      href: "/my-offices",
      permission: "canManageOffice"
    },
    {
      title: "View Analytics",
      titleAr: "عرض التحليلات",
      description: "Track bookings, revenue, and customer insights",
      descriptionAr: "تتبع الحجوزات والإيرادات ورؤى العملاء",
      href: "/owner/analytics",
      permission: "canViewOfficeAnalytics"
    },
    {
      title: "Chat with Customers",
      titleAr: "الدردشة مع العملاء",
      description: "Respond to inquiries and manage conversations",
      descriptionAr: "الرد على الاستفسارات وإدارة المحادثات",
      href: "/owner/chat",
      permission: "canAccessChatInbox"
    },
    {
      title: "Manage Staff",
      titleAr: "إدارة الموظفين",
      description: "Add team members and track performance",
      descriptionAr: "إضافة أعضاء الفريق وتتبع الأداء",
      href: "/owner/staff",
      permission: "canManageStaff"
    },
  ],
  sanad_staff: [
    {
      title: "Handle Bookings",
      titleAr: "إدارة الحجوزات",
      description: "Process customer appointments and requests",
      descriptionAr: "معالجة مواعيد العملاء والطلبات",
      href: "/bookings",
      permission: "canManageBookings"
    },
    {
      title: "Customer Chat",
      titleAr: "دردشة العملاء",
      description: "Communicate with customers in real-time",
      descriptionAr: "التواصل مع العملاء في الوقت الفعلي",
      href: "/owner/chat",
      permission: "canAccessChatInbox"
    },
  ],
  sme_owner: [
    {
      title: "Post Service Requests",
      titleAr: "نشر طلبات الخدمة",
      description: "Describe your needs and receive competitive bids",
      descriptionAr: "اوصف احتياجاتك واستلم عروضًا تنافسية",
      href: "/request-service",
      permission: "canPostServiceRequest"
    },
    {
      title: "Browse Marketplace",
      titleAr: "تصفح السوق",
      description: "Find service providers and compare offers",
      descriptionAr: "ابحث عن مقدمي الخدمات وقارن العروض",
      href: "/marketplace",
      permission: "canSubmitBids"
    },
    {
      title: "Manage Requests",
      titleAr: "إدارة الطلبات",
      description: "Track your service requests and bids",
      descriptionAr: "تتبع طلبات الخدمة والعروض الخاصة بك",
      href: "/my-requests",
      permission: "canManageServiceRequests"
    },
  ],
  admin: [
    {
      title: "Admin Dashboard",
      titleAr: "لوحة المدير",
      description: "Monitor system health and key metrics",
      descriptionAr: "مراقبة صحة النظام والمقاييس الرئيسية",
      href: "/admin",
      permission: "canAccessAdminPanel"
    },
    {
      title: "Manage Users",
      titleAr: "إدارة المستخدمين",
      description: "View and manage all platform users",
      descriptionAr: "عرض وإدارة جميع مستخدمي المنصة",
      href: "/admin/users",
      permission: "canManageUsers"
    },
    {
      title: "Verify Offices",
      titleAr: "التحقق من المكاتب",
      description: "Review and approve office registrations",
      descriptionAr: "مراجعة والموافقة على تسجيلات المكاتب",
      href: "/admin/office-verification",
      permission: "canVerifyOffices"
    },
  ],
};

const STORAGE_KEY = "feature_discovery_dismissed";

export function FeatureDiscoveryCard() {
  const { role, hasPermission } = useRoleAccess();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the card
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Show card for new users after a short delay
      const timer = setTimeout(() => setIsDismissed(false), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (isDismissed) return null;

  // Get features for the current role
  const roleFeatures = FEATURES_BY_ROLE[role] || FEATURES_BY_ROLE.user;
  
  // Filter features based on permissions
  const availableFeatures = roleFeatures.filter(feature => 
    !feature.permission || hasPermission(feature.permission)
  );

  if (availableFeatures.length === 0) return null;

  return (
    <Card className="mx-3 mb-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">
              {isArabic ? "ماذا يمكنك أن تفعل" : "What You Can Do"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          {isArabic 
            ? "استكشف الميزات المتاحة لك" 
            : "Explore features available to you"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {availableFeatures.slice(0, 3).map((feature, index) => (
          <Link key={index} href={feature.href}>
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors cursor-pointer group">
              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {isArabic ? feature.titleAr : feature.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isArabic ? feature.descriptionAr : feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {availableFeatures.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            {isArabic 
              ? `و ${availableFeatures.length - 3} ميزات أخرى...` 
              : `And ${availableFeatures.length - 3} more features...`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
