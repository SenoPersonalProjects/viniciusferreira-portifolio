import { profile } from "@/data/profile";

export function AboutSection() {
  return (
    <section
      id="about"
      className="border-t border-[var(--color-border)] px-6 py-24 transition-colors duration-300"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-primary)]">
            Sobre
          </p>

          <h2 className="mt-4 text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
            Um pouco sobre mim
          </h2>
        </div>

        <div className="space-y-6 text-lg leading-8 text-[var(--color-muted)]">
          <p>{profile.summary}</p>

          <p>
            Meu foco é construir produtos digitais com boa arquitetura,
            experiência de usuário consistente e código preparado para evoluir.
          </p>
        </div>
      </div>
    </section>
  );
}