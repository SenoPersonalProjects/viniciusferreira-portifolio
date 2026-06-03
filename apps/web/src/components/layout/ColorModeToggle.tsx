"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export function ColorModeToggle() {
  const { colorModePreference, cycleColorMode } = useExperience();

  const labelMap = {
    system: "System",
    light: "Light",
    dark: "Dark",
  } as const;

  return (
    <button
      type="button"
      onClick={cycleColorMode}
      className="rounded-none border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-5 py-2 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label={`Current mode: ${labelMap[colorModePreference]}. Click to cycle.`}
      title={`Mode: ${labelMap[colorModePreference]}`}
    >
      {labelMap[colorModePreference]}
    </button>
  );
}