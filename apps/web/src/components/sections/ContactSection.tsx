import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-[var(--color-border)] px-6 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-8 transition-colors duration-300 md:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-primary)]">
          Contato
        </p>

        <h2 className="mt-4 max-w-3xl text-3xl font-bold text-[var(--color-foreground)] md:text-5xl">
          Vamos conversar sobre tecnologia, produto ou novas oportunidades?
        </h2>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {profile.socialLinks.email && (
            <a
              href={`mailto:${profile.socialLinks.email}`}
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-background)] transition hover:opacity-80"
            >
              Enviar e-mail
            </a>
          )}

          {profile.socialLinks.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              GitHub
            </a>
          )}

          {profile.socialLinks.linkedin && (
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </section>
  );
}