import { profile } from "@/data/profile";

export function HeroSection() {
  return (
    <section
      id="home"
      className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center px-6 py-24"
    >
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          {profile.role}
        </p>

        <h1 className="text-5xl font-bold tracking-tight text-white md:text-7xl">
          Olá, eu sou{" "}
          <span className="text-cyan-300">{profile.name}</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {profile.headline}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            className="rounded-full bg-cyan-300 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Ver projetos
          </a>

          <a
            href="#contact"
            className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </section>
  );
}