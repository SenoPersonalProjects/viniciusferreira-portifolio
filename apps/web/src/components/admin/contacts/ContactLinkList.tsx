"use client";

import type { ContactLink } from "@/data/portfolioContent";

type ContactLinkListProps = {
  contactLinks: ContactLink[];
  deletingId: string | null;
  editingId: string | null;
  onDelete: (contactLink: ContactLink) => void;
  onEdit: (contactLink: ContactLink) => void;
};

const typeLabels: Record<ContactLink["type"], string> = {
  email: "Email",
  external: "Externo",
  github: "GitHub",
  linkedin: "LinkedIn",
};

export function ContactLinkList({
  contactLinks,
  deletingId,
  editingId,
  onDelete,
  onEdit,
}: ContactLinkListProps) {
  if (contactLinks.length === 0) {
    return (
      <div className="section-card p-6">
        <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Nenhum contato cadastrado
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Crie o primeiro link para disponibilizar um canal no portfólio.
        </p>
      </div>
    );
  }

  return (
    <div className="section-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">Contatos administrativos</caption>
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
            <tr>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Label
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Tipo
              </th>
              <th className="px-5 py-4 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                URL
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
            {contactLinks.map((link) => {
              const isDeleting = deletingId === link.id;
              const isEditing = editingId === link.id;
              const isEmail = link.type === "email";

              return (
                <tr
                  className="border-b border-[var(--color-border)] last:border-b-0"
                  key={link.id}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="font-[var(--font-display)] text-2xl uppercase text-[var(--color-foreground)]">
                      {link.label}
                    </p>
                    {isEditing ? (
                      <p className="mt-1 font-[var(--font-mono)] text-xs text-[var(--color-primary)]">
                        Em edição
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-body)] text-sm text-[var(--color-foreground)]">
                    {typeLabels[link.type]}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <a
                      className="break-all font-[var(--font-mono)] text-xs text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
                      href={link.url}
                      rel={isEmail ? undefined : "noreferrer"}
                      target={isEmail ? undefined : "_blank"}
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="px-5 py-4 align-top font-[var(--font-mono)] text-sm text-[var(--color-foreground)]">
                    {link.order}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {link.visible ? "Visível" : "Oculto"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Editar ${link.label}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onEdit(link)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        aria-label={`Excluir ${link.label}`}
                        className="secondary-action h-9 px-3 text-[9px] uppercase tracking-[0.18em]"
                        disabled={Boolean(deletingId)}
                        onClick={() => onDelete(link)}
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
