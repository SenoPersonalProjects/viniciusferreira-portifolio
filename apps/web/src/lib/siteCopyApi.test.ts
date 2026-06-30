import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildSiteCopyMap,
  fetchPublicSiteCopy,
  resolvePublicSiteCopy,
  resolveSiteCopyValue,
} from "@/lib/siteCopyApi";

function createFetchMock(payload: unknown, ok = true) {
  return vi.fn(async () => ({
    json: async () => payload,
    ok,
    status: ok ? 200 : 500,
  })) as unknown as typeof fetch;
}

describe("public site copy API helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("builds a copy map only from valid keys, matching locale and non-empty values", () => {
    const map = buildSiteCopyMap(
      [
        { key: "about.titleStart", locale: "pt-BR", value: " Código " },
        { key: "about.titleHighlight", locale: "en", value: "Context" },
        { key: "bad key", locale: "pt-BR", value: "Invalid" },
        { key: "contact.copy", locale: "pt-BR", value: "   " },
      ],
      "pt-BR",
    );

    expect(map).toEqual({
      "about.titlestart": "Código",
    });
  });

  it("resolves fallback for missing or invalid keys", () => {
    const map = {
      "about.titlestart": "Banco",
    };

    expect(resolveSiteCopyValue(map, "about.titleStart", "Fallback")).toBe(
      "Banco",
    );
    expect(resolveSiteCopyValue(map, "bad key", "Fallback")).toBe("Fallback");
    expect(resolveSiteCopyValue(map, "about.missing", "Fallback")).toBe(
      "Fallback",
    );
  });

  it("fetches public site copy without calling admin endpoints", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
    const fetcher = createFetchMock({
      items: [
        {
          key: "footer.tagline",
          locale: "pt-BR",
          value: "Texto com Acentos e <strong>HTML</strong>",
        },
      ],
      source: "database",
    });

    const map = await fetchPublicSiteCopy("pt-BR", fetcher);

    expect(map["footer.tagline"]).toBe(
      "Texto com Acentos e <strong>HTML</strong>",
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/portfolio/site-copy?locale=pt-BR",
      { cache: "no-store" },
    );
    expect(String(vi.mocked(fetcher).mock.calls[0]?.[0])).not.toContain(
      "/admin/",
    );
  });

  it("returns an empty map when the API is not configured or returns empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    const fetcher = createFetchMock({
      items: [{ key: "footer.rights", locale: "pt-BR", value: "Banco" }],
      source: "database",
    });

    await expect(fetchPublicSiteCopy("pt-BR", fetcher)).resolves.toEqual({});
    expect(fetcher).not.toHaveBeenCalled();

    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    await expect(
      fetchPublicSiteCopy(
        "pt-BR",
        createFetchMock({ items: [], source: "empty" }),
      ),
    ).resolves.toEqual({});
  });

  it("keeps fallback behavior when the public API fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetcher = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;

    await expect(resolvePublicSiteCopy("en", fetcher)).resolves.toEqual({});
  });
});
