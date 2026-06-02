"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export function ExperienceToggle() {
  const { experience, toggleExperience } = useExperience();

  const isModern = experience === "modern";

  return (
    <button
      type="button"
      onClick={toggleExperience}
      className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label="Alternar experiência visual"
    >
      {isModern ? "Modern" : "Vintage"}
    </button>
  );
}