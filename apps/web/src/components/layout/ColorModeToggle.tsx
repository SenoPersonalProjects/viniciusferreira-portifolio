"use client";

import { useExperience } from "@/components/providers/ExperienceProvider";

export function ColorModeToggle() {
  const { colorModePreference, cycleColorMode } = useExperience();

  const labelMap = {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
  } as const;

  return (
    <button
      type="button"
      onClick={cycleColorMode}
      className="rounded-none border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      aria-label={`Modo de cor atual: ${labelMap[colorModePreference]}. Clique para alternar.`}
      title={`Modo de cor: ${labelMap[colorModePreference]}`}
    >
      {labelMap[colorModePreference]}
    </button>
  );
}