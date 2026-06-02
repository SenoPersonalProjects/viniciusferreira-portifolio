export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#home" className="text-sm font-semibold tracking-wide text-white">
          Vinicius Ferreira
        </a>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#about" className="transition hover:text-white">
            Sobre
          </a>
          <a href="#stack" className="transition hover:text-white">
            Stack
          </a>
          <a href="#projects" className="transition hover:text-white">
            Projetos
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
}