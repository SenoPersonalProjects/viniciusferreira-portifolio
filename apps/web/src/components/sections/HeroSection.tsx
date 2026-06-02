import { profile } from "@/data/profile";

export function HeroSection() {
  return (
    <section
      id="home"
      className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center px-6 py-24 transition-colors duration-300"
    >
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-primary)]">
          {profile.role}
        </p>

        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-foreground)] md:text-7xl">
          Olá, eu sou{" "}
          <span className="text-[var(--color-primary)]">{profile.name}</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
          {profile.headline}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-background)] transition hover:opacity-80"
          >
            Ver projetos
          </a>

          <a
            href="#contact"
            className="rounded-full border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </section>
  );
}