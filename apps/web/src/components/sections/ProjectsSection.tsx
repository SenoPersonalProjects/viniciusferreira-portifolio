import { projects } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section id="projects" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
          Projetos
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
          Projetos em destaque
        </h2>

        <div className="mt-12 grid gap-6">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/40"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {project.title}
                  </h3>

                  <p className="mt-4 max-w-3xl leading-7 text-slate-300">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {project.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 gap-3">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-cyan-300 hover:text-cyan-300"
                    >
                      Código
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    >
                      Ver online
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}