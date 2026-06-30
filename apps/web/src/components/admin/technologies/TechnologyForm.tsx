"use client";

import { type FormEvent, useMemo, useState } from "react";

import {
  type AdminTechnology,
  type TechnologyFormValues,
  type TechnologyPayload,
  type TechnologyValidationErrors,
  getNextTechnologyOrder,
  getTechnologyFormValues,
  validateTechnologyForm,
} from "@/lib/admin/technologies";

type TechnologyFormProps = {
  initialValue?: AdminTechnology | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: TechnologyPayload) => Promise<void> | void;
  technologies: AdminTechnology[];
};

function getEmptyValues(): TechnologyFormValues {
  return {
    categoryEn: "",
    categoryPt: "",
    items: "",
    order: "",
    visible: true,
  };
}

export function TechnologyForm({
  initialValue = null,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
  technologies,
}: TechnologyFormProps) {
  const [values, setValues] = useState<TechnologyFormValues>(
    getTechnologyFormValues(initialValue),
  );
  const [errors, setErrors] = useState<TechnologyValidationErrors>({});

  const suggestedOrder = useMemo(
    () => getNextTechnologyOrder(technologies),
    [technologies],
  );
  const formMode = initialValue ? "edit" : "create";
  const fieldPrefix = `technology-${formMode}`;

  function updateValue<Key extends keyof TechnologyFormValues>(
    key: Key,
    value: TechnologyFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateTechnologyForm(values, technologies);

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
          {initialValue ? "Editar stack" : "Novo grupo"}
        </p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          {initialValue ? initialValue.categoryPt : "Cadastro de stack"}
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Informe as categorias em PT/EN e liste uma tecnologia por linha.
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
          htmlFor={`${fieldPrefix}-category-pt`}
        >
          Categoria PT
        </label>
        <input
          aria-describedby={
            errors.categoryPt
              ? `${fieldPrefix}-category-pt-error`
              : undefined
          }
          aria-invalid={Boolean(errors.categoryPt)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-category-pt`}
          maxLength={60}
          minLength={2}
          onChange={(event) => updateValue("categoryPt", event.target.value)}
          type="text"
          value={values.categoryPt}
        />
        {errors.categoryPt ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-category-pt-error`}
          >
            {errors.categoryPt}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-category-en`}
        >
          Categoria EN
        </label>
        <input
          aria-describedby={
            errors.categoryEn
              ? `${fieldPrefix}-category-en-error`
              : undefined
          }
          aria-invalid={Boolean(errors.categoryEn)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-category-en`}
          maxLength={60}
          minLength={2}
          onChange={(event) => updateValue("categoryEn", event.target.value)}
          type="text"
          value={values.categoryEn}
        />
        {errors.categoryEn ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-category-en-error`}
          >
            {errors.categoryEn}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-items`}
        >
          Itens
        </label>
        <textarea
          aria-describedby={
            errors.items ? `${fieldPrefix}-items-error` : `${fieldPrefix}-items-help`
          }
          aria-invalid={Boolean(errors.items)}
          className="min-h-40 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-items`}
          onChange={(event) => updateValue("items", event.target.value)}
          value={values.items}
        />
        {errors.items ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-items-error`}
          >
            {errors.items}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-items-help`}
          >
            Use uma linha por tecnologia. Linhas vazias e duplicados exatos são
            ignorados.
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
              ? "Salvar stack"
              : "Criar stack"}
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
