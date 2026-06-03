import { profile } from "@/data/profile";

export function HeroSection() {
  const firstName = profile.name.split(" ")[0];
  const lastName = profile.name.split(" ").slice(1).join(" ");

  return (
    <section
      id="home"
      className="vintage-hero mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24"
    >
      <div className="relative md:col-span-7">
        <p className="section-eyebrow mb-10">{profile.role}</p>

        <h1 className="section-title vintage-title-shadow vintage-hero-title vintage-flicker text-6xl font-normal md:text-8xl">
          <span className="block opacity-80">I am</span>
          <span className="block font-[var(--font-accent)] text-[0.85em] lowercase italic leading-[0.8] tracking-normal text-[var(--color-primary)]">
            {firstName}
          </span>
          <span className="block">{lastName}.</span>
        </h1>

        <div className="relative mt-12 max-w-2xl">
          <div className="absolute -left-4 top-0 h-full w-[2px] bg-[var(--color-primary)] opacity-40" />

          <div className="vintage-copy-frame relative z-10 p-6 md:p-8">
            <p className="font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              {profile.headline}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row">
          <a
            href="#projects"
            className="primary-action vintage-action h-14 min-w-[200px] text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            Exhibit Projects
          </a>

          <a
            href="#contact"
            className="secondary-action vintage-action h-14 min-w-[200px] text-[10px] font-bold uppercase tracking-[0.3em]"
          >
            Secure Contact
          </a>
        </div>
      </div>

      <div className="relative md:col-span-5">
        <div className="vintage-halftone-accent absolute -right-4 -top-4 hidden h-48 w-48 md:block">
          <div className="halftone-bg h-full w-full" />
        </div>

        <div className="relative mx-auto max-w-[440px]">
          <div className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-[var(--color-border)] opacity-30" />

          <div className="vintage-frame vintage-poster relative z-10 aspect-[3/4.2] overflow-hidden p-5">
            <div className="vintage-frame-inner vintage-poster-inner flex h-full w-full flex-col items-center justify-between border border-[var(--color-border)] p-8 text-center">
              <div className="w-full border-b border-[var(--color-border)] pb-4 opacity-40">
                <p className="font-[var(--font-industrial)] text-[10px] font-bold uppercase tracking-[0.4em]">
                  Production #026
                </p>
              </div>

              <div className="py-12">
                <p className="vintage-poster-mark font-[var(--font-accent)] text-8xl leading-none text-[var(--color-foreground)] md:text-9xl">
                  VF
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="h-[1px] w-8 bg-[var(--color-border)]" />
                  <p className="vintage-poster-caption font-[var(--font-industrial)] text-[11px] font-bold uppercase tracking-[0.4em]">
                    Director
                  </p>
                  <div className="h-[1px] w-8 bg-[var(--color-border)]" />
                </div>
              </div>

              <div className="w-full border-t border-[var(--color-border)] pt-4 opacity-40">
                <p className="font-[var(--font-industrial)] text-[9px] font-bold uppercase tracking-[0.45em]">
                  Noir Experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}