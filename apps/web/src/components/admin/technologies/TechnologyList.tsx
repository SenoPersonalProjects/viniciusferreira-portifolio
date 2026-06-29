"use client";

import type { AdminTechnology } from "@/lib/admin/technologies";

type TechnologyListProps = {
  deletingId: string | null;
  editingId: string | null;
  onDelete: (technology: AdminTechnology) => void;
  onEdit: (technology: AdminTechnology) => void;
  technologies: AdminTechnology[];
};

export function TechnologyList({
  deletingId,
  editingId,
  onDelete,
  onEdit,
  technologies,
}: TechnologyListProps) {
  if (technologies.length === 0) {
    return (
      <div className="section-card p-6">
        <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Nenhum grupo cadastrado
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Crie o primeiro grupo para organizar as tecnologias exibidas no
          portfólio.
        </p>
      </div>
    );
  }

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">
            Grupos de tecnologias administrativos
          </caption>
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
            <tr>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Categoria PT
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Categoria EN
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Itens
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
            {technologies.map((technology) => {
              const isDeleting = deletingId === technology.id;
              const isEditing = editingId === technology.id;

              return (
                <tr
                  className="border-b border-[var(--color-border)] last:border-b-0"
                  key={technology.id}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="font-[var(--font-display)] text-2xl uppercase text-[var(--color-foreground)]">
                      {technology.categoryPt}
                    </p>
                    {isEditing ? (
                      <p className="mt-1 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                        Em edição
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-body)] text-sm text-[var(--color-foreground)]">
                    {technology.categoryEn}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex max-w-md flex-wrap gap-2">
                      {technology.items.map((item) => (
                        <span
                          className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-primary)]"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-mono)] text-sm text-[var(--color-foreground)]">
                    {technology.order}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {technology.visible ? "Visível" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Editar ${technology.categoryPt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onEdit(technology)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${technology.categoryPt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onDelete(technology)}
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
