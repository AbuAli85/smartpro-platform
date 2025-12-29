import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    console.log('[LanguageToggle] Toggling language from', language, 'to', newLang);
    setLanguage(newLang);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleLanguage}
      title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {language === "en" ? "Switch language" : "تبديل اللغة"}
      </span>
    </Button>
  );
}
