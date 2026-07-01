"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";
import {
  adminApiFetch,
  getAdminApiErrorMessage,
} from "@/lib/admin/adminApi";
import {
  type AdminSiteCopy,
  type SiteCopyPayload,
  sortSiteCopy,
} from "@/lib/admin/siteCopy";

import { SiteCopyForm } from "./SiteCopyForm";
import { SiteCopyList } from "./SiteCopyList";

type AdminContent = {
  siteCopy: AdminSiteCopy[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const emptyContent: AdminContent = {
  siteCopy: [],
};

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

function getAdminErrorMessage(error: unknown) {
  return getAdminApiErrorMessage(
    error,
    "Não foi possível concluir a operação de textos.",
  );
}

function getSiteCopySummary(records: AdminSiteCopy[]) {
  const locales = Array.from(new Set(records.map((record) => record.locale)));
  const keys = new Set(records.map((record) => record.key));
  const localeSummary =
    locales.length > 0 ? `, locales: ${locales.join(", ")}` : "";

  return `${pluralize(records.length, "registro", "registros")}, ${pluralize(
    keys.size,
    "chave única",
    "chaves únicas",
  )}${localeSummary}`;
}

export function AdminSiteCopyPage() {
  const { accessToken } = useAdminSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<AdminSiteCopy | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [records, setRecords] = useState<AdminSiteCopy[]>([]);
  const [status, setStatus] = useState<PageStatus>("idle");

  const sortedRecords = useMemo(() => sortSiteCopy(records), [records]);

  const loadSiteCopy = useCallback(async () => {
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

      setRecords(sortSiteCopy(data?.siteCopy ?? emptyContent.siteCopy));
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSiteCopy();
    });
  }, [loadSiteCopy]);

  async function handleSubmit(payload: SiteCopyPayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return false;
    }

    setError(null);
    setIsSaving(true);
    setNotice(null);

    try {
      if (editingRecord) {
        const updated = await adminApiFetch<AdminSiteCopy>(
          `/admin/site-copy/${encodeURIComponent(editingRecord.id)}`,
          {
            body: JSON.stringify(payload),
            method: "PUT",
          },
          accessToken,
        );

        setRecords((current) =>
          sortSiteCopy(
            current.map((record) =>
              record.id === editingRecord.id ? updated : record,
            ),
          ),
        );
        setEditingRecord(null);
        setNotice("Texto atualizado com sucesso.");
        return true;
      }

      const saved = await adminApiFetch<AdminSiteCopy>(
        "/admin/site-copy",
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
        accessToken,
      );

      setRecords((current) =>
        sortSiteCopy([
          ...current.filter(
            (record) =>
              record.id !== saved.id &&
              !(record.key === saved.key && record.locale === saved.locale),
          ),
          saved,
        ]),
      );
      setNotice("Texto salvo com sucesso.");
      return true;
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: AdminSiteCopy) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    const shouldDelete = window.confirm(
      `Excluir o texto "${record.key}" (${record.locale})? Esta ação não pode ser desfeita.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(record.id);
    setError(null);
    setNotice(null);

    try {
      await adminApiFetch<{ deleted: boolean }>(
        `/admin/site-copy/${encodeURIComponent(record.id)}`,
        {
          method: "DELETE",
        },
        accessToken,
      );

      setRecords((current) =>
        current.filter((currentRecord) => currentRecord.id !== record.id),
      );

      if (editingRecord?.id === record.id) {
        setEditingRecord(null);
      }

      setNotice("Texto excluído com sucesso.");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Textos</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar textos
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Cadastre registros de copy por chave e idioma. Este conteúdo está
              preparado para integração dinâmica futura e ainda não substitui os
              textos estáticos do site público.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadSiteCopy()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>{getSiteCopySummary(sortedRecords)}</p>
          <p>
            Criar um registro com a mesma combinação key + locale pode atualizar
            o texto existente por causa do upsert da API.
          </p>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section aria-label="Lista de textos" className="grid gap-4">
          {status === "loading" && sortedRecords.length === 0 ? (
            <div className="section-card p-6">
              <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                Carregando textos...
              </p>
            </div>
          ) : (
            <SiteCopyList
              deletingId={deletingId}
              editingId={editingRecord?.id ?? null}
              onDelete={(record) => void handleDelete(record)}
              onEdit={setEditingRecord}
              records={sortedRecords}
            />
          )}
        </section>

        <aside className="h-fit xl:sticky xl:top-6">
          <SiteCopyForm
            initialValue={editingRecord}
            isSubmitting={isSaving}
            key={editingRecord?.id ?? "new-site-copy"}
            onCancelEdit={() => setEditingRecord(null)}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>
    </div>
  );
}
