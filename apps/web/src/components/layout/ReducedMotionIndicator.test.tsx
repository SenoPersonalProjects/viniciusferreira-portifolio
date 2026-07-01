import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReducedMotionIndicator } from "@/components/layout/ReducedMotionIndicator";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { LANGUAGE_STORAGE_KEY, type Language } from "@/i18n/translations";

function mockReducedMotionPreference(matches: boolean) {
  let currentMatches = matches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    get matches() {
      return currentMatches;
    },
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(
      (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
  } as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQueryList));

  return {
    setMatches(nextMatches: boolean) {
      currentMatches = nextMatches;
      listeners.forEach((listener) => {
        listener({ matches: nextMatches } as MediaQueryListEvent);
      });
    },
  };
}

function renderIndicator(language: Language = "pt-BR") {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  return render(
    <LanguageProvider>
      <ReducedMotionIndicator />
    </LanguageProvider>,
  );
}

describe("ReducedMotionIndicator", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("does not render when reduced motion is not requested", async () => {
    mockReducedMotionPreference(false);

    renderIndicator();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Movimento reduzido ativo" }),
      ).toBeNull();
    });
  });

  it("renders an accessible tooltip when reduced motion is active", async () => {
    mockReducedMotionPreference(true);

    renderIndicator();

    const button = await screen.findByRole("button", {
      name: "Movimento reduzido ativo",
    });
    const tooltip = screen.getByRole("tooltip");

    expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(tooltip.textContent).toContain(
      "Seu sistema está pedindo menos movimento.",
    );
  });

  it("updates when the system preference changes", async () => {
    const preference = mockReducedMotionPreference(false);

    renderIndicator();

    expect(
      screen.queryByRole("button", { name: "Movimento reduzido ativo" }),
    ).toBeNull();

    preference.setMatches(true);

    expect(
      await screen.findByRole("button", {
        name: "Movimento reduzido ativo",
      }),
    ).not.toBeNull();
  });

  it("uses the English copy when the current language is English", async () => {
    mockReducedMotionPreference(true);

    renderIndicator("en");

    expect(
      await screen.findByRole("button", { name: "Reduced motion active" }),
    ).not.toBeNull();
    expect(screen.getByRole("tooltip").textContent).toContain(
      "Your system is requesting less motion.",
    );
  });
});
