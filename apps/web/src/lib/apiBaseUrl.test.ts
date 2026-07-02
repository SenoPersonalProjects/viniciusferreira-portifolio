import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildApiUrl,
  getApiBaseUrl,
  normalizeApiBaseUrl,
} from "@/lib/apiBaseUrl";

const supabaseOrigin = "https://xejrqipeklznjzmqnriz.supabase.co";
const supabaseFunctions = `${supabaseOrigin}/functions/v1`;

describe("apiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("adds the Edge Functions path to Supabase origins", () => {
    expect(normalizeApiBaseUrl(supabaseOrigin)).toBe(supabaseFunctions);
    expect(normalizeApiBaseUrl(`${supabaseOrigin}/`)).toBe(supabaseFunctions);
  });

  it("does not duplicate the Edge Functions path", () => {
    expect(normalizeApiBaseUrl(supabaseFunctions)).toBe(supabaseFunctions);
    expect(normalizeApiBaseUrl(`${supabaseFunctions}/`)).toBe(
      supabaseFunctions,
    );
  });

  it("keeps local and custom API hosts unchanged", () => {
    expect(normalizeApiBaseUrl("http://localhost:3333/")).toBe(
      "http://localhost:3333",
    );
    expect(normalizeApiBaseUrl("https://api.example.com/backend")).toBe(
      "https://api.example.com/backend",
    );
  });

  it("uses the fallback when the env is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");

    expect(getApiBaseUrl("http://localhost:3333")).toBe(
      "http://localhost:3333",
    );
  });

  it("builds paths without discarding /functions/v1", () => {
    expect(buildApiUrl(supabaseFunctions, "/admin/content")).toBe(
      `${supabaseFunctions}/admin/content`,
    );
  });
});
