"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DossierLocale } from "@/data/dossier";
import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";
import {
  DOSSIER_LOCALES,
  type DossierFormValues,
  type DossierOrigin,
  type DossierValidationErrors,
  type PersistedDossierContent,
  getDossierStateFromPersisted,
  resetDossierDraft,
  validateDossierForm,
  validateDossierSavePayload,
} from "@/lib/admin/dossier";

import { DossierDraftForm } from "./DossierDraftForm";
import { DossierPreview } from "./DossierPreview";

type DossierApiResponse = {
  items: PersistedDossierContent[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const initialDossierState = getDossierStateFromPersisted();

function getAdminErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) {
    if (error.code === "unauthorized" || error.code === "forbidden") {
      return "A API recusou a sessao. Confirme o login e a allowlist SUPABASE_ADMIN_EMAILS.";
    }

    if (error.code === "unavailable") {
      return "API administrativa indisponivel. Confirme se o backend esta em execucao.";
    }

    return error.message;
  }

  return "Nao foi possivel concluir a operacao do dossie.";
}

function getOriginLabel(origin: DossierOrigin) {
  return origin === "database" ? "Banco" : "Fallback local";
}

export function AdminDossierPreviewPage() {
  const { accessToken } = useAdminSession();
  const [errors, setErrors] = useState<DossierValidationErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<DossierLocale>("pt");
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<PageStatus>("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [formValuesByLocale, setFormValuesByLocale] = useState(
    initialDossierState.formValues,
  );
  const [originByLocale, setOriginByLocale] = useState(
    initialDossierState.origins,
  );
  const [persistedByLocale, setPersistedByLocale] = useState(
    initialDossierState.persistedByLocale,
  );
  const [previewByLocale, setPreviewByLocale] = useState(
    initialDossierState.previews,
  );

  const currentValues = formValuesByLocale[locale];
  const currentPreview = previewByLocale[locale];
  const currentOrigin = originByLocale[locale];
  const localeSummary = useMemo(() => DOSSIER_LOCALES.join(", "), []);
  const databaseLocaleCount = DOSSIER_LOCALES.filter(
    (dossierLocale) => originByLocale[dossierLocale] === "database",
  ).length;

  const loadDossierContent = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const data = await adminApiFetch<DossierApiResponse>(
        "/admin/dossier",
        undefined,
        accessToken,
      );
      const nextState = getDossierStateFromPersisted(data?.items ?? []);

      setFormValuesByLocale(nextState.formValues);
      setOriginByLocale(nextState.origins);
      setPersistedByLocale(nextState.persistedByLocale);
      setPreviewByLocale(nextState.previews);
      setStatus("ready");
      setNotice("Conteudo do dossie carregado.");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDossierContent();
    });
  }, [loadDossierContent]);

  function handleLocaleChange(nextLocale: DossierLocale) {
    setLocale(nextLocale);
    setErrors({});
    setError(null);
    setNotice(null);
  }

  function updateValue<Key extends keyof DossierFormValues>(
    key: Key,
    value: DossierFormValues[Key],
  ) {
    setFormValuesByLocale((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        [key]: value,
      },
    }));
  }

  function handleApplyPreview() {
    const result = validateDossierForm(currentValues, currentPreview);

    if (!result.ok) {
      setErrors(result.errors);
      setNotice(null);
      return;
    }

    setErrors({});
    setPreviewByLocale((current) => ({
      ...current,
      [locale]: result.payload,
    }));
    setFormValuesByLocale((current) => ({
      ...current,
      [locale]: {
        classification: result.payload.classification,
        fileId: result.payload.fileId,
        location: result.payload.location,
        mainPhotoUrl: result.payload.mainPhotoUrl,
        note: result.payload.note,
        polaroidPhotoUrl: result.payload.polaroidPhotoUrl,
        project: result.payload.project,
        role: result.payload.role,
        stack: result.payload.stack,
        stamp: result.payload.stamp,
        status: result.payload.status,
        subject: result.payload.subject,
      },
    }));
    setNotice("Previa atualizada localmente. Nada foi salvo ainda.");
  }

  async function handleSave() {
    if (!accessToken) {
      setError("Sessao administrativa ausente.");
      return;
    }

    const result = validateDossierSavePayload(currentValues, currentPreview);

    if (!result.ok) {
      setErrors(result.errors);
      setNotice(null);
      return;
    }

    setErrors({});
    setError(null);
    setNotice(null);
    setIsSaving(true);

    try {
      const saved = await adminApiFetch<PersistedDossierContent>(
        `/admin/dossier/${encodeURIComponent(locale)}`,
        {
          body: JSON.stringify(result.payload),
          method: "PUT",
        },
        accessToken,
      );

      const nextPersistedByLocale = {
        ...persistedByLocale,
        [locale]: saved,
      };
      const reset = resetDossierDraft(locale, nextPersistedByLocale);

      setPersistedByLocale(nextPersistedByLocale);
      setOriginByLocale((current) => ({
        ...current,
        [locale]: "database",
      }));
      setPreviewByLocale((current) => ({
        ...current,
        [locale]: reset.preview,
      }));
      setFormValuesByLocale((current) => ({
        ...current,
        [locale]: reset.formValues,
      }));
      setNotice("Dossie salvo no banco administrativo.");
      setStatus("ready");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    const reset = resetDossierDraft(locale, persistedByLocale);

    setFormValuesByLocale((current) => ({
      ...current,
      [locale]: reset.formValues,
    }));
    setOriginByLocale((current) => ({
      ...current,
      [locale]: reset.origin,
    }));
    setPreviewByLocale((current) => ({
      ...current,
      [locale]: reset.preview,
    }));
    setErrors({});
    setError(null);
    setNotice(
      reset.origin === "database"
        ? "Registro do banco restaurado para este locale."
        : "Conteudo local restaurado para este locale.",
    );
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Dossie</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Preview do dossie
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Edite, visualize e salve o contrato editorial do dossie no banco
              administrativo. A experiencia publica e a cena 3D continuam
              usando o conteudo local nesta branch.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="border border-[var(--color-primary)] bg-[var(--color-surface-soft)] px-4 py-3 font-[var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
              {getOriginLabel(currentOrigin)}
            </div>
            <button
              className="secondary-action h-10 px-4 text-[10px] uppercase tracking-[0.2em]"
              disabled={status === "loading" || isSaving}
              onClick={() => void loadDossierContent()}
              type="button"
            >
              {status === "loading" ? "Carregando..." : "Recarregar"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p role="status">
            Previa administrativa: alteracoes so afetam o banco do admin apos
            salvar.
          </p>
          <p>
            Locales disponiveis: {localeSummary}. Registros no banco:{" "}
            {databaseLocaleCount}.
          </p>
          {currentOrigin === "fallback" ? (
            <p>
              Este locale ainda nao possui registro no banco. A previa usa o
              conteudo local atual.
            </p>
          ) : null}
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

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,34rem)_1fr]">
        <aside className="h-fit 2xl:sticky 2xl:top-6">
          <DossierDraftForm
            errors={errors}
            isLoading={status === "loading"}
            isSaving={isSaving}
            locale={locale}
            localeOptions={DOSSIER_LOCALES}
            onApply={handleApplyPreview}
            onLocaleChange={handleLocaleChange}
            onReset={handleReset}
            onSave={() => void handleSave()}
            onValueChange={updateValue}
            values={currentValues}
          />
        </aside>

        <section aria-label="Previa visual do dossie">
          <DossierPreview content={currentPreview} locale={locale} />
        </section>
      </div>
    </div>
  );
}
