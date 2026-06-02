import { ExperienceToggle } from "@/components/layout/ExperienceToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#home"
          className="text-sm font-semibold tracking-wide text-[var(--color-foreground)]"
        >
          Vinicius Ferreira
        </a>

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] md:flex">
            <a
              href="#about"
              className="transition hover:text-[var(--color-foreground)]"
            >
              Sobre
            </a>
            <a
              href="#stack"
              className="transition hover:text-[var(--color-foreground)]"
            >
              Stack
            </a>
            <a
              href="#projects"
              className="transition hover:text-[var(--color-foreground)]"
            >
              Projetos
            </a>
            <a
              href="#contact"
              className="transition hover:text-[var(--color-foreground)]"
            >
              Contato
            </a>
          </nav>

          <ExperienceToggle />
        </div>
      </div>
    </header>
  );
}