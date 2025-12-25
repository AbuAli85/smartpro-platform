import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.offices": "Sanad Offices",
      "nav.templates": "Document Templates",
      "nav.bookings": "My Bookings",
      "nav.myOffices": "My Offices",
      "nav.documents": "My Documents",
      "nav.login": "Sign In",
      "nav.logout": "Sign Out",
      
      // Home Page
      "home.title": "SmartPro",
      "home.subtitle": "National Digital Infrastructure for Business Services",
      "home.description": "Connect with certified Sanad offices across Oman. Access 3,000+ document templates. Complete your business services faster, cheaper, and smarter.",
      "home.cta": "Browse Sanad Offices",
      "home.features.title": "Why Choose SmartPro?",
      "home.features.offices.title": "Certified Sanad Offices",
      "home.features.offices.desc": "Connect with verified business service providers across all Oman governorates",
      "home.features.templates.title": "3,000+ Document Templates",
      "home.features.templates.desc": "Access professional templates for contracts, letters, NOCs, and more",
      "home.features.booking.title": "Easy Online Booking",
      "home.features.booking.desc": "Book services instantly and track your orders in real-time",
      
      // Offices
      "offices.title": "Sanad Offices",
      "offices.subtitle": "Browse certified Sanad offices across Oman",
      "offices.register": "Register Your Office",
      "offices.search": "Search offices by name or location...",
      "offices.filter": "All Governorates",
      "offices.verified": "Verified",
      "offices.instantBooking": "Instant Booking",
      "offices.viewOffice": "View Office",
      "offices.noResults": "No offices found",
      "offices.adjustSearch": "Try adjusting your search criteria",
      "offices.beFirst": "Be the first to register your Sanad office",
      "offices.reviews": "reviews",
      
      // Office Profile
      "office.back": "Back to Offices",
      "office.bookService": "Book Service",
      "office.about": "About",
      "office.services": "Services",
      "office.reviews": "Reviews",
      "office.aboutTitle": "About This Office",
      "office.location": "Location",
      "office.contact": "Contact Information",
      "office.phone": "Phone",
      "office.email": "Email",
      "office.website": "Website",
      "office.servicesTitle": "Available Services",
      "office.servicesDesc": "Professional business services offered by this office",
      "office.noReviews": "No reviews yet. Be the first to review!",
      "office.notFound": "Office Not Found",
      
      // Create Office
      "createOffice.title": "Register Your Sanad Office",
      "createOffice.subtitle": "Join SmartPro and reach thousands of SMEs across Oman",
      "createOffice.comingSoon": "Office registration form coming soon",
      "createOffice.description": "This feature will allow you to register your Sanad office with complete details, services, and verification documents.",
      
      // Templates
      "templates.title": "Document Templates",
      "templates.subtitle": "Access 3,000+ business document templates",
      "templates.comingSoon": "Template library coming soon",
      
      // Bookings
      "bookings.title": "My Bookings",
      "bookings.subtitle": "View and manage your service bookings",
      "bookings.none": "No bookings yet",
      
      // Documents
      "documents.title": "My Documents",
      "documents.subtitle": "Access your generated business documents",
      "documents.none": "No documents generated yet",
      
      // My Offices
      "myOffices.title": "My Offices",
      "myOffices.subtitle": "Manage your registered Sanad offices",
      "myOffices.none": "No offices registered yet",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.view": "View",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.previous": "Previous",
      "common.next": "Next",
      "common.page": "Page",
      "common.of": "of",
    },
  },
  ar: {
    translation: {
      // Navigation
      "nav.home": "الرئيسية",
      "nav.offices": "مكاتب السند",
      "nav.templates": "قوالب المستندات",
      "nav.bookings": "حجوزاتي",
      "nav.myOffices": "مكاتبي",
      "nav.documents": "مستنداتي",
      "nav.login": "تسجيل الدخول",
      "nav.logout": "تسجيل الخروج",
      
      // Home Page
      "home.title": "سمارت برو",
      "home.subtitle": "البنية التحتية الرقمية الوطنية لخدمات الأعمال",
      "home.description": "تواصل مع مكاتب السند المعتمدة في جميع أنحاء عُمان. احصل على أكثر من 3000 قالب مستند. أكمل خدماتك التجارية بشكل أسرع وأرخص وأذكى.",
      "home.cta": "تصفح مكاتب السند",
      "home.features.title": "لماذا تختار سمارت برو؟",
      "home.features.offices.title": "مكاتب سند معتمدة",
      "home.features.offices.desc": "تواصل مع مزودي خدمات الأعمال المعتمدين في جميع محافظات عُمان",
      "home.features.templates.title": "أكثر من 3000 قالب مستند",
      "home.features.templates.desc": "احصل على قوالب احترافية للعقود والخطابات وشهادات عدم الممانعة والمزيد",
      "home.features.booking.title": "حجز سهل عبر الإنترنت",
      "home.features.booking.desc": "احجز الخدمات فوراً وتتبع طلباتك في الوقت الفعلي",
      
      // Offices
      "offices.title": "مكاتب السند",
      "offices.subtitle": "تصفح مكاتب السند المعتمدة في جميع أنحاء عُمان",
      "offices.register": "سجل مكتبك",
      "offices.search": "ابحث عن المكاتب بالاسم أو الموقع...",
      "offices.filter": "جميع المحافظات",
      "offices.verified": "موثق",
      "offices.instantBooking": "حجز فوري",
      "offices.viewOffice": "عرض المكتب",
      "offices.noResults": "لم يتم العثور على مكاتب",
      "offices.adjustSearch": "حاول تعديل معايير البحث",
      "offices.beFirst": "كن أول من يسجل مكتب السند الخاص بك",
      "offices.reviews": "تقييمات",
      
      // Office Profile
      "office.back": "العودة إلى المكاتب",
      "office.bookService": "احجز خدمة",
      "office.about": "حول",
      "office.services": "الخدمات",
      "office.reviews": "التقييمات",
      "office.aboutTitle": "حول هذا المكتب",
      "office.location": "الموقع",
      "office.contact": "معلومات الاتصال",
      "office.phone": "الهاتف",
      "office.email": "البريد الإلكتروني",
      "office.website": "الموقع الإلكتروني",
      "office.servicesTitle": "الخدمات المتاحة",
      "office.servicesDesc": "خدمات الأعمال الاحترافية التي يقدمها هذا المكتب",
      "office.noReviews": "لا توجد تقييمات بعد. كن أول من يقيّم!",
      "office.notFound": "المكتب غير موجود",
      
      // Create Office
      "createOffice.title": "سجل مكتب السند الخاص بك",
      "createOffice.subtitle": "انضم إلى سمارت برو وتواصل مع آلاف الشركات الصغيرة والمتوسطة في عُمان",
      "createOffice.comingSoon": "نموذج تسجيل المكتب قريباً",
      "createOffice.description": "ستتيح لك هذه الميزة تسجيل مكتب السند الخاص بك مع التفاصيل الكاملة والخدمات ومستندات التحقق.",
      
      // Templates
      "templates.title": "قوالب المستندات",
      "templates.subtitle": "احصل على أكثر من 3000 قالب مستند تجاري",
      "templates.comingSoon": "مكتبة القوالب قريباً",
      
      // Bookings
      "bookings.title": "حجوزاتي",
      "bookings.subtitle": "عرض وإدارة حجوزات الخدمات الخاصة بك",
      "bookings.none": "لا توجد حجوزات بعد",
      
      // Documents
      "documents.title": "مستنداتي",
      "documents.subtitle": "الوصول إلى مستندات الأعمال المُنشأة",
      "documents.none": "لم يتم إنشاء مستندات بعد",
      
      // My Offices
      "myOffices.title": "مكاتبي",
      "myOffices.subtitle": "إدارة مكاتب السند المسجلة",
      "myOffices.none": "لم يتم تسجيل مكاتب بعد",
      
      // Common
      "common.loading": "جاري التحميل...",
      "common.error": "حدث خطأ",
      "common.save": "حفظ",
      "common.cancel": "إلغاء",
      "common.delete": "حذف",
      "common.edit": "تعديل",
      "common.view": "عرض",
      "common.search": "بحث",
      "common.filter": "تصفية",
      "common.previous": "السابق",
      "common.next": "التالي",
      "common.page": "صفحة",
      "common.of": "من",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
