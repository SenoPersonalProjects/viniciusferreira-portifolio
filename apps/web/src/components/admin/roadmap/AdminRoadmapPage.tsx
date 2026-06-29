"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";
import {
  type AdminRoadmapItem,
  type RoadmapItemPayload,
  getRoadmapTypeSummary,
  sortRoadmapItems,
} from "@/lib/admin/roadmap";

import { RoadmapItemForm } from "./RoadmapItemForm";
import { RoadmapItemList } from "./RoadmapItemList";

type AdminContent = {
  roadmap: AdminRoadmapItem[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const emptyContent: AdminContent = {
  roadmap: [],
};

const typeLabels: Record<AdminRoadmapItem["type"], string> = {
  carreira: "Carreira",
  formacao: "Formação",
  projeto: "Projeto",
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

  return "Não foi possível concluir a operação de trajetória.";
}

function getRoadmapSummary(roadmap: AdminRoadmapItem[]) {
  const publishedCount = roadmap.filter((item) => item.published).length;
  const typeSummary = getRoadmapTypeSummary(roadmap)
    .map((type) => typeLabels[type])
    .join(", ");

  return `${roadmap.length} itens, ${publishedCount} publicados${
    typeSummary ? `, ${typeSummary}` : ""
  }`;
}

export function AdminRoadmapPage() {
  const { accessToken } = useAdminSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AdminRoadmapItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<AdminRoadmapItem[]>([]);
  const [status, setStatus] = useState<PageStatus>("idle");

  const sortedRoadmap = useMemo(() => sortRoadmapItems(roadmap), [roadmap]);

  const loadRoadmap = useCallback(async () => {
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

      setRoadmap(sortRoadmapItems(data?.roadmap ?? emptyContent.roadmap));
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRoadmap();
    });
  }, [loadRoadmap]);

  async function handleSubmit(payload: RoadmapItemPayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    setError(null);
    setIsSaving(true);
    setNotice(null);

    try {
      if (editingItem) {
        const updated = await adminApiFetch<AdminRoadmapItem>(
          `/admin/roadmap/${encodeURIComponent(editingItem.id)}`,
          {
            body: JSON.stringify(payload),
            method: "PUT",
          },
          accessToken,
        );

        setRoadmap((current) =>
          sortRoadmapItems(
            current.map((item) => (item.id === editingItem.id ? updated : item)),
          ),
        );
        setEditingItem(null);
        setNotice("Item de trajetória atualizado com sucesso.");
        return;
      }

      const created = await adminApiFetch<AdminRoadmapItem>(
        "/admin/roadmap",
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
        accessToken,
      );

      setRoadmap((current) => sortRoadmapItems([...current, created]));
      setNotice("Item de trajetória criado com sucesso.");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: AdminRoadmapItem) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    const shouldDelete = window.confirm(
      `Excluir o item "${item.titlePt}"? Esta ação não pode ser desfeita.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(item.id);
    setError(null);
    setNotice(null);

    try {
      await adminApiFetch<{ deleted: boolean }>(
        `/admin/roadmap/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
        },
        accessToken,
      );

      setRoadmap((current) =>
        current.filter((roadmapItem) => roadmapItem.id !== item.id),
      );

      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }

      setNotice("Item de trajetória excluído com sucesso.");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Trajetória</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar trajetória
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Organize os marcos de formação, carreira e projetos exibidos na
              linha do tempo pública.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadRoadmap()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>{getRoadmapSummary(sortedRoadmap)}</p>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-label="Lista de trajetória" className="grid gap-4">
          {status === "loading" && sortedRoadmap.length === 0 ? (
            <div className="section-card p-6">
              <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                Carregando trajetória...
              </p>
            </div>
          ) : (
            <RoadmapItemList
              deletingId={deletingId}
              editingId={editingItem?.id ?? null}
              onDelete={(item) => void handleDelete(item)}
              onEdit={setEditingItem}
              roadmap={sortedRoadmap}
            />
          )}
        </section>

        <aside className="h-fit xl:sticky xl:top-6">
          <RoadmapItemForm
            initialValue={editingItem}
            isSubmitting={isSaving}
            key={editingItem?.id ?? "new-roadmap-item"}
            onCancelEdit={() => setEditingItem(null)}
            onSubmit={handleSubmit}
            roadmap={sortedRoadmap}
          />
        </aside>
      </div>
    </div>
  );
}
