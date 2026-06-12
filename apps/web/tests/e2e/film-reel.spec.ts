import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe.configure({ timeout: 120_000 });

function isIgnorableBrowserIssue(message: string) {
  return (
    message.includes("GL Driver Message") ||
    message.includes("ReadPixels") ||
    message.includes("GPU stall due to ReadPixels") ||
    message.includes("No available adapters")
  );
}

function createBrowserIssueTracker(page: Page) {
  const issues: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") {
      return;
    }

    const text = message.text();

    if (isIgnorableBrowserIssue(text)) {
      return;
    }

    issues.push(`${message.type()}: ${text}`);
  });

  page.on("pageerror", (error) => {
    if (isIgnorableBrowserIssue(error.message)) {
      return;
    }

    issues.push(`pageerror: ${error.message}`);
  });

  return issues;
}

async function trackTransform(track: Locator) {
  return track.evaluate((element) => window.getComputedStyle(element).transform);
}

async function expectTrackToMove(track: Locator, previousTransform: string) {
  await expect
    .poll(() => trackTransform(track), { timeout: 8_000 })
    .not.toBe(previousTransform);
}

async function waitForDossierInteractive(dossier: Locator) {
  await expect
    .poll(() => dossier.getAttribute("data-interactive"), { timeout: 8_000 })
    .toBe("true");
}

async function waitForHeroActive(dossier: Locator) {
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 8_000 })
    .toBe("true");
}

async function waitForRendererMode(dossier: Locator) {
  await expect
    .poll(() => dossier.getAttribute("data-renderer-mode"), { timeout: 15_000 })
    .toMatch(/^(webgpu|webgl-legacy)$/);

  return dossier.getAttribute("data-renderer-mode");
}

async function readNumericData(dossier: Locator, attribute: string) {
  const value = await dossier.getAttribute(attribute);

  return Number(value ?? 0);
}

async function movePointerAcrossDossier(page: Page, dossier: Locator) {
  const dossierBox = await dossier.boundingBox();

  expect(dossierBox).not.toBeNull();

  await page.mouse.move(
    dossierBox!.x + dossierBox!.width * 0.82,
    dossierBox!.y + dossierBox!.height * 0.42,
    { steps: 8 },
  );
}

async function openHome(page: Page, language = "pt-BR") {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("portfolio-language", selectedLanguage);
  }, language);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Projetos em destaque" }).scrollIntoViewIfNeeded();
}

async function openHero(page: Page, language = "pt-BR", path = "/") {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("portfolio-language", selectedLanguage);
  }, language);

  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-experience", "vintage");
  await expect(page.getByTestId("dossier-hero-canvas")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByTestId("dossier-hero-canvas").locator("canvas")).toBeVisible({
    timeout: 10_000,
  });
}

