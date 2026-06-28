import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";

describe("adminApiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends the bearer token without exposing it outside the request header", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3333");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      adminApiFetch("/admin/content", undefined, "secret-token"),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/admin/content",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    expect(
      (fetchMock.mock.calls[0][1]?.headers as Headers).get("Authorization"),
    ).toBe("Bearer secret-token");
  });

  it("maps 401 and 403 responses to typed admin errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    await expect(adminApiFetch("/admin/content", {}, "token")).rejects.toMatchObject({
      code: "unauthorized",
      status: 401,
    } satisfies Partial<AdminApiError>);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 403 })),
    );

    await expect(adminApiFetch("/admin/content", {}, "token")).rejects.toMatchObject({
      code: "forbidden",
      status: 403,
    } satisfies Partial<AdminApiError>);
  });

  it("requires an access token before calling the API", async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    await expect(adminApiFetch("/admin/content", {}, "")).rejects.toMatchObject({
      code: "unauthorized",
    } satisfies Partial<AdminApiError>);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
