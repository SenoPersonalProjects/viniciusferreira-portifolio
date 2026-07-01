export type AdminApiErrorCode =
  | "configuration"
  | "forbidden"
  | "http"
  | "unauthorized"
  | "unavailable";

export class AdminApiError extends Error {
  readonly code: AdminApiErrorCode;
  readonly status?: number;

  constructor(message: string, code: AdminApiErrorCode, status?: number) {
    super(message);
    this.name = "AdminApiError";
    this.code = code;
    this.status = status;
  }
}

export function getAdminApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof AdminApiError) {
    if (error.code === "unauthorized") {
      return "A API administrativa recusou a sessão. Confirme se o login ainda está ativo, se o e-mail está autorizado em ADMIN_EMAILS e se NEXT_PUBLIC_API_URL aponta para /functions/v1.";
    }

    if (error.code === "forbidden") {
      return "Usuário autenticado, mas sem permissão administrativa. Confirme o e-mail na allowlist ADMIN_EMAILS das Edge Functions.";
    }

    if (error.code === "unavailable") {
      return "API administrativa indisponível. Em produção, confirme NEXT_PUBLIC_API_URL com /functions/v1; localmente, confirme o backend ou as Edge Functions.";
    }

    return error.message;
  }

  return fallbackMessage;
}

export function getAdminApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:3333"
  );
}

function resolveAdminApiUrl(path: string) {
  const apiBaseUrl = getAdminApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return new URL(normalizedPath, apiBaseUrl).toString();
  } catch {
    throw new AdminApiError(
      "URL da API administrativa inválida.",
      "configuration",
    );
  }
}

function createAdminHeaders(
  options: RequestInit | undefined,
  accessToken: string,
) {
  const headers = new Headers(options?.headers);

  headers.set("Authorization", `Bearer ${accessToken}`);

  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function adminApiFetch<TResponse>(
  path: string,
  options: RequestInit = {},
  accessToken: string,
) {
  if (!accessToken) {
    throw new AdminApiError("Sessão administrativa ausente.", "unauthorized");
  }

  let response: Response;

  try {
    response = await fetch(resolveAdminApiUrl(path), {
      ...options,
      headers: createAdminHeaders(options, accessToken),
    });
  } catch {
    throw new AdminApiError(
      "API administrativa indisponível.",
      "unavailable",
    );
  }

  if (response.status === 401) {
    throw new AdminApiError(
      "Sessão recusada pela API administrativa.",
      "unauthorized",
      response.status,
    );
  }

  if (response.status === 403) {
    throw new AdminApiError(
      "Usuário sem permissão administrativa.",
      "forbidden",
      response.status,
    );
  }

  if (!response.ok) {
    throw new AdminApiError(
      `Falha na API administrativa: ${response.status}.`,
      "http",
      response.status,
    );
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
}
