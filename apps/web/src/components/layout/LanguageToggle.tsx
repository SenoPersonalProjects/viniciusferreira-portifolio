"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function LanguageToggle() {
  const { dictionary, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex h-9 items-center gap-1.5 rounded-none border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-2 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:gap-2 sm:px-4 sm:tracking-[0.24em]"
      aria-label={dictionary.languageToggleLabel}
      title={dictionary.languageToggleLabel}
      data-testid="language-toggle"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
      </svg>
      <span>{dictionary.languageShort}</span>
    </button>
  );
}
