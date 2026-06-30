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

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  resolvePublicSiteCopy,
  resolveSiteCopyValue,
  type SiteCopyMap,
} from "@/lib/siteCopyApi";
import type { Language } from "@/i18n/translations";

type SiteCopyContextValue = {
  isLoading: boolean;
  resolveCopy: (key: string, fallback: string) => string;
  source: "api" | "fallback";
};

type RemoteSiteCopyState = {
  copyMap: SiteCopyMap;
  language: Language;
};

const SiteCopyContext = createContext<SiteCopyContextValue | null>(null);

export function SiteCopyProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [remoteState, setRemoteState] = useState<RemoteSiteCopyState | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setIsLoading(Boolean(process.env.NEXT_PUBLIC_API_URL));

      resolvePublicSiteCopy(language).then((copyMap) => {
        if (!isMounted) {
          return;
        }

        setRemoteState({
          copyMap,
          language,
        });
        setIsLoading(false);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const activeCopyMap = useMemo(
    () => (remoteState?.language === language ? remoteState.copyMap : {}),
    [language, remoteState],
  );
  const source: SiteCopyContextValue["source"] =
    Object.keys(activeCopyMap).length > 0 ? "api" : "fallback";
  const resolveCopy = useCallback(
    (key: string, fallback: string) =>
      resolveSiteCopyValue(activeCopyMap, key, fallback),
    [activeCopyMap],
  );

  const value = useMemo(
    () => ({
      isLoading,
      resolveCopy,
      source,
    }),
    [isLoading, resolveCopy, source],
  );

  return (
    <SiteCopyContext.Provider value={value}>
      {children}
    </SiteCopyContext.Provider>
  );
}

export function useSiteCopy() {
  const context = useContext(SiteCopyContext);

  if (!context) {
    throw new Error("useSiteCopy deve ser usado dentro de SiteCopyProvider");
  }

  return context;
}
