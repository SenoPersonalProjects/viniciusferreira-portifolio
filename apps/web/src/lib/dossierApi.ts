import {
  dossierByLocale,
  type DossierContent,
  type DossierLocale,
} from "@/data/dossier";

type PublicDossierApiRedaction = {
  h: number;
  w: number;
  x: number;
  y: number;
};

type PublicDossierApiContent = {
  classification: string;
  fileId: string;
  location: string;
  mainPhotoUrl: string;
  note: string;
  polaroidPhotoUrl: string;
  project: string;
  redactions?: unknown;
  role: string;
  stack: string[];
  stamp: string;
  status: string;
  subject: string;
};

type PublicDossierApiResponse =
  | {
      content: PublicDossierApiContent;
      source: "database";
    }
  | {
      content: null;
      source: "empty";
    };

export type ResolvedDossierContent = {
  content: DossierContent;
  source: "database" | "fallback";
};

function getDossierApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

function cloneDossierContent(content: DossierContent): DossierContent {
  return {
    ...content,
    redactions: content.redactions?.map((redaction) => ({ ...redaction })),
  };
}

function isPublicDossierRedaction(
  value: unknown,
): value is PublicDossierApiRedaction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const redaction = value as Record<string, unknown>;

  return ["h", "w", "x", "y"].every(
    (key) =>
      typeof redaction[key] === "number" && Number.isFinite(redaction[key]),
  );
}

function normalizePublicRedactions(value: unknown) {
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

function mapPublicDossierContent(content: PublicDossierApiContent) {
  return {
    classification: content.classification,
    fileId: content.fileId,
    location: content.location,
    mainPhotoUrl: content.mainPhotoUrl,
    note: content.note,
    polaroidPhotoUrl: content.polaroidPhotoUrl,
    project: content.project,
    redactions: normalizePublicRedactions(content.redactions),
    role: content.role,
    stack: content.stack.map((item) => item.trim()).filter(Boolean).join(" / "),
    stamp: content.stamp,
    status: content.status,
    subject: content.subject,
  } satisfies DossierContent;
}

export function getFallbackDossierContent(locale: DossierLocale) {
  return cloneDossierContent(dossierByLocale[locale]);
}

export async function fetchPublicDossierContent(
  locale: DossierLocale,
  fetcher: typeof fetch = fetch,
): Promise<ResolvedDossierContent | null> {
  const apiBaseUrl = getDossierApiBaseUrl();

  if (!apiBaseUrl) {
    return null;
  }

  const response = await fetcher(
    `${apiBaseUrl}/portfolio/dossier?locale=${encodeURIComponent(locale)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Dossier API returned ${response.status}`);
  }

  const payload = (await response.json()) as PublicDossierApiResponse;

  if (payload.source !== "database" || !payload.content) {
    return null;
  }

  return {
    content: mapPublicDossierContent(payload.content),
    source: "database",
  };
}

export async function resolvePublicDossierContent(
  locale: DossierLocale,
  fetcher?: typeof fetch,
): Promise<ResolvedDossierContent> {
  const fallback = {
    content: getFallbackDossierContent(locale),
    source: "fallback" as const,
  };

  try {
    return (await fetchPublicDossierContent(locale, fetcher)) ?? fallback;
  } catch {
    return fallback;
  }
}
