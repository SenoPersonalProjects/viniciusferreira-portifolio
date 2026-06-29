"use client";

import { useMemo, useState } from "react";

import { dossierByLocale, type DossierLocale } from "@/data/dossier";
import {
  DOSSIER_LOCALES,
  type DossierFormValues,
  type DossierValidationErrors,
  getInitialDossierFormValues,
  getInitialDossierPreviewDrafts,
  resetDossierDraft,
  validateDossierForm,
} from "@/lib/admin/dossier";

import { DossierDraftForm } from "./DossierDraftForm";
import { DossierPreview } from "./DossierPreview";

export function AdminDossierPreviewPage() {
  const [errors, setErrors] = useState<DossierValidationErrors>({});
  const [locale, setLocale] = useState<DossierLocale>("pt");
  const [notice, setNotice] = useState<string | null>(null);
  const [formValuesByLocale, setFormValuesByLocale] = useState(
    getInitialDossierFormValues,
  );
  const [previewByLocale, setPreviewByLocale] = useState(
    getInitialDossierPreviewDrafts,
  );

  const currentValues = formValuesByLocale[locale];
  const currentPreview = previewByLocale[locale];
  const localeSummary = useMemo(() => DOSSIER_LOCALES.join(", "), []);

  function handleLocaleChange(nextLocale: DossierLocale) {
    setLocale(nextLocale);
    setErrors({});
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
    const result = validateDossierForm(currentValues, dossierByLocale[locale]);

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
    setNotice("Prévia atualizada localmente. Nada foi salvo no banco.");
  }

  function handleReset() {
    const reset = resetDossierDraft(locale);

    setFormValuesByLocale((current) => ({
      ...current,
      [locale]: reset.formValues,
    }));
    setPreviewByLocale((current) => ({
      ...current,
      [locale]: reset.preview,
    }));
    setErrors({});
    setNotice("Conteúdo local restaurado para este locale.");
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Dossiê</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Preview do dossiê
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Simule alterações no contrato visual do dossiê atual sem alterar
              o arquivo local, o banco, a API ou a cena 3D pública.
            </p>
          </div>
          <div className="border border-[var(--color-primary)] bg-[var(--color-surface-soft)] px-4 py-3 font-[var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Prévia local
          </div>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p role="status">
            Prévia local: alterações não são salvas no banco nesta etapa.
          </p>
          <p>Locales disponíveis: {localeSummary}</p>
          {notice ? (
            <p className="text-[var(--color-foreground)]" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,34rem)_1fr]">
        <aside className="h-fit 2xl:sticky 2xl:top-6">
          <DossierDraftForm
            errors={errors}
            locale={locale}
            localeOptions={DOSSIER_LOCALES}
            onApply={handleApplyPreview}
            onLocaleChange={handleLocaleChange}
            onReset={handleReset}
            onValueChange={updateValue}
            values={currentValues}
          />
        </aside>

        <section aria-label="Prévia visual do dossiê">
          <DossierPreview content={currentPreview} locale={locale} />
        </section>
      </div>
    </div>
  );
}
