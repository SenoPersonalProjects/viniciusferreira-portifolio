"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ContactLink } from "@/data/portfolioContent";
import { useAdminSession } from "@/hooks/useAdminSession";
import {
  adminApiFetch,
  getAdminApiErrorMessage,
} from "@/lib/admin/adminApi";
import {
  type ContactLinkPayload,
  sortContactLinks,
} from "@/lib/admin/contactLinks";

import { ContactLinkForm } from "./ContactLinkForm";
import { ContactLinkList } from "./ContactLinkList";

type AdminContent = {
  contactLinks: ContactLink[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const emptyContent: AdminContent = {
  contactLinks: [],
};

function getAdminErrorMessage(error: unknown) {
  return getAdminApiErrorMessage(
    error,
    "Não foi possível concluir a operação de contatos.",
  );
}

function getContactSummary(contactLinks: ContactLink[]) {
  const visibleCount = contactLinks.filter((link) => link.visible).length;

  return `${contactLinks.length} cadastrados, ${visibleCount} visíveis`;
}

export function AdminContactLinksPage() {
  const { accessToken } = useAdminSession();
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<ContactLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);

  const sortedContactLinks = useMemo(
    () => sortContactLinks(contactLinks),
    [contactLinks],
  );

  const loadContactLinks = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const data = await adminApiFetch<AdminContent>(
        "/admin/content",
        undefined,
        accessToken,
      );

      setContactLinks(
        sortContactLinks(data?.contactLinks ?? emptyContent.contactLinks),
      );
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadContactLinks();
    });
  }, [loadContactLinks]);

  async function handleSubmit(payload: ContactLinkPayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSaving(true);

    try {
      if (editingLink) {
        const updated = await adminApiFetch<ContactLink>(
          `/admin/contact-links/${encodeURIComponent(editingLink.id)}`,
          {
            body: JSON.stringify(payload),
            method: "PUT",
          },
          accessToken,
        );

        setContactLinks((current) =>
          sortContactLinks(
            current.map((link) => (link.id === editingLink.id ? updated : link)),
          ),
        );
        setEditingLink(null);
        setNotice("Contato atualizado com sucesso.");
        return;
      }

      const created = await adminApiFetch<ContactLink>(
        "/admin/contact-links",
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
        accessToken,
      );

      setContactLinks((current) => sortContactLinks([...current, created]));
      setNotice("Contato criado com sucesso.");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(contactLink: ContactLink) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    const shouldDelete = window.confirm(
      `Excluir o contato "${contactLink.label}"? Esta ação não pode ser desfeita.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(contactLink.id);
    setError(null);
    setNotice(null);

    try {
      await adminApiFetch<{ deleted: boolean }>(
        `/admin/contact-links/${encodeURIComponent(contactLink.id)}`,
        {
          method: "DELETE",
        },
        accessToken,
      );

      setContactLinks((current) =>
        current.filter((link) => link.id !== contactLink.id),
      );

      if (editingLink?.id === contactLink.id) {
        setEditingLink(null);
      }

      setNotice("Contato excluído com sucesso.");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Contatos</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar contatos
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Cadastre e organize os canais exibidos no portfólio público. Os
              dados são salvos pela API administrativa com token Supabase.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadContactLinks()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>{getContactSummary(sortedContactLinks)}</p>
          {notice ? (
            <p className="text-[var(--color-foreground)]" role="status">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="text-[var(--color-foreground)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label="Lista de contatos" className="grid gap-4">
          {status === "loading" && sortedContactLinks.length === 0 ? (
            <div className="section-card p-6">
              <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                Carregando contatos...
              </p>
            </div>
          ) : (
            <ContactLinkList
              contactLinks={sortedContactLinks}
              deletingId={deletingId}
              editingId={editingLink?.id ?? null}
              onDelete={(contactLink) => void handleDelete(contactLink)}
              onEdit={setEditingLink}
            />
          )}
        </section>

        <aside className="h-fit xl:sticky xl:top-6">
          <ContactLinkForm
            contactLinks={sortedContactLinks}
            initialValue={editingLink}
            isSubmitting={isSaving}
            key={editingLink?.id ?? "new-contact"}
            onCancelEdit={() => setEditingLink(null)}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>
    </div>
  );
}
