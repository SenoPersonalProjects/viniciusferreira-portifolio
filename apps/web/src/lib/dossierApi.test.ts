import { afterEach, describe, expect, it, vi } from "vitest";

import { dossierByLocale } from "@/data/dossier";
import {
  fetchPublicDossierContent,
  resolvePublicDossierContent,
} from "@/lib/dossierApi";

function createFetchMock(payload: unknown, ok = true) {
  return vi.fn(async () => ({
    json: async () => payload,
    ok,
    status: ok ? 200 : 500,
  })) as unknown as typeof fetch;
}

describe("public dossier API helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses local fallback when the public API URL is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    const fetcher = createFetchMock({
      content: null,
      source: "empty",
    });

    const result = await resolvePublicDossierContent("pt", fetcher);

    expect(result.source).toBe("fallback");
    expect(result.content).toEqual(dossierByLocale.pt);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses database content and maps stack to the public dossier shape", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_API_URL",
      "https://xejrqipeklznjzmqnriz.supabase.co",
    );
    const fetcher = createFetchMock({
      content: {
        classification: "CLASSIFIED",
        fileId: "VF-026",
        location: "BRAZIL",
        mainPhotoUrl: "/profile/detective/individual-1.jpeg",
        note: "Database note",
        polaroidPhotoUrl: "/profile/detective/individual-2.jpeg",
        project: "MANAGEABLE PORTFOLIO",
        redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
        role: "FULL STACK DEVELOPER",
        stack: ["NEXT.JS", "NESTJS", "TYPESCRIPT"],
        stamp: "CLASSIFIED",
        status: "ACTIVE",
        subject: "VINICIUS FERREIRA",
      },
      source: "database",
    });

    const result = await resolvePublicDossierContent("en", fetcher);

    expect(result.source).toBe("database");
    expect(result.content.note).toBe("Database note");
    expect(result.content.stack).toBe("NEXT.JS / NESTJS / TYPESCRIPT");
    expect(result.content.redactions?.[0]).toEqual({ h: 4, w: 3, x: 1, y: 2 });
    expect(fetcher).toHaveBeenCalledWith(
      "https://xejrqipeklznjzmqnriz.supabase.co/functions/v1/portfolio/dossier?locale=en",
      { cache: "no-store" },
    );
    expect(String(vi.mocked(fetcher).mock.calls[0]?.[0])).not.toContain(
      "/admin/",
    );
  });

  it("keeps fallback content when the public API returns empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetcher = createFetchMock({
      content: null,
      source: "empty",
    });

    const result = await resolvePublicDossierContent("pt", fetcher);

    expect(result.source).toBe("fallback");
    expect(result.content.note).toBe(dossierByLocale.pt.note);
  });

  it("keeps fallback content when the public API fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetcher = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;

    const result = await resolvePublicDossierContent("en", fetcher);

    expect(result.source).toBe("fallback");
    expect(result.content.note).toBe(dossierByLocale.en.note);
  });

  it("returns null for empty responses when fetching directly", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetcher = createFetchMock({
      content: null,
      source: "empty",
    });

    await expect(fetchPublicDossierContent("pt", fetcher)).resolves.toBeNull();
  });

  it("ignores incompatible redactions from the public API", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetcher = createFetchMock({
      content: {
        ...dossierByLocale.pt,
        redactions: { invalid: true },
        stack: ["NEXT.JS"],
      },
      source: "database",
    });

    const result = await resolvePublicDossierContent("pt", fetcher);

    expect(result.source).toBe("database");
    expect(result.content.redactions).toBeUndefined();
  });
});
