"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";

import {
  type AdminProfile,
  type ProfileFormValues,
  type ProfilePayload,
  type ProfileValidationErrors,
  getProfileFormValues,
  validateProfileForm,
} from "@/lib/admin/profile";

type ProfileFormProps = {
  initialValue?: AdminProfile | null;
  isSubmitting?: boolean;
  onSubmit: (payload: ProfilePayload) => Promise<void> | void;
};

type TextFieldProps = {
  error?: string;
  fieldPrefix: string;
  help?: string;
  isSubmitting: boolean;
  label: string;
  maxLength: number;
  minLength: number;
  name: keyof ProfileFormValues;
  onChange: (key: keyof ProfileFormValues, value: string) => void;
  textarea?: boolean;
  value: string;
};

function TextField({
  error,
  fieldPrefix,
  help,
  isSubmitting,
  label,
  maxLength,
  minLength,
  name,
  onChange,
  textarea = false,
  value,
}: TextFieldProps) {
  const fieldId = `${fieldPrefix}-${name}`;
  const descriptionId = error
    ? `${fieldId}-error`
    : help
      ? `${fieldId}-help`
      : undefined;
  const sharedProps = {
    "aria-describedby": descriptionId,
    "aria-invalid": Boolean(error),
    className:
      "border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-[var(--font-body)] text-sm text-[var(--color-foreground)]",
    disabled: isSubmitting,
    id: fieldId,
    maxLength,
    minLength,
    onChange: (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    ) => onChange(name, event.target.value),
    value,
  };

  return (
    <div className="grid gap-2">
      <label
        className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]"
        htmlFor={fieldId}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          {...sharedProps}
          className={`${sharedProps.className} min-h-36 resize-y leading-relaxed`}
        />
      ) : (
        <input {...sharedProps} type="text" />
      )}
      {error ? (
        <p
          className="font-[var(--font-mono)] text-xs text-[var(--color-primary)]"
          id={`${fieldId}-error`}
        >
          {error}
        </p>
      ) : help ? (
        <p
          className="font-[var(--font-mono)] text-xs text-[var(--color-muted)]"
          id={`${fieldId}-help`}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function ProfileForm({
  initialValue = null,
  isSubmitting = false,
  onSubmit,
}: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(
    getProfileFormValues(initialValue),
  );
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const fieldPrefix = initialValue ? "profile-edit" : "profile-create";

  function updateValue(key: keyof ProfileFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateProfileForm(values);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    await onSubmit(result.payload);
  }

  return (
    <form
      className="section-card grid gap-8 p-6 md:p-8"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <p className="section-eyebrow">Perfil</p>
        <h2 className="mt-3 font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
          Informações principais
        </h2>
        <p className="mt-3 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
          Os campos PT e EN alimentam a experiência bilíngue do portfólio. O
          formulário não traduz nem completa campos automaticamente.
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

      <fieldset className="grid gap-5">
        <legend className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Identidade
        </legend>
        <TextField
          error={errors.name}
          fieldPrefix={fieldPrefix}
          isSubmitting={isSubmitting}
          label="Nome"
          maxLength={80}
          minLength={2}
          name="name"
          onChange={updateValue}
          value={values.name}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            error={errors.locationPt}
            fieldPrefix={fieldPrefix}
            isSubmitting={isSubmitting}
            label="Localização PT"
            maxLength={80}
            minLength={2}
            name="locationPt"
            onChange={updateValue}
            value={values.locationPt}
          />
          <TextField
            error={errors.locationEn}
            fieldPrefix={fieldPrefix}
            isSubmitting={isSubmitting}
            label="Localização EN"
            maxLength={80}
            minLength={2}
            name="locationEn"
            onChange={updateValue}
            value={values.locationEn}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Cargo
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            error={errors.rolePt}
            fieldPrefix={fieldPrefix}
            isSubmitting={isSubmitting}
            label="Cargo PT"
            maxLength={80}
            minLength={3}
            name="rolePt"
            onChange={updateValue}
            value={values.rolePt}
          />
          <TextField
            error={errors.roleEn}
            fieldPrefix={fieldPrefix}
            isSubmitting={isSubmitting}
            label="Cargo EN"
            maxLength={80}
            minLength={3}
            name="roleEn"
            onChange={updateValue}
            value={values.roleEn}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Headline
        </legend>
        <TextField
          error={errors.headlinePt}
          fieldPrefix={fieldPrefix}
          isSubmitting={isSubmitting}
          label="Headline PT"
          maxLength={180}
          minLength={10}
          name="headlinePt"
          onChange={updateValue}
          textarea
          value={values.headlinePt}
        />
        <TextField
          error={errors.headlineEn}
          fieldPrefix={fieldPrefix}
          isSubmitting={isSubmitting}
          label="Headline EN"
          maxLength={180}
          minLength={10}
          name="headlineEn"
          onChange={updateValue}
          textarea
          value={values.headlineEn}
        />
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Resumo
        </legend>
        <TextField
          error={errors.summaryPt}
          fieldPrefix={fieldPrefix}
          help="Texto principal em português usado no conteúdo público quando a API está ativa."
          isSubmitting={isSubmitting}
          label="Resumo PT"
          maxLength={800}
          minLength={20}
          name="summaryPt"
          onChange={updateValue}
          textarea
          value={values.summaryPt}
        />
        <TextField
          error={errors.summaryEn}
          fieldPrefix={fieldPrefix}
          help="Texto principal em inglês usado no conteúdo público quando a API está ativa."
          isSubmitting={isSubmitting}
          label="Resumo EN"
          maxLength={800}
          minLength={20}
          name="summaryEn"
          onChange={updateValue}
          textarea
          value={values.summaryEn}
        />
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="primary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
}
