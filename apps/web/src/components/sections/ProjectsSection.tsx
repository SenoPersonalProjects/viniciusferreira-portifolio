import { projects } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="section-border px-6 py-20 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">Projetos</p>

        <h2 className="section-title mt-5 text-4xl md:text-5xl">
          Projetos em destaque
        </h2>

        <div className="mt-12 grid gap-8">
          {projects.map((project) => (
            <article key={project.slug} className="section-card p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <h3 className="font-[var(--font-display)] text-3xl text-[var(--color-foreground)] md:text-4xl">
                    {project.title}
                  </h3>

                  <p className="mt-5 text-lg leading-8 text-[var(--color-muted)]">
                    {project.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {project.stack.map((item) => (
                      <span
                        key={item}
                        className="border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-action squash-stretch px-5 py-3 text-sm font-semibold"
                    >
                      Código
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="primary-action squash-stretch px-5 py-3 text-sm font-semibold"
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