import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FilmFrame } from "@/components/projects/FilmFrame";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { projects } from "@/data/projects";

const crtEffectSelectors = [
  ".film-preview-noise",
  ".film-preview-scanlines",
  ".film-preview-curvature",
  ".film-preview-flicker",
];

describe("FilmFrame", () => {
  beforeEach(() => {
    const canvasContext = {
      clearRect: vi.fn(),
      createImageData: vi.fn((width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      })),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      imageSmoothingEnabled: false,
      putImageData: vi.fn(),
      setTransform: vi.fn(),
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      canvasContext as unknown as CanvasRenderingContext2D,
    );

    vi.stubGlobal("matchMedia", () => ({
      addEventListener: vi.fn(),
      matches: true,
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function renderFilmFrame() {
    return render(
      <LanguageProvider>
        <FilmFrame project={projects[0]} index={0} />
      </LanguageProvider>,
    );
  }

  it("renders CRT preview effects only while the frame is hovered", async () => {
    const user = userEvent.setup();
    const { container } = renderFilmFrame();
    const frame = screen.getByRole("article");

    for (const selector of crtEffectSelectors) {
      expect(container.querySelector(selector)).toBeNull();
    }

    await user.hover(frame);

    const imageWrap = container.querySelector(".film-image-wrap");

    for (const selector of crtEffectSelectors) {
      const effect = container.querySelector(selector);

      expect(effect).not.toBeNull();
      expect(imageWrap?.contains(effect)).toBe(true);
    }

    await user.unhover(frame);

    for (const selector of crtEffectSelectors) {
      expect(container.querySelector(selector)).toBeNull();
    }
  });

  it("renders CRT preview effects while the frame has keyboard focus", async () => {
    const user = userEvent.setup();
    const { container } = renderFilmFrame();

    await user.tab();

    const imageWrap = container.querySelector(".film-image-wrap");

    for (const selector of crtEffectSelectors) {
      const effect = container.querySelector(selector);

      expect(effect).not.toBeNull();
      expect(imageWrap?.contains(effect)).toBe(true);
    }
  });
});
