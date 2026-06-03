import { ColorModeToggle } from "@/components/layout/ColorModeToggle";
import { ExperienceToggle } from "@/components/layout/ExperienceToggle";

export function Header() {
  return (
    <header className="vintage-header sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-3 md:px-10">
        <a
          href="#home"
          className="vintage-logo vintage-flicker group relative flex items-center gap-2 font-[var(--font-display)] text-2xl leading-none text-[var(--color-foreground)] md:text-3xl"
        >
          <span className="font-[var(--font-accent)] text-[0.8em] text-[var(--color-primary)]">
            v
          </span>
          V.F.S.
        </a>

        <nav className="hidden justify-self-center md:flex md:items-center md:gap-10">
          <a
            href="#home"
            className="border-b-2 border-[var(--color-primary)] pb-1 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-foreground)]"
          >
            Home
          </a>
          <a
            href="#projects"
            className="border-b-2 border-transparent pb-1 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
          >
            Archive
          </a>
          <a
            href="#about"
            className="border-b-2 border-transparent pb-1 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
          >
            Intel
          </a>
          <a
            href="#contact"
            className="border-b-2 border-transparent pb-1 font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
          >
            Terminal
          </a>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <ColorModeToggle />
          <ExperienceToggle />
        </div>
      </div>
    </header>
  );
}