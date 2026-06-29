"use client";

import {
  type AdminSiteCopy,
  getSiteCopyPreview,
} from "@/lib/admin/siteCopy";

type SiteCopyListProps = {
  deletingId: string | null;
  editingId: string | null;
  onDelete: (record: AdminSiteCopy) => void;
  onEdit: (record: AdminSiteCopy) => void;
  records: AdminSiteCopy[];
};

export function SiteCopyList({
  deletingId,
  editingId,
  onDelete,
  onEdit,
  records,
}: SiteCopyListProps) {
  if (records.length === 0) {
    return (
      <div className="section-card p-6">
        <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Nenhum texto cadastrado
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Crie o primeiro registro de copy para preparar a integração dinâmica
          futura do conteúdo.
        </p>
      </div>
    );
  }

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <caption className="sr-only">
            Textos administrativos cadastrados por chave e locale
          </caption>
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
            <tr>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Chave
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Locale
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Preview
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isDeleting = deletingId === record.id;
              const isEditing = editingId === record.id;

              return (
                <tr
                  className="border-b border-[var(--color-border)] last:border-b-0"
                  key={record.id}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="break-all font-[var(--font-mono)] text-sm text-[var(--color-primary)]">
                      {record.key}
                    </p>
                    {isEditing ? (
                      <p className="mt-2 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                        Em edição
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {record.locale}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="max-w-xl font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
                      {getSiteCopyPreview(record.value)}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Editar ${record.key} ${record.locale}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onEdit(record)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${record.key} ${record.locale}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onDelete(record)}
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
