import { profile } from "@/data/profile";

export function HeroSection() {
  const firstName = profile.name.split(" ")[0];
  const lastName = profile.name.split(" ").slice(1).join(" ");

  return (
    <section
      id="home"
      className="vintage-hero mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20"
    >
      <div className="relative md:col-span-7">
        <p className="section-eyebrow mb-8">{profile.role}</p>

        <h1 className="section-title vintage-title-shadow vintage-hero-title vintage-flicker text-5xl font-normal md:text-7xl">
          <span className="block">Olá, eu sou</span>
          <span className="block">{firstName}</span>
          <span className="block">{lastName}.</span>
        </h1>

        <div className="relative mt-9 max-w-3xl">
          <div className="absolute inset-0 translate-x-2 translate-y-2 border border-[var(--color-border)] opacity-60" />

          <div className="section-card vintage-copy-frame relative z-10 p-5 md:p-6">
            <p className="text-base leading-7 md:text-lg">{profile.headline}</p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            className="primary-action vintage-action squash-stretch px-7 py-4 text-sm font-semibold"
          >
            Ver projetos
          </a>

          <a
            href="#contact"
            className="secondary-action vintage-action squash-stretch px-7 py-4 text-sm font-semibold"
          >
            Entrar em contato
          </a>
        </div>
      </div>

      <div className="relative md:col-span-5">
        <div className="vintage-halftone-accent absolute -left-8 -top-8 hidden h-64 w-64 md:block">
          <div className="halftone-bg h-full w-full" />
        </div>

        <div className="relative mx-auto max-w-[420px]">
          <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[var(--color-border)] opacity-55" />

          <div className="vintage-frame vintage-poster relative z-10 aspect-[3/4] overflow-hidden p-4">
            <div className="vintage-frame-inner vintage-poster-inner flex h-full w-full items-center justify-center overflow-hidden">
              <div className="text-center">
                <p className="vintage-poster-mark font-[var(--font-display)] text-6xl leading-none text-[var(--color-foreground)] md:text-7xl">
                  V.F.
                </p>

                <p className="vintage-poster-caption mt-5 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.38em]">
                  Full Stack Developer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}