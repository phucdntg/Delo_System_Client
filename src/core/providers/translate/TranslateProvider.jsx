import { useState } from "react";
import { LANGUAGE } from "@shared/constants/systemConstants";
import { toNamespaceObject } from "@shared/utils/translateHelper";
import TranslateContext from "./useTranslate";

const viNamespaceModules = import.meta.glob("@assets/locales/vi/*.json", {
  eager: true,
});
const enNamespaceModules = import.meta.glob("@assets/locales/en/*.json", {
  eager: true,
});

const viTranslations = toNamespaceObject(viNamespaceModules);
const enTranslations = toNamespaceObject(enNamespaceModules);

export const TranslateProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem(LANGUAGE) || "vi",
  );

  const translations = {
    vi: viTranslations,
    en: enTranslations,
  };

  const translate = (key) =>
    key.split(".").reduce((o, k) => o?.[k], translations[language]) ?? key;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE, lang);
  };

  return (
    <TranslateContext.Provider
      value={{ language, setLanguage, translate, changeLanguage }}
    >
      {children}
    </TranslateContext.Provider>
  );
};