test("hero 3d dossier loads and toggles with keyboard without console errors", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await openHero(page);

  const dossier = page.getByTestId("dossier-hero-canvas");
  const canvas = dossier.locator("canvas");
  const toggle = page.getByTestId("dossier-toggle");

  await expect(dossier).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(dossier).toHaveAttribute("data-open", "false");
  await expect(dossier).toHaveAttribute("data-experience", "vintage");
  await waitForHeroActive(dossier);
  const rendererMode = await waitForRendererMode(dossier);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await waitForDossierInteractive(dossier);
  await expect(dossier).toHaveAttribute("data-interactive", "true");

  if (rendererMode === "webgl-legacy") {
    const fallbackNotice = page.getByTestId("dossier-renderer-fallback-notice");
    const fallbackTrigger = page.getByTestId("dossier-renderer-fallback-trigger");

    await expect(fallbackNotice).toBeVisible();
    await fallbackTrigger.hover();
    await expect(page.getByTestId("dossier-renderer-fallback-message")).toContainText(
      "Modo de compatibilidade 3D",
    );
    await fallbackTrigger.click();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("dossier-renderer-fallback-message")).toHaveCount(0);
  } else {
    await expect(page.getByTestId("dossier-renderer-fallback-notice")).toHaveCount(0);
  }

  const dossierBox = await dossier.boundingBox();

  expect(dossierBox).not.toBeNull();
  expect(dossierBox!.width).toBeGreaterThan(900);
  expect(dossierBox!.height).toBeGreaterThan(480);

  await movePointerAcrossDossier(page, dossier);
  await expect(dossier).toHaveAttribute("data-pointer-active", "true");
  await expect(dossier).toHaveAttribute("data-pointer-inside", "true");
  await expect(dossier).toHaveAttribute("data-hover-active", "true");
  await expect(dossier).toHaveAttribute("data-hover-blockers", "none");
  await expect
    .poll(() => readNumericData(dossier, "data-pointer-x"), { timeout: 2_000 })
    .toBeGreaterThan(0.5);
  await expect
    .poll(() => readNumericData(dossier, "data-camera-z-delta"), {
      timeout: 3_000,
    })
    .toBeGreaterThan(0.35);
  await expect(dossier).toHaveAttribute("data-hover-source", "camera");
  await expect
    .poll(async () => Math.abs(await readNumericData(dossier, "data-model-rotation-y")), {
      timeout: 3_000,
    })
    .toBeLessThan(0.006);

  const closedCameraDelta = await readNumericData(dossier, "data-camera-z-delta");

  await page.mouse.move(5, 5);
  await expect
    .poll(() => dossier.getAttribute("data-pointer-active"), { timeout: 2_000 })
    .toBe("false");
  await expect(dossier).toHaveAttribute("data-pointer-inside", "false");
  await expect
    .poll(async () => Math.abs(await readNumericData(dossier, "data-camera-z-delta")), {
      timeout: 3_000,
    })
    .toBeLessThan(0.04);

  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(dossier).toHaveAttribute("data-open", "true");

  await movePointerAcrossDossier(page, dossier);
  await expect
    .poll(() => readNumericData(dossier, "data-camera-z-delta"), {
      timeout: 3_000,
    })
    .toBeGreaterThan(Math.max(0.7, closedCameraDelta + 0.15));
  await expect
    .poll(async () => Math.abs(await readNumericData(dossier, "data-model-rotation-y")), {
      timeout: 3_000,
    })
    .toBeLessThan(0.006);

  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(dossier).toHaveAttribute("data-open", "false");

  await page.getByTestId("experience-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-experience", "modern");
  await expect(dossier).toHaveAttribute("data-experience", "modern");
  await page.getByTestId("color-mode-toggle").click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-color-mode-preference",
    "light",
  );
  await page.getByTestId("language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByTestId("dossier-hero-canvas")).toBeVisible();

  expect(browserIssues).toEqual([]);
});

test("hero 3d dossier exposes camera hover diagnostics on demand", async ({
  page,
}) => {
  await openHero(page, "pt-BR", "/?debugDossier=1");

  const dossier = page.getByTestId("dossier-hero-canvas");
  const debugOverlay = page.getByTestId("dossier-hover-debug");

  await waitForHeroActive(dossier);
  await waitForDossierInteractive(dossier);
  await movePointerAcrossDossier(page, dossier);

  await expect(debugOverlay).toBeVisible();
  await expect(debugOverlay).toContainText("renderer:");
  await expect(debugOverlay).toContainText("source: camera");
  await expect(debugOverlay).toContainText("hover: true");
  await expect(debugOverlay).toContainText("blockers: none");
  await expect
    .poll(() => readNumericData(dossier, "data-camera-z-delta"), {
      timeout: 3_000,
    })
    .toBeGreaterThan(0.35);
});

test("hero 3d dossier keeps interactivity blocked during the first intro", async ({
  page,
}) => {
  await openHero(page);
  const dossier = page.getByTestId("dossier-hero-canvas");

  await expect(dossier).toBeVisible();
  await waitForHeroActive(dossier);
  await waitForRendererMode(dossier);
  await movePointerAcrossDossier(page, dossier);
  await expect(dossier).toHaveAttribute("data-pointer-inside", "true");
  await expect(dossier).toHaveAttribute("data-hover-active", "true");
  await expect(dossier).toHaveAttribute("data-hover-blockers", "none");
  await waitForDossierInteractive(dossier);
  await expect(dossier).toHaveAttribute("data-intro-state", "done");
  await expect
    .poll(() => readNumericData(dossier, "data-intro-duration-ms"), {
      timeout: 2_000,
    })
    .toBeGreaterThan(1_600);
});

