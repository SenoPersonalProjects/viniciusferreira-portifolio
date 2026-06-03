import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section-border px-6 py-20 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="section-card relative overflow-hidden p-10 md:p-20">
          <div className="absolute -right-20 -top-20 hidden h-64 w-64 md:block">
            <div className="halftone-bg h-full w-full opacity-10" />
          </div>

          <p className="section-eyebrow">Transmission</p>

          <h2 className="section-title mt-8 max-w-4xl text-5xl md:text-7xl">
            Established a <span className="text-[var(--color-primary)]">Connection</span>?
          </h2>

          <p className="mt-8 max-w-2xl font-[var(--font-body)] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            Open for tech discussions, product engineering, or new
            opportunities. The line is open.
          </p>

          <div className="mt-14 flex flex-col gap-6 sm:flex-row sm:flex-wrap">
            {profile.socialLinks.email && (
              <a
                href={`mailto:${profile.socialLinks.email}`}
                className="primary-action h-14 min-w-[220px] text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                Send Message
              </a>
            )}

            <div className="flex flex-wrap gap-4">
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-action h-14 min-w-[160px] text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  GitHub
                </a>
              )}

              {profile.socialLinks.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-action h-14 min-w-[160px] text-[10px] font-bold uppercase tracking-[0.3em]"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}