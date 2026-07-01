import { HttpError } from "./http.ts";

const allowedDossierLocales = ["pt", "en"] as const;
const imagePathPattern = /^(\/|https?:\/\/)/i;

type DossierLocale = (typeof allowedDossierLocales)[number];

type NormalizedDossierContentInput = {
  locale: DossierLocale;
  fileId: string;
  classification: string;
  project: string;
  subject: string;
  role: string;
  status: string;
  location: string;
  stack: string[];
  note: string;
  stamp: string;
  mainPhotoUrl: string;
  polaroidPhotoUrl: string;
  redactions?: unknown;
};

type TextRule = {
  key:
    | "classification"
    | "fileId"
    | "location"
    | "project"
    | "role"
    | "stamp"
    | "status"
    | "subject";
  label: string;
  maxLength: number;
};

const textRules: TextRule[] = [
  { key: "fileId", label: "fileId", maxLength: 40 },
  { key: "classification", label: "classification", maxLength: 60 },
  { key: "project", label: "project", maxLength: 120 },
  { key: "subject", label: "subject", maxLength: 120 },
  { key: "role", label: "role", maxLength: 120 },
  { key: "status", label: "status", maxLength: 60 },
  { key: "location", label: "location", maxLength: 80 },
  { key: "stamp", label: "stamp", maxLength: 60 },
];

function assertValidLocale(locale: string): asserts locale is DossierLocale {
  if (!allowedDossierLocales.includes(locale as DossierLocale)) {
    throw new HttpError(400, "Locale do dossie invalido");
  }
}

function normalizeRequiredText(
  body: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number,
) {
  const value = body[key];

  if (typeof value !== "string") {
    throw new HttpError(400, `${label} deve ser texto`);
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    throw new HttpError(
      400,
      `${label} deve ter 1 a ${maxLength} caracteres`,
    );
  }

  return normalized;
}

function normalizeNote(body: Record<string, unknown>) {
  const value = body.note;

  if (typeof value !== "string") {
    throw new HttpError(400, "note deve ser texto");
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > 2000) {
    throw new HttpError(400, "note deve ter 1 a 2000 caracteres");
  }

  return normalized;
}

function normalizeImagePath(body: Record<string, unknown>, key: string) {
  const value = normalizeRequiredText(body, key, key, 500);

  if (!imagePathPattern.test(value)) {
    throw new HttpError(400, `${key} deve comecar com /, http:// ou https://`);
  }

  return value;
}

function normalizeStack(body: Record<string, unknown>) {
  const value = body.stack;

  if (!Array.isArray(value)) {
    throw new HttpError(400, "stack deve ser uma lista de textos");
  }

  const items = Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );

  if (items.length === 0 || items.length > 30) {
    throw new HttpError(400, "stack deve ter 1 a 30 itens");
  }

  if (items.some((item) => item.length > 40)) {
    throw new HttpError(
      400,
      "cada item da stack deve ter ate 40 caracteres",
    );
  }

  return items;
}

function isJsonCompatible(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return Number.isFinite(value) || typeof value !== "number";
  }

  if (Array.isArray(value)) {
    return value.every(isJsonCompatible);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(
      isJsonCompatible,
    );
  }

  return false;
}

function normalizeRedactions(body: Record<string, unknown>) {
  if (!Object.prototype.hasOwnProperty.call(body, "redactions")) {
    return undefined;
  }

  const redactions = body.redactions;

  if (!isJsonCompatible(redactions)) {
    throw new HttpError(400, "redactions deve ser JSON valido");
  }

  return redactions ?? null;
}

export function normalizeDossierContentInput(
  localeParam: string,
  body: Record<string, unknown>,
): NormalizedDossierContentInput {
  const locale = localeParam.trim();
  assertValidLocale(locale);

  const payload = textRules.reduce(
    (normalized, rule) => ({
      ...normalized,
      [rule.key]: normalizeRequiredText(
        body,
        rule.key,
        rule.label,
        rule.maxLength,
      ),
    }),
    {} as Pick<NormalizedDossierContentInput, TextRule["key"]>,
  );

  return {
    ...payload,
    locale,
    mainPhotoUrl: normalizeImagePath(body, "mainPhotoUrl"),
    note: normalizeNote(body),
    polaroidPhotoUrl: normalizeImagePath(body, "polaroidPhotoUrl"),
    redactions: normalizeRedactions(body),
    stack: normalizeStack(body),
  };
}

type PublicDossierRedaction = {
  h: number;
  w: number;
  x: number;
  y: number;
};

function isPublicDossierRedaction(
  value: unknown,
): value is PublicDossierRedaction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const redaction = value as Record<string, unknown>;

  return ["h", "w", "x", "y"].every(
    (key) =>
      typeof redaction[key] === "number" && Number.isFinite(redaction[key]),
  );
}

function getPublicRedactions(value: unknown) {
  if (!Array.isArray(value) || !value.every(isPublicDossierRedaction)) {
    return undefined;
  }

  return value.map((redaction) => ({
    h: redaction.h,
    w: redaction.w,
    x: redaction.x,
    y: redaction.y,
  }));
}

export function mapPublicDossier(dossier: Record<string, unknown>) {
  const redactions = getPublicRedactions(dossier.redactions);

  return {
    classification: dossier.classification,
    fileId: dossier.fileId,
    location: dossier.location,
    mainPhotoUrl: dossier.mainPhotoUrl,
    note: dossier.note,
    polaroidPhotoUrl: dossier.polaroidPhotoUrl,
    project: dossier.project,
    ...(redactions ? { redactions } : {}),
    role: dossier.role,
    stack: dossier.stack,
    stamp: dossier.stamp,
    status: dossier.status,
    subject: dossier.subject,
  };
}
