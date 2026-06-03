import { profile } from "@/data/profile";

export function AboutSection() {
  return (
    <section id="about" className="section-border px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.55fr_1.45fr]">
        <div>
          <p className="section-eyebrow">Sobre</p>

          <h2 className="section-title mt-5 text-4xl md:text-5xl">
            Um pouco sobre mim
          </h2>
        </div>

        <div className="section-card p-6 md:p-8">
          <div className="space-y-6 text-lg leading-8 text-[var(--color-muted)]">
            <p>{profile.summary}</p>

            <p>
              Meu foco é construir produtos digitais com boa arquitetura,
              experiência de usuário consistente e código preparado para
              evoluir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}