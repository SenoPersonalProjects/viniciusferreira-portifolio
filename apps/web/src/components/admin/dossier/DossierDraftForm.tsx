"use client";

import type { DossierLocale } from "@/data/dossier";
import type {
  DossierFormValues,
  DossierValidationErrors,
} from "@/lib/admin/dossier";

type DossierDraftFormProps = {
  errors: DossierValidationErrors;
  isLoading?: boolean;
  isSaving?: boolean;
  locale: DossierLocale;
  localeOptions: DossierLocale[];
  onApply: () => void;
  onLocaleChange: (locale: DossierLocale) => void;
  onReset: () => void;
  onSave: () => void;
  onValueChange: <Key extends keyof DossierFormValues>(
    key: Key,
    value: DossierFormValues[Key],
  ) => void;
  values: DossierFormValues;
};

const textFields: Array<{
  key: keyof DossierFormValues;
  label: string;
  maxLength: number;
}> = [
  { key: "fileId", label: "Arquivo", maxLength: 40 },
  { key: "classification", label: "Classificacao", maxLength: 60 },
  { key: "project", label: "Projeto", maxLength: 120 },
  { key: "subject", label: "Assunto", maxLength: 120 },
  { key: "role", label: "Cargo", maxLength: 120 },
  { key: "status", label: "Status", maxLength: 60 },
  { key: "location", label: "Localizacao", maxLength: 80 },
  { key: "stack", label: "Stack", maxLength: 160 },
  { key: "stamp", label: "Carimbo", maxLength: 60 },
];

export function DossierDraftForm({
  errors,
  isLoading = false,
  isSaving = false,
  locale,
  localeOptions,
  onApply,
  onLocaleChange,
  onReset,
  onSave,
  onValueChange,
  values,
}: DossierDraftFormProps) {
  const hasErrors = Object.keys(errors).length > 0;
  const isBusy = isLoading || isSaving;

  return (
    <form
      className="section-card grid gap-5 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div>
        <p className="section-eyebrow">Contrato visual</p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Draft do dossie
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Edite os campos atuais, aplique a previa local e salve no banco
          administrativo quando o contrato visual estiver correto.
        </p>
      </div>

      {hasErrors ? (
        <div
          className="border border-[var(--color-primary)] bg-[var(--color-surface-soft)] p-4 font-[var(--font-mono)] text-xs text-[var(--color-foreground)]"
          role="alert"
        >
          Revise os campos destacados antes de aplicar a previa.
        </div>
      ) : null}

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor="dossier-locale"
        >
          Locale
        </label>
        <select
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isBusy}
          id="dossier-locale"
          onChange={(event) => onLocaleChange(event.target.value as DossierLocale)}
          value={locale}
        >
          {localeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {textFields.map((field) => {
          const error = errors[field.key];
          const inputId = `dossier-${field.key}`;

          return (
            <div className="grid gap-2" key={field.key}>
              <label
                className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
                htmlFor={inputId}
              >
                {field.label}
              </label>
              <input
                aria-describedby={error ? `${inputId}-error` : undefined}
                aria-invalid={Boolean(error)}
                className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
                disabled={isBusy}
                id={inputId}
                maxLength={field.maxLength}
                onChange={(event) => onValueChange(field.key, event.target.value)}
                type="text"
                value={values[field.key]}
              />
              {error ? (
                <p
                  className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
                  id={`${inputId}-error`}
                >
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor="dossier-note"
        >
          Note
        </label>
        <textarea
          aria-describedby={
            errors.note ? "dossier-note-error" : "dossier-note-help"
          }
          aria-invalid={Boolean(errors.note)}
          className="min-h-32 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isBusy}
          id="dossier-note"
          maxLength={600}
          onChange={(event) => onValueChange("note", event.target.value)}
          value={values.note}
        />
        {errors.note ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id="dossier-note-error"
          >
            {errors.note}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id="dossier-note-help"
          >
            Campo preservado como note. Texto plano, sem HTML.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            key: "mainPhotoUrl" as const,
            label: "Imagem principal",
          },
          {
            key: "polaroidPhotoUrl" as const,
            label: "Imagem polaroid",
          },
        ].map((field) => {
          const error = errors[field.key];
          const inputId = `dossier-${field.key}`;

          return (
            <div className="grid gap-2" key={field.key}>
              <label
                className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
                htmlFor={inputId}
              >
                {field.label}
              </label>
              <input
                aria-describedby={
                  error ? `${inputId}-error` : `${inputId}-help`
                }
                aria-invalid={Boolean(error)}
                className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
                disabled={isBusy}
                id={inputId}
                onChange={(event) => onValueChange(field.key, event.target.value)}
                type="text"
                value={values[field.key]}
              />
              {error ? (
                <p
                  className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
                  id={`${inputId}-error`}
                >
                  {error}
                </p>
              ) : (
                <p
                  className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
                  id={`${inputId}-help`}
                >
                  Use /caminho-interno ou URL http(s). Upload fica para branch
                  futura.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isBusy}
          type="submit"
        >
          Aplicar previa
        </button>
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isBusy}
          onClick={onSave}
          type="button"
        >
          {isSaving ? "Salvando..." : "Salvar no banco"}
        </button>
        <button
          className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isBusy}
          onClick={onReset}
          type="button"
        >
          Resetar alteracoes
        </button>
      </div>
    </form>
  );
}
