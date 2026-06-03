"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ExperienceToggle() {
  const { experience, toggleExperience } = useExperience();
  const { dictionary } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleExperience}
      className="h-9 rounded-none border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:px-4 sm:tracking-[0.24em]"
      aria-label={dictionary.experience.toggleLabel}
      data-testid="experience-toggle"
    >
      {dictionary.experience.labels[experience]}
    </button>
  );
}
