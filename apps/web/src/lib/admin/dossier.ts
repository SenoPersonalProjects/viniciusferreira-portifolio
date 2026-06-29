import {
  dossierByLocale,
  type DossierContent,
  type DossierLocale,
} from "@/data/dossier";

export const DOSSIER_LOCALES = Object.keys(
  dossierByLocale,
) as DossierLocale[];

export type DossierDraft = DossierContent;

export type DossierFormValues = {
  fileId: string;
  classification: string;
  project: string;
  subject: string;
  role: string;
  status: string;
  location: string;
  stack: string;
  note: string;
  stamp: string;
  mainPhotoUrl: string;
  polaroidPhotoUrl: string;
};

export type DossierValidationErrors = Partial<
  Record<keyof DossierFormValues, string>
>;

type ValidationResult =
  | {
      errors: DossierValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: DossierDraft;
    };

type FieldRule = {
  key: keyof DossierFormValues;
  label: string;
  maxLength: number;
  minLength: number;
};

const textRules: FieldRule[] = [
  { key: "fileId", label: "o código do arquivo", maxLength: 40, minLength: 1 },
  {
    key: "classification",
    label: "a classificação",
    maxLength: 60,
    minLength: 1,
  },
  { key: "project", label: "o projeto", maxLength: 120, minLength: 1 },
  { key: "subject", label: "o assunto", maxLength: 120, minLength: 1 },
  { key: "role", label: "o cargo", maxLength: 120, minLength: 1 },
  { key: "status", label: "o status", maxLength: 60, minLength: 1 },
  { key: "location", label: "a localização", maxLength: 80, minLength: 1 },
  { key: "stack", label: "a stack", maxLength: 160, minLength: 1 },
  { key: "note", label: "a nota", maxLength: 600, minLength: 1 },
  { key: "stamp", label: "o carimbo", maxLength: 60, minLength: 1 },
];

const imagePathPattern = /^(\/|https?:\/\/)/i;

function cloneDossierContent(content: DossierContent): DossierDraft {
  return {
    ...content,
    redactions: content.redactions?.map((redaction) => ({ ...redaction })),
  };
}

function validateTextField(value: string, rule: FieldRule) {
  const normalized = value.trim();

  if (
    normalized.length < rule.minLength ||
    normalized.length > rule.maxLength
  ) {
    return {
      error: `Informe ${rule.label} com ${rule.minLength} a ${rule.maxLength} caracteres.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

function validateImagePath(value: string, label: string) {
  const normalized = value.trim();

  if (!normalized) {
    return {
      error: `Informe ${label}.`,
      value: normalized,
    };
  }

  if (normalized.length > 500 || !imagePathPattern.test(normalized)) {
    return {
      error: `${label} deve começar com /, http:// ou https://.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

export function createDossierDraft(content: DossierContent): DossierDraft {
  return cloneDossierContent(content);
}

export function getDossierFormValues(
  content: DossierContent,
): DossierFormValues {
  return {
    classification: content.classification,
    fileId: content.fileId,
    location: content.location,
    mainPhotoUrl: content.mainPhotoUrl,
    note: content.note,
    polaroidPhotoUrl: content.polaroidPhotoUrl,
    project: content.project,
    role: content.role,
    stack: content.stack,
    stamp: content.stamp,
    status: content.status,
    subject: content.subject,
  };
}

export function getInitialDossierFormValues() {
  return DOSSIER_LOCALES.reduce(
    (valuesByLocale, locale) => ({
      ...valuesByLocale,
      [locale]: getDossierFormValues(dossierByLocale[locale]),
    }),
    {} as Record<DossierLocale, DossierFormValues>,
  );
}

export function getInitialDossierPreviewDrafts() {
  return DOSSIER_LOCALES.reduce(
    (draftsByLocale, locale) => ({
      ...draftsByLocale,
      [locale]: createDossierDraft(dossierByLocale[locale]),
    }),
    {} as Record<DossierLocale, DossierDraft>,
  );
}

export function resetDossierDraft(locale: DossierLocale) {
  return {
    formValues: getDossierFormValues(dossierByLocale[locale]),
    preview: createDossierDraft(dossierByLocale[locale]),
  };
}

export function validateDossierForm(
  values: DossierFormValues,
  currentContent?: DossierContent,
): ValidationResult {
  const errors: DossierValidationErrors = {};
  const payload = {
    redactions: currentContent?.redactions?.map((redaction) => ({
      ...redaction,
    })),
  } as DossierDraft;

  for (const rule of textRules) {
    const result = validateTextField(values[rule.key], rule);

    payload[rule.key] = result.value;

    if (result.error) {
      errors[rule.key] = result.error;
    }
  }

  const mainPhotoUrl = validateImagePath(
    values.mainPhotoUrl,
    "a imagem principal",
  );
  const polaroidPhotoUrl = validateImagePath(
    values.polaroidPhotoUrl,
    "a imagem polaroid",
  );

  payload.mainPhotoUrl = mainPhotoUrl.value;
  payload.polaroidPhotoUrl = polaroidPhotoUrl.value;

  if (mainPhotoUrl.error) {
    errors.mainPhotoUrl = mainPhotoUrl.error;
  }

  if (polaroidPhotoUrl.error) {
    errors.polaroidPhotoUrl = polaroidPhotoUrl.error;
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    payload,
  };
}
