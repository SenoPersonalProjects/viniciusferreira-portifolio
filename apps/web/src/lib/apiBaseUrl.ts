const SUPABASE_HOST_SUFFIX = ".supabase.co";
const SUPABASE_FUNCTIONS_PATH = "/functions/v1";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function normalizeApiBaseUrl(apiBaseUrl: string | null | undefined) {
  const rawBaseUrl = apiBaseUrl?.trim() ?? "";

  if (!rawBaseUrl) {
    return "";
  }

  const baseUrl = trimTrailingSlash(rawBaseUrl);

  try {
    const url = new URL(baseUrl);
    const pathname = trimTrailingSlash(url.pathname);
    const isSupabaseApi = url.hostname.endsWith(SUPABASE_HOST_SUFFIX);

    if (isSupabaseApi && (!pathname || pathname === "/")) {
      url.pathname = SUPABASE_FUNCTIONS_PATH;
      url.search = "";
      url.hash = "";

      return trimTrailingSlash(url.toString());
    }

    if (isSupabaseApi && pathname === SUPABASE_FUNCTIONS_PATH) {
      url.pathname = SUPABASE_FUNCTIONS_PATH;
      url.search = "";
      url.hash = "";

      return trimTrailingSlash(url.toString());
    }

    return baseUrl;
  } catch {
    return baseUrl;
  }
}

export function getApiBaseUrl(fallback = "") {
  return (
    normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeApiBaseUrl(fallback)
  );
}

export function buildApiUrl(apiBaseUrl: string, path: string) {
  const baseUrl = normalizeApiBaseUrl(apiBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}
