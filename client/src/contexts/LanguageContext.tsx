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
    "common.confirm": "Confirm",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.select": "Select",
    "common.all": "All",
    "common.none": "None",
    "common.apply": "Apply",
    "common.reset": "Reset",
    "common.clear": "Clear",
    
    // Offices
    "offices.title": "Sanad Offices",
    "offices.subtitle": "Find certified business service offices across Oman",
    "offices.searchPlaceholder": "Search by name or location...",
    "offices.filterByRegion": "Filter by Region",
    "offices.filterByService": "Filter by Service",
    "offices.allRegions": "All Regions",
    "offices.allServices": "All Services",
    "offices.noResults": "No offices found matching your criteria",
    "offices.viewProfile": "View Profile",
    "offices.bookNow": "Book Now",
    "offices.rating": "Rating",
    "offices.reviews": "Reviews",
    "offices.services": "Services",
    "offices.location": "Location",
    "offices.contact": "Contact",
    "offices.about": "About",
    "offices.workingHours": "Working Hours",
    "offices.closed": "Closed",
    "offices.highestRated": "Highest Rated",
    "offices.mostReviews": "Most Reviews",
    "offices.nameAZ": "Name (A-Z)",
    "offices.showing": "Showing",
    "offices.of": "of",
    "offices.offices": "offices",
    
    // Templates
    "templates.title": "Document Templates",
    "templates.subtitle": "Access thousands of business document templates",
    "templates.searchPlaceholder": "Search templates...",
    "templates.category": "Category",
    "templates.allCategories": "All Categories",
    "templates.language": "Language",
    "templates.useTemplate": "Use Template",
    "templates.preview": "Preview",
    "templates.download": "Download",
    "templates.fillForm": "Fill Form",
    "templates.generate": "Generate Document",
    "templates.generating": "Generating...",
    "templates.noResults": "No templates found",
    
    // Bookings
    "bookings.title": "My Bookings",
    "bookings.upcoming": "Upcoming",
    "bookings.past": "Past",
    "bookings.cancelled": "Cancelled",
    "bookings.noBookings": "No bookings found",
    "bookings.bookingDate": "Booking Date",
    "bookings.service": "Service",
    "bookings.office": "Office",
    "bookings.status": "Status",
    "bookings.actions": "Actions",
    "bookings.cancel": "Cancel Booking",
    "bookings.reschedule": "Reschedule",
    "bookings.viewDetails": "View Details",
    "bookings.confirmCancel": "Are you sure you want to cancel this booking?",
    "bookings.selectDate": "Select Date",
    "bookings.selectTime": "Select Time",
    "bookings.confirmBooking": "Confirm Booking",
    
    // Profile
    "profile.title": "My Profile",
    "profile.personalInfo": "Personal Information",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.language": "Preferred Language",
    "profile.updateProfile": "Update Profile",
    "profile.changePassword": "Change Password",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm Password",
    "profile.updateSuccess": "Profile updated successfully",
    "profile.updateError": "Failed to update profile",
    
    // Validation
    "validation.required": "This field is required",
    "validation.email": "Please enter a valid email address",
    "validation.phone": "Please enter a valid phone number",
    "validation.minLength": "Minimum length is {min} characters",
    "validation.maxLength": "Maximum length is {max} characters",
    "validation.passwordMatch": "Passwords do not match",
    
    // Messages
    "message.success": "Operation completed successfully",
    "message.error": "An error occurred. Please try again",
    "message.saveSuccess": "Saved successfully",
    "message.deleteSuccess": "Deleted successfully",
    "message.updateSuccess": "Updated successfully",
    "message.createSuccess": "Created successfully",
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
    "common.confirm": "تأكيد",
    "common.download": "تحميل",
    "common.upload": "رفع",
    "common.select": "اختيار",
    "common.all": "الكل",
    "common.none": "لا شيء",
    "common.apply": "تطبيق",
    "common.reset": "إعادة تعيين",
    "common.clear": "مسح",
    
    // Offices
    "offices.title": "مكاتب سند",
    "offices.subtitle": "اعثر على مكاتب خدمات الأعمال المعتمدة في جميع أنحاء عمان",
    "offices.searchPlaceholder": "البحث بالاسم أو الموقع...",
    "offices.filterByRegion": "تصفية حسب المنطقة",
    "offices.filterByService": "تصفية حسب الخدمة",
    "offices.allRegions": "جميع المناطق",
    "offices.allServices": "جميع الخدمات",
    "offices.noResults": "لم يتم العثور على مكاتب تطابق معاييرك",
    "offices.viewProfile": "عرض الملف الشخصي",
    "offices.bookNow": "احجز الآن",
    "offices.rating": "التقييم",
    "offices.reviews": "المراجعات",
    "offices.services": "الخدمات",
    "offices.location": "الموقع",
    "offices.contact": "الاتصال",
    "offices.about": "عن المكتب",
    "offices.workingHours": "ساعات العمل",
    "offices.closed": "مغلق",
    "offices.highestRated": "الأعلى تقييماً",
    "offices.mostReviews": "الأكثر مراجعات",
    "offices.nameAZ": "الاسم (أ-ي)",
    "offices.showing": "عرض",
    "offices.of": "من",
    "offices.offices": "مكاتب",
    
    // Templates
    "templates.title": "قوالب المستندات",
    "templates.subtitle": "احصل على آلاف قوالب مستندات الأعمال",
    "templates.searchPlaceholder": "البحث عن القوالب...",
    "templates.category": "الفئة",
    "templates.allCategories": "جميع الفئات",
    "templates.language": "اللغة",
    "templates.useTemplate": "استخدم القالب",
    "templates.preview": "معاينة",
    "templates.download": "تحميل",
    "templates.fillForm": "ملء النموذج",
    "templates.generate": "إنشاء المستند",
    "templates.generating": "جاري الإنشاء...",
    "templates.noResults": "لم يتم العثور على قوالب",
    
    // Bookings
    "bookings.title": "حجوزاتي",
    "bookings.upcoming": "القادمة",
    "bookings.past": "السابقة",
    "bookings.cancelled": "الملغاة",
    "bookings.noBookings": "لا توجد حجوزات",
    "bookings.bookingDate": "تاريخ الحجز",
    "bookings.service": "الخدمة",
    "bookings.office": "المكتب",
    "bookings.status": "الحالة",
    "bookings.actions": "الإجراءات",
    "bookings.cancel": "إلغاء الحجز",
    "bookings.reschedule": "إعادة الجدولة",
    "bookings.viewDetails": "عرض التفاصيل",
    "bookings.confirmCancel": "هل أنت متأكد من إلغاء هذا الحجز؟",
    "bookings.selectDate": "اختر التاريخ",
    "bookings.selectTime": "اختر الوقت",
    "bookings.confirmBooking": "تأكيد الحجز",
    
    // Profile
    "profile.title": "ملفي الشخصي",
    "profile.personalInfo": "المعلومات الشخصية",
    "profile.name": "الاسم",
    "profile.email": "البريد الإلكتروني",
    "profile.phone": "رقم الهاتف",
    "profile.language": "اللغة المفضلة",
    "profile.updateProfile": "تحديث الملف الشخصي",
    "profile.changePassword": "تغيير كلمة المرور",
    "profile.currentPassword": "كلمة المرور الحالية",
    "profile.newPassword": "كلمة المرور الجديدة",
    "profile.confirmPassword": "تأكيد كلمة المرور",
    "profile.updateSuccess": "تم تحديث الملف الشخصي بنجاح",
    "profile.updateError": "فشل تحديث الملف الشخصي",
    
    // Validation
    "validation.required": "هذا الحقل مطلوب",
    "validation.email": "يرجى إدخال عنوان بريد إلكتروني صحيح",
    "validation.phone": "يرجى إدخال رقم هاتف صحيح",
    "validation.minLength": "الحد الأدنى للطول هو {min} أحرف",
    "validation.maxLength": "الحد الأقصى للطول هو {max} أحرف",
    "validation.passwordMatch": "كلمات المرور غير متطابقة",
    
    // Messages
    "message.success": "تمت العملية بنجاح",
    "message.error": "حدث خطأ. يرجى المحاولة مرة أخرى",
    "message.saveSuccess": "تم الحفظ بنجاح",
    "message.deleteSuccess": "تم الحذف بنجاح",
    "message.updateSuccess": "تم التحديث بنجاح",
    "message.createSuccess": "تم الإنشاء بنجاح",
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