test("hero 3d dossier preserves open state while leaving and re-entering the hero", async ({
  page,
}) => {
  await openHero(page);

  const dossier = page.getByTestId("dossier-hero-canvas");
  const toggle = page.getByTestId("dossier-toggle");

  await waitForHeroActive(dossier);
  await waitForDossierInteractive(dossier);
  await toggle.press("Enter");
  await expect(dossier).toHaveAttribute("data-open", "true");

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 5_000 })
    .toBe("false");

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 5_000 })
    .toBe("true");
  await waitForDossierInteractive(dossier);
  await expect(dossier).toHaveAttribute("data-open", "true");

  await toggle.press("Space");
  await expect(dossier).toHaveAttribute("data-open", "false");

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 5_000 })
    .toBe("false");

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 5_000 })
    .toBe("true");
  await waitForDossierInteractive(dossier);
  await expect(dossier).toHaveAttribute("data-open", "false");
});

test("hero 3d dossier skips intro but keeps pointer hover in reduced motion", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHero(page);

  const dossier = page.getByTestId("dossier-hero-canvas");
  const toggle = page.getByTestId("dossier-toggle");

  await page.waitForTimeout(500);
  await waitForHeroActive(dossier);
  await waitForRendererMode(dossier);
  await expect(dossier).toHaveAttribute("data-interactive", "true");
  await expect(dossier).toHaveAttribute("data-intro-state", "reduced");
  await expect(dossier).toHaveAttribute("data-reduced-motion", "true");

  await movePointerAcrossDossier(page, dossier);
  await expect(dossier).toHaveAttribute("data-pointer-active", "true");
  await expect(dossier).toHaveAttribute("data-pointer-inside", "true");
  await expect(dossier).toHaveAttribute("data-hover-active", "true");
  await expect(dossier).toHaveAttribute("data-hover-blockers", "none");
  await expect(dossier).toHaveAttribute("data-hover-source", "camera");
  await expect
    .poll(() => readNumericData(dossier, "data-camera-z-delta"), {
      timeout: 3_000,
    })
    .toBeGreaterThan(0.35);

  await toggle.press("Enter");
  await expect(dossier).toHaveAttribute("data-open", "true");

  await toggle.press("Space");
  await expect(dossier).toHaveAttribute("data-open", "false");

  expect(browserIssues).toEqual([]);
});

