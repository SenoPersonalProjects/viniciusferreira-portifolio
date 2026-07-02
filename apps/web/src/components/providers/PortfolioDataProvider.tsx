"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fallbackPortfolioContent,
  type PortfolioContent,
} from "@/data/portfolioContent";
import { type Language } from "@/i18n/translations";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { buildApiUrl, getApiBaseUrl } from "@/lib/apiBaseUrl";

type PortfolioDataContextValue = {
  content: PortfolioContent;
  source: "fallback" | "api";
  isLoading: boolean;
};

const PortfolioDataContext =
  createContext<PortfolioDataContextValue | null>(null);

async function fetchPortfolioContent(language: Language) {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  const response = await fetch(
    `${buildApiUrl(apiBaseUrl, "/portfolio")}?locale=${encodeURIComponent(
      language,
    )}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Portfolio API returned ${response.status}`);
  }

  return (await response.json()) as PortfolioContent;
}

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [content, setContent] = useState<PortfolioContent>(
    fallbackPortfolioContent,
  );
  const [source, setSource] = useState<"fallback" | "api">("fallback");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setIsLoading(true);
      fetchPortfolioContent(language)
        .then((apiContent) => {
          if (!isMounted) {
            return;
          }

          if (apiContent) {
            setContent(apiContent);
            setSource("api");
          } else {
            setContent(fallbackPortfolioContent);
            setSource("fallback");
          }
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }

          setContent(fallbackPortfolioContent);
          setSource("fallback");
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      content,
      source,
      isLoading,
    }),
    [content, source, isLoading],
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);

  if (!context) {
    throw new Error(
      "usePortfolioData deve ser usado dentro de PortfolioDataProvider",
    );
  }

  return context;
}
