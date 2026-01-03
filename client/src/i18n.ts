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
      "home.affordability.title": "Affordable Omanization at 400 OMR",
      "home.affordability.subtitle": "Making compliance accessible for small businesses",
      "home.affordability.description": "SmartPro enables small businesses to hire Omani employees at 400 OMR minimum (including PASI support) - 73% less than traditional 1,500 OMR/month PRO services. Real work, real compliance, affordable pricing.",
      "home.cta": "Browse Sanad Offices",
      "home.features.title": "Why Choose SmartPro?",
      "home.features.offices.title": "Certified Sanad Offices",
      "home.features.offices.desc": "Connect with verified business service providers across all Oman governorates",
      "home.features.templates.title": "3,000+ Document Templates",
      "home.features.templates.desc": "Access professional templates for contracts, letters, NOCs, and more",
      "home.features.booking.title": "Easy Online Booking",
      "home.features.booking.desc": "Book services instantly and track your orders in real-time",
      "home.hero.badge": "Enabling Omanization for 26,000+ Small Businesses",
      "home.hero.impactStatement": "Simplifying business, strengthening Omanization, and securing the future of Omani employment",
      
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
      
      // Pricing & Affordability
      "pricing.traditional": "Traditional PRO Services",
      "pricing.traditional.cost": "1,500 OMR/month",
      "pricing.traditional.desc": "Too expensive for small businesses",
      "pricing.smartpro": "SmartPro Solution",
      "pricing.smartpro.cost": "400 OMR minimum",
      "pricing.smartpro.desc": "With PASI support - Real work, real compliance",
      "pricing.savings": "Your Savings",
      "pricing.savings.amount": "73% Less",
      "pricing.savings.desc": "Save 1,100 OMR/month - Accessible for 26,000+ SMEs",
      
      // Stats
      "home.stats.verifiedOffices": "Verified Offices",
      "home.stats.servicesCompleted": "Services Completed",
      "home.stats.avgRating": "Average Rating",
      
      // Feature Cards
      "home.featureCards.sectionBadge": "Platform Features",
      "home.featureCards.sectionTitle": "Everything You Need",
      "home.featureCards.sectionSubtitle": "Comprehensive business services in one platform",
      "home.featureCards.verifiedOffices": "Verified Sanad Offices",
      "home.featureCards.verifiedOfficesDesc": "Access certified business service providers across all Oman governorates",
      "home.featureCards.exploreOffices": "Explore Offices",
      "home.featureCards.marketplace": "Service Marketplace",
      "home.featureCards.marketplaceDesc": "Browse and compare services from multiple offices",
      "home.featureCards.browseMarketplace": "Browse Marketplace",
      "home.featureCards.documentTemplates": "Document Templates",
      "home.featureCards.documentTemplatesDesc": "3,000+ professional templates for all business needs",
      "home.featureCards.viewTemplates": "View Templates",
      "home.featureCards.easyBooking": "Easy Booking",
      "home.featureCards.easyBookingDesc": "Book services instantly and track in real-time",
      "home.featureCards.myBookings": "My Bookings",
      "home.featureCards.realtimeChat": "Real-time Chat",
      "home.featureCards.realtimeChatDesc": "Direct communication with office owners",
      "home.featureCards.openChat": "Open Chat",
      "home.featureCards.loyaltyRewards": "Loyalty Rewards",
      "home.featureCards.loyaltyRewardsDesc": "Earn points and get discounts on services",
      "home.featureCards.viewRewards": "View Rewards",
      
      // How It Works
      "home.how.badge": "Simple Process",
      "home.how.title": "How It Works",
      "home.how.subtitle": "Get started in three easy steps",
      "home.how.step1.title": "Browse & Compare",
      "home.how.step1.desc": "Search verified Sanad offices and compare services",
      "home.how.step2.title": "Book Service",
      "home.how.step2.desc": "Select your service and schedule appointment",
      "home.how.step3.title": "Get It Done",
      "home.how.step3.desc": "Track progress and receive completed documents",
      
      // Regional
      "home.browseOffices": "Browse Offices",
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
      "home.affordability.title": "التعمين بأسعار معقولة بـ 400 ريال عماني",
      "home.affordability.subtitle": "جعل الامتثال في متناول الشركات الصغيرة",
      "home.affordability.description": "تمكّن سمارت برو الشركات الصغيرة من توظيف موظفين عمانيين بحد أدنى 400 ريال عماني (بما في ذلك دعم التأمينات الاجتماعية) - أقل بنسبة 73٪ من خدمات PRO التقليدية البالغة 1,500 ريال عماني شهرياً. عمل حقيقي، امتثال حقيقي، أسعار معقولة.",
      "home.cta": "تصفح مكاتب السند",
      "home.features.title": "لماذا تختار سمارت برو؟",
      "home.features.offices.title": "مكاتب سند معتمدة",
      "home.features.offices.desc": "تواصل مع مزودي خدمات الأعمال المعتمدين في جميع محافظات عُمان",
      "home.features.templates.title": "أكثر من 3000 قالب مستند",
      "home.features.templates.desc": "احصل على قوالب احترافية للعقود والخطابات وشهادات عدم الممانعة والمزيد",
      "home.features.booking.title": "حجز سهل عبر الإنترنت",
      "home.features.booking.desc": "احجز الخدمات فوراً وتتبع طلباتك في الوقت الفعلي",
      "home.hero.badge": "تمكين التعمين لأكثر من 26,000 شركة صغيرة",
      "home.hero.impactStatement": "تبسيط الأعمال، تعزيز التعمين، وتأمين مستقبل التوظيف العماني",
      
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
