"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ColorModeToggle() {
  const { colorModePreference, cycleColorMode } = useExperience();
  const { dictionary } = useLanguage();
  const label = dictionary.colorMode.labels[colorModePreference];

  return (
    <button
      type="button"
      onClick={cycleColorMode}
      className="h-9 rounded-none border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:px-4 sm:tracking-[0.24em]"
      aria-label={`${dictionary.colorMode.ariaPrefix}: ${label}. ${dictionary.colorMode.ariaSuffix}`}
      title={`${dictionary.colorMode.titlePrefix}: ${label}`}
      data-testid="color-mode-toggle"
    >
      {label}
    </button>
  );
}
