"use client";

import { type FormEvent, useMemo, useState } from "react";

import {
  type AdminProject,
  type ProjectFormValues,
  type ProjectPayload,
  type ProjectValidationErrors,
  createProjectSlug,
  getNextProjectOrder,
  getProjectFormValues,
  validateProjectForm,
} from "@/lib/admin/projects";

type ProjectFormProps = {
  initialValue?: AdminProject | null;
  isSubmitting?: boolean;
  onCancelEdit?: () => void;
  onSubmit: (payload: ProjectPayload) => Promise<void> | void;
  projects: AdminProject[];
};

function getEmptyValues(): ProjectFormValues {
  return {
    descriptionEn: "",
    descriptionPt: "",
    featured: true,
    frameCode: "",
    liveUrl: "",
    order: "",
    posterImage: "",
    previewImages: "",
    published: true,
    repositoryUrl: "",
    slug: "",
    stack: "",
    titleEn: "",
    titlePt: "",
  };
}

export function ProjectForm({
  initialValue = null,
  isSubmitting = false,
  onCancelEdit,
  onSubmit,
  projects,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(
    getProjectFormValues(initialValue),
  );
  const [errors, setErrors] = useState<ProjectValidationErrors>({});

  const suggestedOrder = useMemo(
    () => getNextProjectOrder(projects),
    [projects],
  );
  const formMode = initialValue ? "edit" : "create";
  const fieldPrefix = `project-${formMode}`;

  function updateValue<Key extends keyof ProjectFormValues>(
    key: Key,
    value: ProjectFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleGenerateSlug() {
    updateValue("slug", createProjectSlug(values.titlePt));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateProjectForm(values, projects);

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
          {initialValue ? "Editar projeto" : "Novo projeto"}
        </p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          {initialValue ? initialValue.titlePt : "Cadastro de projeto"}
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Informe textos localizados, links reais e caminhos de imagens já
          existentes. Upload fica para uma branch futura.
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
          htmlFor={`${fieldPrefix}-title-pt`}
        >
          Título PT
        </label>
        <input
          aria-describedby={
            errors.titlePt ? `${fieldPrefix}-title-pt-error` : undefined
          }
          aria-invalid={Boolean(errors.titlePt)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-title-pt`}
          maxLength={100}
          minLength={3}
          onChange={(event) => updateValue("titlePt", event.target.value)}
          type="text"
          value={values.titlePt}
        />
        {errors.titlePt ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-title-pt-error`}
          >
            {errors.titlePt}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-title-en`}
        >
          Título EN
        </label>
        <input
          aria-describedby={
            errors.titleEn ? `${fieldPrefix}-title-en-error` : undefined
          }
          aria-invalid={Boolean(errors.titleEn)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-title-en`}
          maxLength={100}
          minLength={3}
          onChange={(event) => updateValue("titleEn", event.target.value)}
          type="text"
          value={values.titleEn}
        />
        {errors.titleEn ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-title-en-error`}
          >
            {errors.titleEn}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-slug`}
        >
          Slug
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            aria-describedby={
              errors.slug ? `${fieldPrefix}-slug-error` : `${fieldPrefix}-slug-help`
            }
            aria-invalid={Boolean(errors.slug)}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
            disabled={isSubmitting}
            id={`${fieldPrefix}-slug`}
            maxLength={80}
            minLength={3}
            onChange={(event) => updateValue("slug", event.target.value)}
            type="text"
            value={values.slug}
          />
          <button
            className="secondary-action h-11 px-4 text-[9px] uppercase tracking-[0.18em]"
            disabled={isSubmitting || values.titlePt.trim().length === 0}
            onClick={handleGenerateSlug}
            type="button"
          >
            Gerar slug
          </button>
        </div>
        {errors.slug ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-slug-error`}
          >
            {errors.slug}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-slug-help`}
          >
            Use apenas letras minúsculas, números e hífen. O botão gera a partir
            do título PT somente quando acionado.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-description-pt`}
        >
          Descrição PT
        </label>
        <textarea
          aria-describedby={
            errors.descriptionPt
              ? `${fieldPrefix}-description-pt-error`
              : undefined
          }
          aria-invalid={Boolean(errors.descriptionPt)}
          className="min-h-28 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-description-pt`}
          maxLength={500}
          minLength={10}
          onChange={(event) =>
            updateValue("descriptionPt", event.target.value)
          }
          value={values.descriptionPt}
        />
        {errors.descriptionPt ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-description-pt-error`}
          >
            {errors.descriptionPt}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-description-en`}
        >
          Descrição EN
        </label>
        <textarea
          aria-describedby={
            errors.descriptionEn
              ? `${fieldPrefix}-description-en-error`
              : undefined
          }
          aria-invalid={Boolean(errors.descriptionEn)}
          className="min-h-28 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-description-en`}
          maxLength={500}
          minLength={10}
          onChange={(event) =>
            updateValue("descriptionEn", event.target.value)
          }
          value={values.descriptionEn}
        />
        {errors.descriptionEn ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-description-en-error`}
          >
            {errors.descriptionEn}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-stack`}
        >
          Stack
        </label>
        <textarea
          aria-describedby={
            errors.stack ? `${fieldPrefix}-stack-error` : `${fieldPrefix}-stack-help`
          }
          aria-invalid={Boolean(errors.stack)}
          className="min-h-36 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-stack`}
          onChange={(event) => updateValue("stack", event.target.value)}
          value={values.stack}
        />
        {errors.stack ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-stack-error`}
          >
            {errors.stack}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-stack-help`}
          >
            Use uma linha por tecnologia. Linhas vazias e duplicados exatos são
            ignorados.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-repository-url`}
        >
          URL do repositório
        </label>
        <input
          aria-describedby={
            errors.repositoryUrl
              ? `${fieldPrefix}-repository-url-error`
              : undefined
          }
          aria-invalid={Boolean(errors.repositoryUrl)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-repository-url`}
          onChange={(event) => updateValue("repositoryUrl", event.target.value)}
          type="url"
          value={values.repositoryUrl}
        />
        {errors.repositoryUrl ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-repository-url-error`}
          >
            {errors.repositoryUrl}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-live-url`}
        >
          URL da demo
        </label>
        <input
          aria-describedby={
            errors.liveUrl ? `${fieldPrefix}-live-url-error` : undefined
          }
          aria-invalid={Boolean(errors.liveUrl)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-live-url`}
          onChange={(event) => updateValue("liveUrl", event.target.value)}
          type="url"
          value={values.liveUrl}
        />
        {errors.liveUrl ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-live-url-error`}
          >
            {errors.liveUrl}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-frame-code`}
        >
          Código do frame
        </label>
        <input
          aria-describedby={
            errors.frameCode
              ? `${fieldPrefix}-frame-code-error`
              : `${fieldPrefix}-frame-code-help`
          }
          aria-invalid={Boolean(errors.frameCode)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-frame-code`}
          maxLength={24}
          onChange={(event) => updateValue("frameCode", event.target.value)}
          type="text"
          value={values.frameCode}
        />
        {errors.frameCode ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-frame-code-error`}
          >
            {errors.frameCode}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-frame-code-help`}
          >
            Opcional. Não será gerado automaticamente.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-poster-image`}
        >
          Poster
        </label>
        <input
          aria-describedby={
            errors.posterImage
              ? `${fieldPrefix}-poster-image-error`
              : `${fieldPrefix}-poster-image-help`
          }
          aria-invalid={Boolean(errors.posterImage)}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-poster-image`}
          onChange={(event) => updateValue("posterImage", event.target.value)}
          type="text"
          value={values.posterImage}
        />
        {errors.posterImage ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-poster-image-error`}
          >
            {errors.posterImage}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-poster-image-help`}
          >
            Use caminho interno como /projects/portfolio/poster.svg ou uma URL
            http(s). Upload será tratado em branch futura.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
          htmlFor={`${fieldPrefix}-preview-images`}
        >
          Imagens de preview
        </label>
        <textarea
          aria-describedby={
            errors.previewImages
              ? `${fieldPrefix}-preview-images-error`
              : `${fieldPrefix}-preview-images-help`
          }
          aria-invalid={Boolean(errors.previewImages)}
          className="min-h-36 resize-y border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-mono)] text-sm text-[var(--color-foreground)]"
          disabled={isSubmitting}
          id={`${fieldPrefix}-preview-images`}
          onChange={(event) => updateValue("previewImages", event.target.value)}
          value={values.previewImages}
        />
        {errors.previewImages ? (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
            id={`${fieldPrefix}-preview-images-error`}
          >
            {errors.previewImages}
          </p>
        ) : (
          <p
            className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
            id={`${fieldPrefix}-preview-images-help`}
          >
            Use uma imagem por linha. Pode ficar vazio; o Film Reel usa o poster
            como fallback visual.
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
            errors.order ? `${fieldPrefix}-order-error` : `${fieldPrefix}-order-help`
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

      <div className="grid gap-3">
        <label className="flex items-center gap-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]">
          <input
            checked={values.featured}
            className="h-4 w-4 accent-[var(--color-primary)]"
            disabled={isSubmitting}
            onChange={(event) => updateValue("featured", event.target.checked)}
            type="checkbox"
          />
          Destacado no Film Reel
        </label>

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
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Salvando..."
            : initialValue
              ? "Salvar projeto"
              : "Criar projeto"}
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