test("film reel supports looped buttons, wheel, drag, CRT preview effects, and theme toggles", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await openHome(page);

  const root = page.locator("html");
  const reel = page.locator(".film-reel");
  const track = page.locator(".film-reel-track");
  const slides = page.locator(".film-reel-slide");

  await expect(reel).toBeVisible();
  await expect(root).toHaveAttribute("lang", "pt-BR");
  await expect(root).toHaveAttribute("data-language", "pt-BR");
  await expect(slides).toHaveCount(28);
  await expect(page.locator(".vintage-grain")).toHaveCSS("display", "none");
  await expect(page.locator(".film-preview-effects")).toHaveCount(0);
  await expect(page.locator(".film-preview-noise")).toHaveCount(0);
  await expect(page.locator(".film-preview-scanlines")).toHaveCount(0);
  await expect(page.locator(".film-preview-curvature")).toHaveCount(0);

  const reelBox = await reel.boundingBox();
  const trackBox = await track.boundingBox();

  expect(reelBox).not.toBeNull();
  expect(trackBox).not.toBeNull();
  expect(trackBox!.width).toBeGreaterThan(reelBox!.width * 3);

  let before = await trackTransform(track);
  await page.getByRole("button", { exact: true, name: "Próximo" }).click();
  await expectTrackToMove(track, before);

  before = await trackTransform(track);
  await page.getByRole("button", { exact: true, name: "Anterior" }).click();
  await expectTrackToMove(track, before);

  before = await trackTransform(track);
  await reel.hover();
  await page.mouse.wheel(0, 700);
  await expectTrackToMove(track, before);

  before = await trackTransform(track);
  const dragBox = await reel.boundingBox();
  expect(dragBox).not.toBeNull();

  const dragY = dragBox!.y + dragBox!.height / 2;
  const dragStartX = dragBox!.x + dragBox!.width * 0.65;

  await page.mouse.move(dragStartX, dragY);
  await page.mouse.down();
  await page.mouse.move(dragStartX - 260, dragY, { steps: 12 });
  await page.mouse.up();
  await expectTrackToMove(track, before);

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole("button", { exact: true, name: "Próximo" }).click();
  }

  for (let index = 0; index < 6; index += 1) {
    await page.getByRole("button", { exact: true, name: "Anterior" }).click();
  }

  await expect(reel).toBeVisible();
  await reel.scrollIntoViewIfNeeded();

  const hoverBox = await reel.boundingBox();
  expect(hoverBox).not.toBeNull();

  await page.mouse.move(hoverBox!.x + hoverBox!.width / 2, hoverBox!.y + 120);
  await expect(page.locator(".film-preview-effects")).toHaveCount(1);
  await expect(page.locator(".film-preview-noise")).toHaveCount(1);
  await expect(page.locator(".film-preview-scanlines")).toHaveCount(1);
  await expect(page.locator(".film-preview-curvature")).toHaveCount(1);
  await expect(page.locator(".film-preview-flicker")).toHaveCount(1);

  const effectsPlacement = await page
    .locator(".film-preview-effects")
    .evaluate((effects) => ({
      insideImageWrap: Boolean(effects.closest(".film-image-wrap")),
      parentClassName: effects.parentElement?.className,
    }));

  expect(effectsPlacement.insideImageWrap).toBe(true);
  expect(String(effectsPlacement.parentClassName)).toContain("film-image-wrap");
  await expect(page.locator(".film-frame > .film-preview-effects")).toHaveCount(0);
  await expect(page.locator(".film-reel-track > .film-preview-effects")).toHaveCount(0);

  await page.mouse.move(10, 10);
  await expect(page.locator(".film-preview-effects")).toHaveCount(0);
  await expect(page.locator(".film-preview-noise")).toHaveCount(0);

  await expect(root).toHaveAttribute("data-experience", "vintage");
  await page.getByTestId("experience-toggle").click();
  await expect(root).toHaveAttribute("data-experience", "modern");
  await page.getByTestId("experience-toggle").click();
  await expect(root).toHaveAttribute("data-experience", "vintage");

  const colorModeButton = page.getByTestId("color-mode-toggle");

  await expect(root).toHaveAttribute("data-color-mode-preference", "system");
  await colorModeButton.click();
  await expect(root).toHaveAttribute("data-color-mode-preference", "light");
  await expect(root).toHaveAttribute("data-color-mode", "light");
  await colorModeButton.click();
  await expect(root).toHaveAttribute("data-color-mode-preference", "dark");
  await expect(root).toHaveAttribute("data-color-mode", "dark");

  const languageButton = page.getByTestId("language-toggle");

  await languageButton.click();
  await expect(root).toHaveAttribute("lang", "en");
  await expect(root).toHaveAttribute("data-language", "en");
  await expect(page.getByRole("heading", { name: "Featured projects" })).toBeVisible();
  await languageButton.click();
  await expect(root).toHaveAttribute("lang", "pt-BR");
  await expect(page.getByRole("heading", { name: "Projetos em destaque" })).toBeVisible();

  expect(browserIssues).toEqual([]);
});

test.describe("language detection", () => {
  test.use({ locale: "en-US" });

  test("uses the browser language by default when there is no saved choice", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const root = page.locator("html");

    await expect(root).toHaveAttribute("lang", "en");
    await expect(root).toHaveAttribute("data-language", "en");
    await expect(
      page.getByRole("heading", { name: "Featured projects" }),
    ).toBeVisible();

    await page.getByTestId("language-toggle").click();
    await expect(root).toHaveAttribute("lang", "pt-BR");
    await expect(
      page.getByRole("heading", { name: "Projetos em destaque" }),
    ).toBeVisible();
  });
});

test("home and projects sections have no automated WCAG A/AA axe violations", async ({ page }) => {
  await openHome(page);

  const results = await new AxeBuilder({ page })
    .include("#home")
    .include("#projects")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
