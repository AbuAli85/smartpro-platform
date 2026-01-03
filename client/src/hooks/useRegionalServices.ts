import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Region } from "./useRegionalContent";

export interface RegionalService {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  category: string;
  popular: boolean;
}

// Region-specific featured services
const regionalServices: Record<Region, RegionalService[]> = {
  all: [
    {
      id: "business-registration",
      nameKey: "services.businessRegistration",
      descriptionKey: "services.businessRegistrationDesc",
      icon: "📋",
      category: "Business Registration",
      popular: true,
    },
    {
      id: "legal-services",
      nameKey: "services.legalServices",
      descriptionKey: "services.legalServicesDesc",
      icon: "⚖️",
      category: "Legal Services",
      popular: true,
    },
    {
      id: "accounting-tax",
      nameKey: "services.accountingTax",
      descriptionKey: "services.accountingTaxDesc",
      icon: "💰",
      category: "Accounting & Tax",
      popular: true,
    },
    {
      id: "hr-payroll",
      nameKey: "services.hrPayroll",
      descriptionKey: "services.hrPayrollDesc",
      icon: "👥",
      category: "HR & Payroll",
      popular: false,
    },
  ],
  muscat: [
    {
      id: "port-logistics",
      nameKey: "services.portLogistics",
      descriptionKey: "services.portLogisticsDesc",
      icon: "🚢",
      category: "Port & Logistics",
      popular: true,
    },
    {
      id: "import-export",
      nameKey: "services.importExport",
      descriptionKey: "services.importExportDesc",
      icon: "📦",
      category: "Import & Export",
      popular: true,
    },
    {
      id: "business-registration",
      nameKey: "services.businessRegistration",
      descriptionKey: "services.businessRegistrationDesc",
      icon: "📋",
      category: "Business Registration",
      popular: true,
    },
    {
      id: "corporate-services",
      nameKey: "services.corporateServices",
      descriptionKey: "services.corporateServicesDesc",
      icon: "🏢",
      category: "Corporate Services",
      popular: false,
    },
  ],
  dhofar: [
    {
      id: "tourism-services",
      nameKey: "services.tourismServices",
      descriptionKey: "services.tourismServicesDesc",
      icon: "🏖️",
      category: "Tourism Services",
      popular: true,
    },
    {
      id: "hospitality-licensing",
      nameKey: "services.hospitalityLicensing",
      descriptionKey: "services.hospitalityLicensingDesc",
      icon: "🏨",
      category: "Hospitality Licensing",
      popular: true,
    },
    {
      id: "frankincense-trade",
      nameKey: "services.frankincenseTrade",
      descriptionKey: "services.frankincenseTradeDesc",
      icon: "🌿",
      category: "Frankincense Trade",
      popular: true,
    },
    {
      id: "cultural-heritage",
      nameKey: "services.culturalHeritage",
      descriptionKey: "services.culturalHeritageDesc",
      icon: "🏛️",
      category: "Cultural Heritage",
      popular: false,
    },
  ],
  batinah: [
    {
      id: "agriculture-licensing",
      nameKey: "services.agricultureLicensing",
      descriptionKey: "services.agricultureLicensingDesc",
      icon: "🌾",
      category: "Agriculture Licensing",
      popular: true,
    },
    {
      id: "fishing-permits",
      nameKey: "services.fishingPermits",
      descriptionKey: "services.fishingPermitsDesc",
      icon: "🎣",
      category: "Fishing Permits",
      popular: true,
    },
    {
      id: "food-processing",
      nameKey: "services.foodProcessing",
      descriptionKey: "services.foodProcessingDesc",
      icon: "🍽️",
      category: "Food Processing",
      popular: true,
    },
    {
      id: "environmental-permits",
      nameKey: "services.environmentalPermits",
      descriptionKey: "services.environmentalPermitsDesc",
      icon: "🌱",
      category: "Environmental Permits",
      popular: false,
    },
  ],
  sharqiyah: [
    {
      id: "maritime-services",
      nameKey: "services.maritimeServices",
      descriptionKey: "services.maritimeServicesDesc",
      icon: "⚓",
      category: "Maritime Services",
      popular: true,
    },
    {
      id: "fishing-industry",
      nameKey: "services.fishingIndustry",
      descriptionKey: "services.fishingIndustryDesc",
      icon: "🐟",
      category: "Fishing Industry",
      popular: true,
    },
    {
      id: "coastal-tourism",
      nameKey: "services.coastalTourism",
      descriptionKey: "services.coastalTourismDesc",
      icon: "🏝️",
      category: "Coastal Tourism",
      popular: true,
    },
    {
      id: "marine-conservation",
      nameKey: "services.marineConservation",
      descriptionKey: "services.marineConservationDesc",
      icon: "🐢",
      category: "Marine Conservation",
      popular: false,
    },
  ],
  dakhliyah: [
    {
      id: "heritage-business",
      nameKey: "services.heritageBusiness",
      descriptionKey: "services.heritageBusinessDesc",
      icon: "🕌",
      category: "Heritage Business",
      popular: true,
    },
    {
      id: "traditional-crafts",
      nameKey: "services.traditionalCrafts",
      descriptionKey: "services.traditionalCraftsDesc",
      icon: "🎨",
      category: "Traditional Crafts",
      popular: true,
    },
    {
      id: "dates-trading",
      nameKey: "services.datesTrading",
      descriptionKey: "services.datesTradingDesc",
      icon: "🌴",
      category: "Dates Trading",
      popular: true,
    },
    {
      id: "cultural-tourism",
      nameKey: "services.culturalTourism",
      descriptionKey: "services.culturalTourismDesc",
      icon: "🏰",
      category: "Cultural Tourism",
      popular: false,
    },
  ],
};

export function useRegionalServices(region: Region) {
  const { t } = useLanguage();

  const services = useMemo(() => {
    const regionServices = regionalServices[region] || regionalServices.all;
    return regionServices.map(service => ({
      ...service,
      name: t(service.nameKey),
      description: t(service.descriptionKey),
    }));
  }, [region, t]);

  const popularServices = useMemo(() => {
    return services.filter(s => s.popular);
  }, [services]);

  return {
    services,
    popularServices,
  };
}
