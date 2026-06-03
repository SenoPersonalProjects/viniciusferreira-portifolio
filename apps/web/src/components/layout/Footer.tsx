import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="section-border relative z-40 bg-[var(--color-background)] px-6 py-8 transition-colors duration-300 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="font-[var(--font-display)] text-3xl text-[var(--color-foreground)]">
          V.F.S.
        </div>

        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)]">
          © {new Date().getFullYear()} Vinicius Ferreira dos Santos. Todos os
          direitos reservados.
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {profile.socialLinks.linkedin && (
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              LinkedIn
            </a>
          )}

          {profile.socialLinks.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              GitHub
            </a>
          )}

          {profile.socialLinks.email && (
            <a
              href={`mailto:${profile.socialLinks.email}`}
              className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
            >
              E-mail
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}