"use client";

import { type FormEvent, useMemo, useState } from "react";

import {
  ROADMAP_TYPES,
  type AdminRoadmapItem,
  type RoadmapItemFormValues,
  type RoadmapItemPayload,
  type RoadmapValidationErrors,
  getNextRoadmapOrder,
  getRoadmapItemFormValues,
  validateRoadmapItemForm,
} from "@/lib/admin/roadmap";

type RoadmapItemFormProps = {
  initialValue?: AdminRoadmapItem | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: RoadmapItemPayload) => Promise<void> | void;
  roadmap: AdminRoadmapItem[];
};

const typeLabels: Record<(typeof ROADMAP_TYPES)[number], string> = {
  carreira: "Carreira",
  formacao: "Formação",
  projeto: "Projeto",
};

function getEmptyValues(): RoadmapItemFormValues {
  return {
    detailsEn: "",
    detailsPt: "",
    endDate: "",
    order: "",
    published: true,
    startDate: "",
    summaryEn: "",
    summaryPt: "",
    technologies: "",
    titleEn: "",
    titlePt: "",
    type: "projeto",
  };
}

export function RoadmapItemForm({
  initialValue = null,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
  roadmap,
}: RoadmapItemFormProps) {
  const [values, setValues] = useState<RoadmapItemFormValues>(
    getRoadmapItemFormValues(initialValue),
  );
  const [errors, setErrors] = useState<RoadmapValidationErrors>({});

  const suggestedOrder = useMemo(
    () => getNextRoadmapOrder(roadmap),
    [roadmap],
  );
  const formMode = initialValue ? "edit" : "create";
  const fieldPrefix = `roadmap-${formMode}`;

  function updateValue<Key extends keyof RoadmapItemFormValues>(
    key: Key,
    value: RoadmapItemFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateRoadmapItemForm(values, roadmap);

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
          {initialValue ? "Editar trajetória" : "Novo marco"}
        </p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          {initialValue ? initialValue.titlePt : "Cadastro de trajetória"}
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Use períodos editoriais curtos e preencha os textos em PT e EN.
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label
            className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
            htmlFor={`${fieldPrefix}-start-date`}
          >
            Início
          </label>
          <input
            aria-describedby={
              errors.startDate
                ? `${fieldPrefix}-start-date-error`
                : `${fieldPrefix}-start-date-help`
            }
            aria-invalid={Boolean(errors.startDate)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
            disabled={isSubmitting}
            id={`${fieldPrefix}-start-date`}
            maxLength={30}
            minLength={2}
            onChange={(event) => updateValue("startDate", event.target.value)}
            type="text"
            value={values.startDate}
          />
          {errors.startDate ? (
            <p
              className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
              id={`${fieldPrefix}-start-date-error`}
            >
              {errors.startDate}
            </p>
          ) : (
            <p
              className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
              id={`${fieldPrefix}-start-date-help`}
            >
              Ex.: 2024, 2024-01 ou Jan 2024.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
            htmlFor={`${fieldPrefix}-end-date`}
          >
            Fim
          </label>
          <input
            aria-describedby={
              errors.endDate
                ? `${fieldPrefix}-end-date-error`
                : `${fieldPrefix}-end-date-help`
            }
            aria-invalid={Boolean(errors.endDate)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
            disabled={isSubmitting}
            id={`${fieldPrefix}-end-date`}
            maxLength={30}
            minLength={2}
            onChange={(event) => updateValue("endDate", event.target.value)}
            type="text"
            value={values.endDate}
          />
          {errors.endDate ? (
            <p
              className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
              id={`${fieldPrefix}-end-date-error`}
            >
              {errors.endDate}
            </p>
          ) : (
            <p
              className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
              id={`${fieldPrefix}-end-date-help`}
            >
              Ex.: Atual, Present, 2025 ou 2025-12.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-type`}
        >
          Tipo
        </label>
        <select
          aria-describedby={errors.type ? `${fieldPrefix}-type-error` : undefined}
          aria-invalid={Boolean(errors.type)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-type`}
          onChange={(event) => updateValue("type", event.target.value)}
          value={values.type}
        >
          {ROADMAP_TYPES.map((type) => (
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

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          disabled={isSubmitting}
          error={errors.titlePt}
          id={`${fieldPrefix}-title-pt`}
          label="Título PT"
          maxLength={100}
          onChange={(value) => updateValue("titlePt", value)}
          value={values.titlePt}
        />
        <TextField
          disabled={isSubmitting}
          error={errors.titleEn}
          id={`${fieldPrefix}-title-en`}
          label="Título EN"
          maxLength={100}
          onChange={(value) => updateValue("titleEn", value)}
          value={values.titleEn}
        />
      </div>

      <TextareaField
        disabled={isSubmitting}
        error={errors.summaryPt}
        id={`${fieldPrefix}-summary-pt`}
        label="Resumo PT"
        maxLength={280}
        onChange={(value) => updateValue("summaryPt", value)}
        rows={4}
        value={values.summaryPt}
      />

      <TextareaField
        disabled={isSubmitting}
        error={errors.summaryEn}
        id={`${fieldPrefix}-summary-en`}
        label="Resumo EN"
        maxLength={280}
        onChange={(value) => updateValue("summaryEn", value)}
        rows={4}
        value={values.summaryEn}
      />

      <TextareaField
        disabled={isSubmitting}
        error={errors.detailsPt}
        id={`${fieldPrefix}-details-pt`}
        label="Detalhes PT"
        maxLength={1000}
        onChange={(value) => updateValue("detailsPt", value)}
        rows={6}
        value={values.detailsPt}
      />

      <TextareaField
        disabled={isSubmitting}
        error={errors.detailsEn}
        id={`${fieldPrefix}-details-en`}
        label="Detalhes EN"
        maxLength={1000}
        onChange={(value) => updateValue("detailsEn", value)}
        rows={6}
        value={values.detailsEn}
      />

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-technologies`}
        >
          Tecnologias
        </label>
        <textarea
          aria-describedby={
            errors.technologies
              ? `${fieldPrefix}-technologies-error`
              : `${fieldPrefix}-technologies-help`
          }
          aria-invalid={Boolean(errors.technologies)}
          className="min-h-32 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-technologies`}
          onChange={(event) => updateValue("technologies", event.target.value)}
          value={values.technologies}
        />
        {errors.technologies ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-technologies-error`}
          >
            {errors.technologies}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-technologies-help`}
          >
            Campo opcional. Use uma linha por tecnologia.
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
          checked={values.published}
          className="h-4 w-4 accent-[var(--color-primary)]"
          disabled={isSubmitting}
          onChange={(event) => updateValue("published", event.target.checked)}
          type="checkbox"
        />
        Publicado no portfólio público
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
              ? "Salvar item"
              : "Criar item"}
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

type TextFieldProps = {
  disabled: boolean;
  error?: string;
  id: string;
  label: string;
  maxLength: number;
  onChange: (value: string) => void;
  value: string;
};

function TextField({
  disabled,
  error,
  id,
  label,
  maxLength,
  onChange,
  value,
}: TextFieldProps) {
  return (
    <div className="grid gap-2">
      <label
        className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
      {error ? (
        <p
          className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
          id={`${id}-error`}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextareaFieldProps = TextFieldProps & {
  rows: number;
};

function TextareaField({
  disabled,
  error,
  id,
  label,
  maxLength,
  onChange,
  rows,
  value,
}: TextareaFieldProps) {
  return (
    <div className="grid gap-2">
      <label
        className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
        htmlFor={id}
      >
        {label}
      </label>
      <textarea
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        className="resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        value={value}
      />
      {error ? (
        <p
          className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
          id={`${id}-error`}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
