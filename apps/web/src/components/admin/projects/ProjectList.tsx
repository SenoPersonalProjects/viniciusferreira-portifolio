"use client";

import type { AdminProject } from "@/lib/admin/projects";

type ProjectListProps = {
  deletingId: string | null;
  editingId: string | null;
  onDelete: (project: AdminProject) => void;
  onEdit: (project: AdminProject) => void;
  projects: AdminProject[];
};

function formatOptionalValue(value: string | null) {
  return value && value.length > 0 ? value : "Não informado";
}

export function ProjectList({
  deletingId,
  editingId,
  onDelete,
  onEdit,
  projects,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="section-card p-6">
        <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Nenhum projeto cadastrado
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Crie o primeiro projeto para preencher a seção pública de projetos.
        </p>
      </div>
    );
  }

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] border-collapse text-left">
          <caption className="sr-only">
            Projetos administrativos exibidos no portfólio
          </caption>
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
            <tr>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Projeto
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Stack
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Links
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Visual
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Ordem
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Status
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isDeleting = deletingId === project.id;
              const isEditing = editingId === project.id;

              return (
                <tr
                  className="border-b border-[var(--color-border)] last:border-b-0"
                  key={project.id}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="font-[var(--font-display)] text-2xl uppercase text-[var(--color-foreground)]">
                      {project.titlePt}
                    </p>
                    <p className="mt-1 font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                      {project.titleEn}
                    </p>
                    <p className="mt-2 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                      {project.slug}
                    </p>
                    {isEditing ? (
                      <p className="mt-2 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                        Em edição
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex max-w-md flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <span
                          className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-primary)]"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="grid gap-2 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
                      <p>
                        Repositório:{" "}
                        {project.repositoryUrl ? (
                          <a
                            className="text-[var(--color-primary)] underline-offset-4 hover:underline"
                            href={project.repositoryUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            abrir
                          </a>
                        ) : (
                          "não informado"
                        )}
                      </p>
                      <p>
                        Demo:{" "}
                        {project.liveUrl ? (
                          <a
                            className="text-[var(--color-primary)] underline-offset-4 hover:underline"
                            href={project.liveUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            abrir
                          </a>
                        ) : (
                          "não informado"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="grid max-w-sm gap-2 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
                      <p className="break-all">
                        Poster: {project.posterImage}
                      </p>
                      <p>
                        Previews: {project.previewImages.length}
                      </p>
                      <p>
                        Frame: {formatOptionalValue(project.frameCode)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-mono)] text-sm text-[var(--color-foreground)]">
                    {project.order}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {project.published ? "Publicado" : "Rascunho"}
                      </span>
                      <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {project.featured ? "Destacado" : "Comum"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Editar ${project.titlePt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onEdit(project)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${project.titlePt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onDelete(project)}
                        type="button"
                      >
                        {isDeleting ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
