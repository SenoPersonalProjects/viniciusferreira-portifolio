import { profile } from "@/data/profile";

export function AboutSection() {
  return (
    <section id="about" className="section-border px-6 py-20 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="section-eyebrow">Intel</p>

          <h2 className="section-title mt-6 text-5xl md:text-7xl">
            A Glimpse into the <span className="text-[var(--color-primary)]">Files</span>
          </h2>

          <div className="mt-10 hidden md:block">
            <div className="h-px w-24 bg-[var(--color-primary)]" />
            <p className="mt-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">
              Classified Info
            </p>
          </div>
        </div>

        <div className="relative md:col-span-7">
          <div className="absolute -left-6 top-10 hidden h-px w-12 bg-[var(--color-border)] md:block" />

          <div className="section-card relative border-l-4 border-l-[var(--color-primary)] p-8 md:p-12">
            <div className="space-y-8 font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              <p className="first-letter:font-[var(--font-display)] first-letter:text-5xl first-letter:text-[var(--color-primary)]">
                {profile.summary}
              </p>

              <p className="border-t border-[var(--color-border)] pt-8 opacity-90">
                My focus is on engineering digital products with robust
                architecture, seamless user experiences, and code built to
                withstand the test of time.
              </p>
            </div>

            <div className="mt-12 flex items-center gap-4 opacity-40">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <p className="font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.5em]">
                End of File
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}