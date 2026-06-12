"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { profile } from "@/data/profile";

export function Footer() {
  const { dictionary } = useLanguage();

  return (
    <footer className="section-border relative z-40 bg-[var(--color-background)] px-6 py-12 transition-colors duration-300 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-[var(--font-display)] text-3xl text-[var(--color-foreground)]">
          <span className="font-[var(--font-accent)] text-[0.8em] text-[var(--color-primary)]">
            v
          </span>
          V.F.S.
        </div>

        <div className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-3 font-[var(--font-industrial)] text-[9px] font-normal uppercase tracking-[0.28em] text-[var(--color-muted)]">
          © {new Date().getFullYear()} Vinicius Ferreira.{" "}
          {dictionary.footer.rights}
        </div>

        <div className="flex flex-wrap items-center gap-8">
          {profile.socialLinks.linkedin && (
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em] text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              LinkedIn
            </a>
          )}

          {profile.socialLinks.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="font-[var(--font-industrial)] text-[10px] font-normal uppercase tracking-[0.22em] text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
