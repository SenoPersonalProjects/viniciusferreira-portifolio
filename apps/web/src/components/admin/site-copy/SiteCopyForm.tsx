"use client";

import { type FormEvent, useMemo, useState } from "react";

import {
  type AdminSiteCopy,
  type SiteCopyFormValues,
  type SiteCopyPayload,
  type SiteCopyValidationErrors,
  getSiteCopyFormValues,
  getSiteCopyLocaleOptions,
  validateSiteCopyForm,
} from "@/lib/admin/siteCopy";

type SiteCopyFormProps = {
  initialValue?: AdminSiteCopy | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: SiteCopyPayload) => Promise<boolean> | boolean;
};

function getEmptyValues(): SiteCopyFormValues {
  return {
    key: "",
    locale: "pt-BR",
    value: "",
  };
}

export function SiteCopyForm({
  initialValue = null,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
}: SiteCopyFormProps) {
  const [errors, setErrors] = useState<SiteCopyValidationErrors>({});
  const [values, setValues] = useState<SiteCopyFormValues>(
    getSiteCopyFormValues(initialValue),
  );

  const isEditing = Boolean(initialValue);
  const fieldPrefix = isEditing ? "site-copy-edit" : "site-copy-new";
  const localeOptions = useMemo(
    () => getSiteCopyLocaleOptions(values.locale),
    [values.locale],
  );

  function updateValue<Key extends keyof SiteCopyFormValues>(
    key: Key,
    value: SiteCopyFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateSiteCopyForm(values);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});

    const didSave = await onSubmit(result.payload);

    if (didSave && !initialValue) {
      setValues(getEmptyValues());
    }
  }

  return (
    <form
      className="section-card grid gap-5 p-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <p className="section-eyebrow">
          {isEditing ? "Editar texto" : "Novo texto"}
        </p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          {isEditing ? initialValue?.key : "Cadastro de texto"}
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Gerencie registros preparados para integração dinâmica futura. Estes
          textos ainda não substituem o conteúdo estático do site público.
        </p>
      </div>

      {Object.keys(errors).length > 0 ? (
        <div
          className="border border-[var(--color-primary)] bg-[var(--color-surface-soft)] p-4 font-[var(--font-mono)] text-xs text-[var(--color-foreground)]"
          role="alert"
        >
          Revise os campos destacados antes de salvar.
        </div>
      ) : null}

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-key`}
        >
          Chave
        </label>
        <input
          aria-describedby={
            errors.key ? `${fieldPrefix}-key-error` : `${fieldPrefix}-key-help`
          }
          aria-invalid={Boolean(errors.key)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting || isEditing}
          id={`${fieldPrefix}-key`}
          maxLength={120}
          minLength={3}
          onChange={(event) => updateValue("key", event.target.value)}
          type="text"
          value={values.key}
        />
        {errors.key ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-key-error`}
          >
            {errors.key}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-key-help`}
          >
            Use chaves como hero.headline ou projects.empty_state. Em edição, a
            chave fica travada para preservar o par único key + locale.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-locale`}
        >
          Locale
        </label>
        <select
          aria-describedby={
            errors.locale
              ? `${fieldPrefix}-locale-error`
              : `${fieldPrefix}-locale-help`
          }
          aria-invalid={Boolean(errors.locale)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting || isEditing}
          id={`${fieldPrefix}-locale`}
          onChange={(event) => updateValue("locale", event.target.value)}
          value={values.locale}
        >
          {localeOptions.map((locale) => (
            <option key={locale} value={locale}>
              {locale}
            </option>
          ))}
        </select>
        {errors.locale ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-locale-error`}
          >
            {errors.locale}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-locale-help`}
          >
            A criação usa pt-BR ou en. Registros legados com outro locale são
            preservados ao editar.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-value`}
        >
          Texto
        </label>
        <textarea
          aria-describedby={
            errors.value
              ? `${fieldPrefix}-value-error`
              : `${fieldPrefix}-value-help`
          }
          aria-invalid={Boolean(errors.value)}
          className="min-h-56 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-value`}
          maxLength={5000}
          onChange={(event) => updateValue("value", event.target.value)}
          value={values.value}
        />
        {errors.value ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-value-error`}
          >
            {errors.value}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-value-help`}
          >
            Texto plano. Acentos e casing são preservados; HTML e Markdown não
            são executados nesta branch.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar texto"
              : "Criar texto"}
        </button>

        {isEditing && onCancelEdit ? (
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={isSubmitting}
            onClick={onCancelEdit}
            type="button"
          >
            Cancelar edição
          </button>
        ) : null}
      </div>
    </form>
  );
}
