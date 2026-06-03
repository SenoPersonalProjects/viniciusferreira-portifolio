import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="section-card p-8 md:p-12">
          <p className="section-eyebrow">Contato</p>

          <h2 className="section-title mt-5 max-w-4xl text-4xl md:text-5xl">
            Vamos conversar sobre tecnologia, produto ou novas oportunidades?
          </h2>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {profile.socialLinks.email && (
              <a
                href={`mailto:${profile.socialLinks.email}`}
                className="primary-action squash-stretch px-6 py-3 text-center text-sm font-semibold"
              >
                Enviar e-mail
              </a>
            )}

            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="secondary-action squash-stretch px-6 py-3 text-center text-sm font-semibold"
              >
                GitHub
              </a>
            )}

            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="secondary-action squash-stretch px-6 py-3 text-center text-sm font-semibold"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}