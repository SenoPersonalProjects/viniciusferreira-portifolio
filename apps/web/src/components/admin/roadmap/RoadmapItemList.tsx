"use client";

import {
  type AdminRoadmapItem,
  type RoadmapType,
} from "@/lib/admin/roadmap";

type RoadmapItemListProps = {
  deletingId: string | null;
  editingId: string | null;
  onDelete: (item: AdminRoadmapItem) => void;
  onEdit: (item: AdminRoadmapItem) => void;
  roadmap: AdminRoadmapItem[];
};

const typeLabels: Record<RoadmapType, string> = {
  carreira: "Carreira",
  formacao: "Formação",
  projeto: "Projeto",
};

export function RoadmapItemList({
  deletingId,
  editingId,
  onDelete,
  onEdit,
  roadmap,
}: RoadmapItemListProps) {
  if (roadmap.length === 0) {
    return (
      <div className="section-card p-6">
        <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Nenhum item cadastrado
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Crie o primeiro marco para preencher a seção pública de trajetória.
        </p>
      </div>
    );
  }

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <caption className="sr-only">
            Itens administrativos de trajetória
          </caption>
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
            <tr>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Período
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Títulos
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Tipo
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Tecnologias
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
            {roadmap.map((item) => {
              const isDeleting = deletingId === item.id;
              const isEditing = editingId === item.id;

              return (
                <tr
                  className="border-b border-[var(--color-border)] last:border-b-0"
                  key={item.id}
                >
                  <td className="px-5 py-4 align-top font-[var(--font-mono)] text-xs text-[var(--color-foreground)]">
                    {item.startDate} - {item.endDate}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-[var(--font-display)] text-2xl uppercase text-[var(--color-foreground)]">
                      {item.titlePt}
                    </p>
                    <p className="mt-1 font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                      {item.titleEn}
                    </p>
                    {isEditing ? (
                      <p className="mt-2 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                        Em edição
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-body)] text-sm text-[var(--color-foreground)]">
                    {typeLabels[item.type]}
                  </td>
                  <td className="px-5 py-4 align-top">
                    {item.technologies.length > 0 ? (
                      <div className="flex max-w-md flex-wrap gap-2">
                        {item.technologies.map((technology) => (
                          <span
                            className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--color-primary)]"
                            key={technology}
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
                        Sem tecnologias
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-mono)] text-sm text-[var(--color-foreground)]">
                    {item.order}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {item.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Editar ${item.titlePt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onEdit(item)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${item.titlePt}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onDelete(item)}
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
