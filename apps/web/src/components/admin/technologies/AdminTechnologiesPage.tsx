"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";
import {
  type AdminTechnology,
  type TechnologyPayload,
  getTechnologyItemsCount,
  sortTechnologies,
} from "@/lib/admin/technologies";

import { TechnologyForm } from "./TechnologyForm";
import { TechnologyList } from "./TechnologyList";

type AdminContent = {
  technologies: AdminTechnology[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const emptyContent: AdminContent = {
  technologies: [],
};

function getAdminErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) {
    if (error.code === "unauthorized" || error.code === "forbidden") {
      return "A API recusou a sessão. Confirme o login e a allowlist SUPABASE_ADMIN_EMAILS.";
    }

    if (error.code === "unavailable") {
      return "API administrativa indisponível. Confirme se o backend está em execução.";
    }

    return error.message;
  }

  return "Não foi possível concluir a operação de stack.";
}

function getStackSummary(technologies: AdminTechnology[]) {
  const visibleCount = technologies.filter((technology) => technology.visible).length;
  const itemsCount = getTechnologyItemsCount(technologies);

  return `${technologies.length} grupos, ${visibleCount} visíveis, ${itemsCount} itens`;
}

export function AdminTechnologiesPage() {
  const { accessToken } = useAdminSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTechnology, setEditingTechnology] =
    useState<AdminTechnology | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>("idle");
  const [technologies, setTechnologies] = useState<AdminTechnology[]>([]);

  const sortedTechnologies = useMemo(
    () => sortTechnologies(technologies),
    [technologies],
  );

  const loadTechnologies = useCallback(async () => {
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

      setTechnologies(
        sortTechnologies(data?.technologies ?? emptyContent.technologies),
      );
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadTechnologies();
    });
  }, [loadTechnologies]);

  async function handleSubmit(payload: TechnologyPayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    setError(null);
    setIsSaving(true);
    setNotice(null);

    try {
      if (editingTechnology) {
        const updated = await adminApiFetch<AdminTechnology>(
          `/admin/technologies/${encodeURIComponent(editingTechnology.id)}`,
          {
            body: JSON.stringify(payload),
            method: "PUT",
          },
          accessToken,
        );

        setTechnologies((current) =>
          sortTechnologies(
            current.map((technology) =>
              technology.id === editingTechnology.id ? updated : technology,
            ),
          ),
        );
        setEditingTechnology(null);
        setNotice("Grupo de stack atualizado com sucesso.");
        return;
      }

      const created = await adminApiFetch<AdminTechnology>(
        "/admin/technologies",
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
        accessToken,
      );

      setTechnologies((current) => sortTechnologies([...current, created]));
      setNotice("Grupo de stack criado com sucesso.");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(technology: AdminTechnology) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    const shouldDelete = window.confirm(
      `Excluir o grupo "${technology.categoryPt}"? Esta ação não pode ser desfeita.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(technology.id);
    setError(null);
    setNotice(null);

    try {
      await adminApiFetch<{ deleted: boolean }>(
        `/admin/technologies/${encodeURIComponent(technology.id)}`,
        {
          method: "DELETE",
        },
        accessToken,
      );

      setTechnologies((current) =>
        current.filter((item) => item.id !== technology.id),
      );

      if (editingTechnology?.id === technology.id) {
        setEditingTechnology(null);
      }

      setNotice("Grupo de stack excluído com sucesso.");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Stack</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar stack
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Organize os grupos de tecnologias exibidos no portfólio público.
              A API pública mostra apenas grupos marcados como visíveis.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadTechnologies()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>{getStackSummary(sortedTechnologies)}</p>
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
        <section aria-label="Lista de stack" className="grid gap-4">
          {status === "loading" && sortedTechnologies.length === 0 ? (
            <div className="section-card p-6">
              <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                Carregando stack...
              </p>
            </div>
          ) : (
            <TechnologyList
              deletingId={deletingId}
              editingId={editingTechnology?.id ?? null}
              onDelete={(technology) => void handleDelete(technology)}
              onEdit={setEditingTechnology}
              technologies={sortedTechnologies}
            />
          )}
        </section>

        <aside className="h-fit xl:sticky xl:top-6">
          <TechnologyForm
            initialValue={editingTechnology}
            isSubmitting={isSaving}
            key={editingTechnology?.id ?? "new-technology"}
            onCancelEdit={() => setEditingTechnology(null)}
            onSubmit={handleSubmit}
            technologies={sortedTechnologies}
          />
        </aside>
      </div>
    </div>
  );
}
