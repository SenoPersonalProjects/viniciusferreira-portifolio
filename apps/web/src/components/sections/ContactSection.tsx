import { profile } from "@/data/profile";

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          Contato
        </p>

        <h2 className="mt-4 max-w-3xl text-3xl font-bold text-white md:text-5xl">
          Vamos conversar sobre tecnologia, produto ou novas oportunidades?
        </h2>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          {profile.socialLinks.email && (
            <a
              href={`mailto:${profile.socialLinks.email}`}
              className="rounded-full bg-cyan-300 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Enviar e-mail
            </a>
          )}

          {profile.socialLinks.github && (
            <a
              href={profile.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-300"
            >
              GitHub
            </a>
          )}

          {profile.socialLinks.linkedin && (
            <a
              href={profile.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-300"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </section>
  );
}