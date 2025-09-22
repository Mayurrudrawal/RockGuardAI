import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "hi";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    riskMap: "Risk Map",
    explainableAI: "Explainable AI",
    incidents: "Incidents",
    maintenance: "Maintenance",
    heroTitle: "The Future of Mine Safety is",
    heroPredictive: "Predictive",
    heroSubtitle:
      "Our AI-powered platform analyzes real-time data to forecast slope instability, protecting your people, assets, and operations.",
    predictPreventProtect: "Predict. Prevent. Protect.",
    viewRiskMap: "View Risk Map",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    riskMap: "जोखिम मानचित्र",
    explainableAI: "स्पष्टीकरणीय AI",
    incidents: "घटनाएँ",
    maintenance: "रखरखाव",
    heroTitle: "खदान सुरक्षा का भविष्य है",
    heroPredictive: "पूर्वानुमानित",
    heroSubtitle:
      "हमारा AI प्लेटफ़ॉर्म वास्तविक-समय डेटा का विश्लेषण कर ढलान अस्थिरता का पूर्वानुमान करता है, लोगों, परिसंपत्तियों और संचालन की रक्षा करता है।",
    predictPreventProtect: "पूर्वानुमान. रोकथ��म. सुरक्षा.",
    viewRiskMap: "जोखिम मानचित्र देखें",
  },
};

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: string) => string;
}

const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem("locale") as Locale) || "en");

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = useMemo(() => {
    const dict = translations[locale] || translations.en;
    return (k: string) => dict[k] ?? k;
  }, [locale]);

  return <LangCtx.Provider value={{ locale, setLocale, t }}>{children}</LangCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
