import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/components/providers/LanguageProvider";
import {
  SiteCopyProvider,
  useSiteCopy,
} from "@/components/providers/SiteCopyProvider";
import { LANGUAGE_STORAGE_KEY } from "@/i18n/translations";

function Consumer() {
  const { resolveCopy } = useSiteCopy();

  return (
    <div data-testid="copy">
      {resolveCopy("about.titleStart", "Fallback title")}
    </div>
  );
}

function renderWithProviders() {
  return render(
    <LanguageProvider>
      <SiteCopyProvider>
        <Consumer />
      </SiteCopyProvider>
    </LanguageProvider>,
  );
}

describe("SiteCopyProvider", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("renders fallback first and then database copy as escaped text", async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt-BR");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          items: [
            {
              key: "about.titleStart",
              locale: "pt-BR",
              value: "<strong>Banco</strong>",
            },
          ],
          source: "database",
        }),
        ok: true,
        status: 200,
      })),
    );

    const { container } = renderWithProviders();

    expect(screen.getByTestId("copy").textContent).toBe("Fallback title");

    await waitFor(() => {
      expect(screen.getByTestId("copy").textContent).toBe(
        "<strong>Banco</strong>",
      );
    });
    expect(container.querySelector("strong")).toBeNull();
  });

  it("keeps fallback when the public API is unavailable", async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt-BR");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("copy").textContent).toBe("Fallback title");
    });
  });
});
