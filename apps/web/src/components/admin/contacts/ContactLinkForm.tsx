"use client";

import { type FormEvent, useMemo, useState } from "react";

import type { ContactLink } from "@/data/portfolioContent";
import {
  CONTACT_LINK_TYPES,
  type ContactLinkFormValues,
  type ContactLinkPayload,
  type ContactLinkValidationErrors,
  getContactLinkFormValues,
  getNextContactLinkOrder,
  validateContactLinkForm,
} from "@/lib/admin/contactLinks";

type ContactLinkFormProps = {
  contactLinks: ContactLink[];
  initialValue?: ContactLink | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: ContactLinkPayload) => Promise<void> | void;
};

const typeLabels: Record<(typeof CONTACT_LINK_TYPES)[number], string> = {
  email: "Email",
  external: "Externo",
  github: "GitHub",
  linkedin: "LinkedIn",
};

function getEmptyValues(): ContactLinkFormValues {
  return {
    label: "",
    order: "",
    type: "external",
    url: "",
    visible: true,
  };
}

export function ContactLinkForm({
  contactLinks,
  initialValue = null,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
}: ContactLinkFormProps) {
  const [values, setValues] = useState<ContactLinkFormValues>(
    getContactLinkFormValues(initialValue),
  );
  const [errors, setErrors] = useState<ContactLinkValidationErrors>({});

  const suggestedOrder = useMemo(
    () => getNextContactLinkOrder(contactLinks),
    [contactLinks],
  );
  const formMode = initialValue ? "edit" : "create";
  const fieldPrefix = `contact-link-${formMode}`;

  function updateValue<Key extends keyof ContactLinkFormValues>(
    key: Key,
    value: ContactLinkFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateContactLinkForm(values, contactLinks);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.payload);

    if (!initialValue) {
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
          {initialValue ? "Editar contato" : "Novo contato"}
        </p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          {initialValue ? initialValue.label : "Cadastro de link"}
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          O formulário valida os dados antes de enviar para a API
          administrativa.
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
          htmlFor={`${fieldPrefix}-label`}
        >
          Label
        </label>
        <input
          aria-describedby={
            errors.label ? `${fieldPrefix}-label-error` : undefined
          }
          aria-invalid={Boolean(errors.label)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-label`}
          maxLength={60}
          minLength={2}
          onChange={(event) => updateValue("label", event.target.value)}
          type="text"
          value={values.label}
        />
        {errors.label ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-label-error`}
          >
            {errors.label}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-type`}
        >
          Tipo
        </label>
        <select
          aria-describedby={
            errors.type ? `${fieldPrefix}-type-error` : undefined
          }
          aria-invalid={Boolean(errors.type)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-type`}
          onChange={(event) => updateValue("type", event.target.value)}
          value={values.type}
        >
          {CONTACT_LINK_TYPES.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
        {errors.type ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-type-error`}
          >
            {errors.type}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-url`}
        >
          URL ou email
        </label>
        <input
          aria-describedby={
            errors.url ? `${fieldPrefix}-url-error` : `${fieldPrefix}-url-help`
          }
          aria-invalid={Boolean(errors.url)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-url`}
          onChange={(event) => updateValue("url", event.target.value)}
          type="text"
          value={values.url}
        />
        {errors.url ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-url-error`}
          >
            {errors.url}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-url-help`}
          >
            Email pode ser informado como usuario@dominio.com ou mailto:.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-order`}
        >
          Ordem
        </label>
        <input
          aria-describedby={
            errors.order
              ? `${fieldPrefix}-order-error`
              : `${fieldPrefix}-order-help`
          }
          aria-invalid={Boolean(errors.order)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-order`}
          onChange={(event) => updateValue("order", event.target.value)}
          type="number"
          value={values.order}
        />
        {errors.order ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-order-error`}
          >
            {errors.order}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-order-help`}
          >
            Vazio usa a próxima ordem sugerida: {suggestedOrder}.
          </p>
        )}
      </div>

      <label className="flex items-center gap-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]">
        <input
          checked={values.visible}
          className="h-4 w-4 accent-[var(--color-primary)]"
          disabled={isSubmitting}
          onChange={(event) => updateValue("visible", event.target.checked)}
          type="checkbox"
        />
        Visível no portfólio público
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Salvando..."
            : initialValue
              ? "Salvar contato"
              : "Criar contato"}
        </button>

        {initialValue && onCancelEdit ? (
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
