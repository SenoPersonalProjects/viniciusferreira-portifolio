import { projects } from "@/data/projects";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="border-t border-[var(--color-border)] px-6 py-24 transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-[var(--color-primary)]">
          Projetos
        </p>

        <h2 className="mt-4 text-3xl font-bold text-[var(--color-foreground)] md:text-4xl">
          Projetos em destaque
        </h2>

        <div className="mt-12 grid gap-6">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 transition hover:border-[var(--color-primary)]"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-[var(--color-foreground)]">
                    {project.title}
                  </h3>

                  <p className="mt-4 max-w-3xl leading-7 text-[var(--color-muted)]">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {project.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]"
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
                      className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-foreground)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      Código
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-background)] transition hover:opacity-80"
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