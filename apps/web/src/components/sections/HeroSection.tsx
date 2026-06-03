import { profile } from "@/data/profile";

export function HeroSection() {
  return (
    <section
      id="home"
      className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24"
    >
      <div className="relative md:col-span-7">
        <p className="section-eyebrow mb-8">{profile.role}</p>

        <h1 className="section-title vintage-title-shadow max-w-[8ch] text-5xl font-normal md:text-7xl">
          <span className="block">Olá, eu sou</span>
          <span className="block">{profile.name.split(" ")[0]}</span>
          <span className="block">
            {profile.name.split(" ").slice(1).join(" ")}.
          </span>
        </h1>

        <div className="relative mt-10 max-w-3xl">
          <div className="absolute inset-0 translate-x-2 translate-y-2 border border-[var(--color-border)] opacity-70" />
          <div className="section-card relative z-10 p-6 md:p-7">
            <p className="text-lg leading-8 text-[var(--color-muted)] md:text-[1.35rem]">
              {profile.headline}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            className="primary-action squash-stretch px-7 py-4 text-sm font-semibold"
          >
            Ver projetos
          </a>

          <a
            href="#contact"
            className="secondary-action squash-stretch px-7 py-4 text-sm font-semibold"
          >
            Entrar em contato
          </a>
        </div>
      </div>

      <div className="relative md:col-span-5">
        <div className="absolute right-10 top-0 hidden h-40 w-40 opacity-20 md:block">
          <div className="halftone-bg h-full w-full" />
        </div>

        <div className="relative mx-auto max-w-[420px]">
          <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[var(--color-border)] opacity-70" />

          <div className="vintage-frame relative z-10 aspect-[3/4] rotate-[2deg] p-4">
            <div className="vintage-frame-inner flex h-full w-full items-center justify-center bg-[var(--color-surface)]">
              <div className="text-center">
                <p className="font-[var(--font-display)] text-6xl leading-none text-[var(--color-foreground)] md:text-7xl">
                  V.F.
                </p>

                <p className="mt-5 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.38em] text-[var(--color-muted)]">
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