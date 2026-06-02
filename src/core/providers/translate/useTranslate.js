import { createContext, useContext } from "react";

const TranslateContext = createContext();

export function useTranslate() {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error("useTranslate must be used within a TranslateProvider");
  }
  return context;
}

export default TranslateContext;
