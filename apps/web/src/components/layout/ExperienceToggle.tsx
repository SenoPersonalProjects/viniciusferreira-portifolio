"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export function ExperienceToggle() {
  const { experience, toggleExperience } = useExperience();

  return (
    <button
      type="button"
      onClick={toggleExperience}
      className="rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label="Alternar experiência visual"
    >
      {experience === "modern" ? "Modern" : "Vintage"}
    </button>
  );
}