import { createContext, useContext, useState } from "react";
import { LANGUAGE } from "../../shared/constants/systemConstants";
import { toNamespaceObject } from "../../shared/utils/translateHelper";

const TranslateContext = createContext();

const viNamespaceModules = import.meta.glob("../../assets/locales/vi/*.json", {
  eager: true,
});
const enNamespaceModules = import.meta.glob("../../assets/locales/en/*.json", {
  eager: true,
});

const viTranslations = toNamespaceObject(viNamespaceModules);
const enTranslations = toNamespaceObject(enNamespaceModules);

// ĐANG ĐI XEM LÀM SAO MÀ CÓ THỂ LOAD ĐƯỢC NHIỀU FILE JSON DÙNG CHUNG 1 KEY NHƯ VẬY ĐÚNG HONG :V
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

export const useTranslate = () => {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error("useTranslate must be used within a TranslateProvider");
  }
  return context;
};
