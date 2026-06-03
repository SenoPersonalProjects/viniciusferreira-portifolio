"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export function ExperienceToggle() {
  const { experience, toggleExperience } = useExperience();

  return (
    <button
      type="button"
      onClick={toggleExperience}
      className="rounded-none border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-5 py-2 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label="Toggle visual experience"
    >
      {experience === "modern" ? "Modern" : "Vintage"}
    </button>
  );
}