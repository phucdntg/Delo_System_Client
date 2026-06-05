import { useCallback, useMemo, useState } from "react";
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

const allTranslations = { vi: viTranslations, en: enTranslations };

export const TranslateProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem(LANGUAGE) || "vi",
  );

  const translate = useCallback(
    (key) =>
      key.split(".").reduce((o, k) => o?.[k], allTranslations[language]) ?? key,
    [language],
  );

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE, lang);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, translate, changeLanguage }),
    [language, translate, changeLanguage],
  );

  return (
    <TranslateContext.Provider value={value}>
      {children}
    </TranslateContext.Provider>
  );
};
