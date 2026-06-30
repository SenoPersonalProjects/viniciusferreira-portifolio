import type { Language } from "@/i18n/translations";

export type PublicSiteCopyItem = {
  key: string;
  locale: string;
  value: string;
};

type PublicSiteCopyResponse = {
  items: PublicSiteCopyItem[];
  source: "database" | "empty";
};

export type SiteCopyMap = Record<string, string>;

const siteCopyKeyPattern = /^[a-z0-9._-]{3,120}$/;

function getSiteCopyApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export function isValidSiteCopyKey(key: string) {
  return siteCopyKeyPattern.test(normalizeSiteCopyKey(key));
}

export function normalizeSiteCopyKey(key: string) {
  return key.trim().toLowerCase();
}

export function buildSiteCopyMap(
  items: PublicSiteCopyItem[],
  locale: Language,
): SiteCopyMap {
  return items.reduce<SiteCopyMap>((copyMap, item) => {
    const key = normalizeSiteCopyKey(item.key);
    const value = item.value.trim();

    if (item.locale !== locale || !isValidSiteCopyKey(key) || !value) {
      return copyMap;
    }

    return {
      ...copyMap,
      [key]: value,
    };
  }, {});
}

export function resolveSiteCopyValue(
  copyMap: SiteCopyMap,
  key: string,
  fallback: string,
) {
  const normalizedKey = normalizeSiteCopyKey(key);

  if (!isValidSiteCopyKey(normalizedKey)) {
    return fallback;
  }

  return copyMap[normalizedKey] ?? fallback;
}

export async function fetchPublicSiteCopy(
  locale: Language,
  fetcher: typeof fetch = fetch,
): Promise<SiteCopyMap> {
  const apiBaseUrl = getSiteCopyApiBaseUrl();

  if (!apiBaseUrl) {
    return {};
  }

  const response = await fetcher(
    `${apiBaseUrl}/portfolio/site-copy?locale=${encodeURIComponent(locale)}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Site Copy API returned ${response.status}`);
  }

  const payload = (await response.json()) as PublicSiteCopyResponse;

  if (payload.source !== "database" || !Array.isArray(payload.items)) {
    return {};
  }

  return buildSiteCopyMap(payload.items, locale);
}

export async function resolvePublicSiteCopy(
  locale: Language,
  fetcher?: typeof fetch,
) {
  try {
    return await fetchPublicSiteCopy(locale, fetcher);
  } catch {
    return {};
  }
}
