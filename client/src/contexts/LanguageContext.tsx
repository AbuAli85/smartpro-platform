import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.sanadOffices": "Sanad Offices",
    "nav.documentTemplates": "Document Templates",
    "nav.myBookings": "My Bookings",
    "nav.myOffices": "My Offices",
    "nav.ownerDashboard": "Owner Dashboard",
    "nav.chatInbox": "Chat Inbox",
    "nav.chatAnalytics": "Chat Analytics",
    "nav.cannedResponses": "Canned Responses",
    "nav.staffManagement": "Staff Management",
    "nav.staffPerformance": "Staff Performance",
    "nav.followUpSettings": "Follow-up Settings",
    "nav.loyaltyRewards": "Loyalty Rewards",
    "nav.referFriends": "Refer Friends",
    "nav.analytics": "Analytics",
    "nav.userProfile": "User Profile",
    
    // Home page
    "home.title": "Everything You Need for Business Services",
    "home.subtitle": "A unified platform connecting SMEs with professional Sanad offices",
    "home.templates": "Document Templates",
    "home.templatesDesc": "Access thousands of business document templates",
    "home.browseTemplates": "Browse templates",
    "home.offices": "Trusted Offices",
    "home.officesDesc": "Connect with certified Sanad offices across Oman",
    "home.exploreOffices": "Explore offices",
    "home.government": "Government Integrated",
    "home.governmentDesc": "Direct integration with MOCIP, MOL, and ROP for seamless verification and compliance",
    "home.booking": "Book Services",
    "home.bookingDesc": "Schedule appointments online across all regions",
    "home.bookService": "Book a service",
    "home.trusted": "Trusted by SMEs",
    "home.trustedDesc": "Join thousands of Omani businesses using SmartPro for their business service needs",
    "home.fast": "Fast & Efficient",
    "home.fastDesc": "Reduce processing time from weeks to days with automated workflows and digital processes",
    "home.cta": "Ready to Transform Your Business Services?",
    "home.ctaDesc": "Join SmartPro today and experience the future of business services in Oman",
    "home.learnMore": "Learn More",
    "home.getStarted": "Get Started",
    
    // Common
    "common.signIn": "Sign In",
    "common.signOut": "Sign Out",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.close": "Close",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.sanadOffices": "مكاتب سند",
    "nav.documentTemplates": "قوالب المستندات",
    "nav.myBookings": "حجوزاتي",
    "nav.myOffices": "مكاتبي",
    "nav.ownerDashboard": "لوحة التحكم",
    "nav.chatInbox": "صندوق الدردشة",
    "nav.chatAnalytics": "تحليلات الدردشة",
    "nav.cannedResponses": "الردود الجاهزة",
    "nav.staffManagement": "إدارة الموظفين",
    "nav.staffPerformance": "أداء الموظفين",
    "nav.followUpSettings": "إعدادات المتابعة",
    "nav.loyaltyRewards": "مكافآت الولاء",
    "nav.referFriends": "إحالة الأصدقاء",
    "nav.analytics": "التحليلات",
    "nav.userProfile": "الملف الشخصي",
    
    // Home page
    "home.title": "كل ما تحتاجه لخدمات الأعمال",
    "home.subtitle": "منصة موحدة تربط الشركات الصغيرة والمتوسطة بمكاتب سند المهنية",
    "home.templates": "قوالب المستندات",
    "home.templatesDesc": "احصل على آلاف القوالب التجارية",
    "home.browseTemplates": "تصفح مكاتب سند",
    "home.offices": "مكاتب معتمدة",
    "home.officesDesc": "تواصل مع مكاتب سند الموثوقة",
    "home.exploreOffices": "استكشف المكاتب",
    "home.government": "متكامل حكوميًا",
    "home.governmentDesc": "تكامل مباشر مع وزارة التجارة والصناعة ووزارة العمل وشرطة عمان للتحقق السلس والامتثال",
    "home.booking": "حجز خدمة",
    "home.bookingDesc": "حدد المواعيد عبر الإنترنت في جميع المناطق",
    "home.bookService": "احجز خدمة",
    "home.trusted": "موثوق من قبل الشركات",
    "home.trustedDesc": "انضم إلى آلاف الشركات العمانية التي تستخدم SmartPro لاحتياجات خدمات أعمالها",
    "home.fast": "سريع وفعال",
    "home.fastDesc": "قلل وقت المعالجة من أسابيع إلى أيام باستخدام سير العمل الآلي والعمليات الرقمية",
    "home.cta": "هل أنت مستعد لتحويل خدمات عملك؟",
    "home.ctaDesc": "انضم إلى SmartPro اليوم واختبر مستقبل خدمات الأعمال في عمان",
    "home.learnMore": "اعرف المزيد",
    "home.getStarted": "ابدأ الآن",
    
    // Common
    "common.signIn": "تسجيل الدخول",
    "common.signOut": "تسجيل الخروج",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.view": "عرض",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.submit": "إرسال",
    "common.close": "إغلاق",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to English
    const saved = localStorage.getItem("smartpro-language");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem("smartpro-language", language);
    
    // Update document direction and lang attribute
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
