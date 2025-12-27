import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export type Region = "all" | "muscat" | "dhofar" | "batinah" | "sharqiyah" | "dakhliyah";

interface RegionalContent {
  en: string;
  ar: string;
}

// Regional content variations for different regions
const regionalVariations: Record<string, Record<Region, RegionalContent>> = {
  "home.hero.title": {
    all: {
      en: "Everything You Need for Business Services",
      ar: "كل ما تحتاجه لخدمات الأعمال",
    },
    muscat: {
      en: "Business Services in Muscat",
      ar: "خدمات الأعمال في مسقط",
    },
    dhofar: {
      en: "Business Services in Dhofar",
      ar: "خدمات الأعمال في ظفار",
    },
    batinah: {
      en: "Business Services in Batinah",
      ar: "خدمات الأعمال في الباطنة",
    },
    sharqiyah: {
      en: "Business Services in Sharqiyah",
      ar: "خدمات الأعمال في الشرقية",
    },
    dakhliyah: {
      en: "Business Services in Dakhliyah",
      ar: "خدمات الأعمال في الداخلية",
    },
  },
  "home.hero.subtitle": {
    all: {
      en: "Connect with verified business service offices across Oman. From company registration to legal documentation, find trusted professionals for all your business needs.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في جميع أنحاء عمان. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين لجميع احتياجاتك التجارية.",
    },
    muscat: {
      en: "Connect with verified business service offices in Muscat. From company registration to legal documentation, find trusted professionals in the capital.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في مسقط. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين في العاصمة.",
    },
    dhofar: {
      en: "Connect with verified business service offices in Dhofar. From company registration to legal documentation, find trusted professionals in the south.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في ظفار. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين في الجنوب.",
    },
    batinah: {
      en: "Connect with verified business service offices in Batinah. From company registration to legal documentation, find trusted professionals in your region.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في الباطنة. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين في منطقتك.",
    },
    sharqiyah: {
      en: "Connect with verified business service offices in Sharqiyah. From company registration to legal documentation, find trusted professionals in your region.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في الشرقية. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين في منطقتك.",
    },
    dakhliyah: {
      en: "Connect with verified business service offices in Dakhliyah. From company registration to legal documentation, find trusted professionals in your region.",
      ar: "تواصل مع مكاتب خدمات الأعمال الموثقة في الداخلية. من تسجيل الشركات إلى الوثائق القانونية، اعثر على محترفين موثوقين في منطقتك.",
    },
  },
};

export function useRegionalContent() {
  const { language } = useLanguage();
  const [region, setRegionState] = useState<Region>(() => {
    const saved = localStorage.getItem("smartpro-region");
    return (saved as Region) || "all";
  });

  const setRegion = (newRegion: Region) => {
    setRegionState(newRegion);
    localStorage.setItem("smartpro-region", newRegion);
  };

  // Get regional content for a specific key
  const getRegionalContent = (key: string): string => {
    const content = regionalVariations[key];
    if (content && content[region]) {
      return content[region][language];
    }
    // Fallback to "all" region if specific region not found
    if (content && content.all) {
      return content.all[language];
    }
    return key;
  };

  return {
    region,
    setRegion,
    getRegionalContent,
  };
}
