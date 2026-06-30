"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type Language,
  translations,
} from "@/i18n/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  dictionary: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "pt-BR" || value === "en";
}

function getBrowserLanguage(): Language {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  return browserLanguages.some((language) =>
    language.toLowerCase().startsWith("pt"),
  )
    ? "pt-BR"
    : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "pt-BR" ? "en" : "pt-BR");
  }, [language, setLanguage]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

      setLanguageState(
        isLanguage(storedLanguage) ? storedLanguage : getBrowserLanguage(),
      );
    }, 0);

    return () => {
      window.clearTimeout(hydrationTimer);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.lang = language;
    root.setAttribute("data-language", language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      dictionary: translations[language],
    }),
    [language, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de LanguageProvider");
  }

  return context;
}
