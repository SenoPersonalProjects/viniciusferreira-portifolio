"use client";

import { useEffect, useId, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function ReducedMotionIndicator() {
  const { dictionary } = useLanguage();
  const tooltipId = useId();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  if (!prefersReducedMotion) {
    return null;
  }

  return (
    <div className="group fixed bottom-4 right-4 z-[130] sm:bottom-5 sm:right-5">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] font-[var(--font-industrial)] text-sm uppercase text-[var(--color-foreground)] shadow-[4px_4px_0_var(--color-shadow)] hover:border-[var(--color-primary)] focus-visible:border-[var(--color-primary)]"
        aria-describedby={tooltipId}
        aria-label={dictionary.reducedMotionIndicator.title}
        title={dictionary.reducedMotionIndicator.title}
      >
        i
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className="invisible absolute bottom-full right-0 mb-3 w-72 max-w-[calc(100vw-2rem)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left text-[var(--color-foreground)] opacity-0 shadow-[6px_6px_0_var(--color-shadow)] group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {dictionary.reducedMotionIndicator.title}
        </p>
        <p className="mt-2 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          {dictionary.reducedMotionIndicator.description}
        </p>
      </div>
    </div>
  );
}
