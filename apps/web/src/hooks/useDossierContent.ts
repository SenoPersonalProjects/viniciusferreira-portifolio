"use client";

import { useEffect, useState } from "react";

import type { DossierLocale } from "@/data/dossier";
import {
  getFallbackDossierContent,
  resolvePublicDossierContent,
  type ResolvedDossierContent,
} from "@/lib/dossierApi";

type DossierContentState = ResolvedDossierContent & {
  isLoading: boolean;
};

type RemoteDossierContentState = ResolvedDossierContent & {
  locale: DossierLocale;
};

function getFallbackState(locale: DossierLocale): DossierContentState {
  return {
    content: getFallbackDossierContent(locale),
    isLoading: false,
    source: "fallback",
  };
}

export function useDossierContent(locale: DossierLocale) {
  const [remoteState, setRemoteState] =
    useState<RemoteDossierContentState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      setIsLoading(Boolean(process.env.NEXT_PUBLIC_API_URL));

      resolvePublicDossierContent(locale).then((resolved) => {
        if (!isMounted) {
          return;
        }

        setRemoteState({
          ...resolved,
          locale,
        });
        setIsLoading(false);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const fallbackState = getFallbackState(locale);
  const activeRemoteState = remoteState?.locale === locale ? remoteState : null;

  return {
    content: activeRemoteState?.content ?? fallbackState.content,
    isLoading,
    source: activeRemoteState?.source ?? fallbackState.source,
  };
}
