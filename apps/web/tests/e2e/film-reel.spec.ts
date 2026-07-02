import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe.configure({ mode: "serial", timeout: 180_000 });

function isIgnorableBrowserIssue(message: string) {
  return (
    message.includes("GL Driver Message") ||
    message.includes("ReadPixels") ||
    message.includes("GPU stall due to ReadPixels") ||
    message.includes("No available adapters") ||
    message.includes("Please add the `loading=\"eager\"` property if this image is above the fold")
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
    .poll(() => trackTransform(track), { timeout: 15_000 })
    .not.toBe(previousTransform);
}

async function waitForDossierInteractive(dossier: Locator) {
  await expect
    .poll(() => dossier.getAttribute("data-interactive"), { timeout: 30_000 })
    .toBe("true");
}

async function waitForHeroActive(dossier: Locator) {
  await expect
    .poll(() => dossier.getAttribute("data-hero-active"), { timeout: 15_000 })
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

async function expectReceiverDelta(
  target: Locator,
  attribute: string,
  expected: number,
  timeout = 8_000,
) {
  await expect
    .poll(
      async () => Math.abs((await readNumericData(target, attribute)) - expected),
      { timeout },
    )
    .toBeLessThan(0.005);
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
    if (window.sessionStorage.getItem("calibration-test-cleared")) {
      return;
    }

    window.localStorage.clear();
    window.sessionStorage.setItem("calibration-test-cleared", "true");
  });

  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("portfolio-language", selectedLanguage);

    const applyAttribute = () => {
      document.documentElement?.setAttribute("data-experience", "vintage");
    };

    applyAttribute();
    document.addEventListener("DOMContentLoaded", applyAttribute, {
      once: true,
    });
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

    const applyAttribute = () => {
      document.documentElement?.setAttribute("data-experience", "vintage");
    };

    applyAttribute();
    document.addEventListener("DOMContentLoaded", applyAttribute, {
      once: true,
    });
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
  await expect(dossier).toHaveAttribute("data-visual-treatment", "vintage-noir");
  await expect(dossier).toHaveAttribute("data-monochrome-canvas", "true");
  await expect(dossier.locator(".vintage-3d-grain")).toHaveCount(1);
  await expect(dossier.locator(".vintage-3d-noise")).toHaveCount(1);
  await expect
    .poll(() => dossier.getAttribute("data-desk-loaded"), { timeout: 30_000 })
    .toBe("true");
  await expect(dossier).toHaveAttribute("data-desk-source", "glb");
  await expect(dossier).toHaveAttribute("data-desk-model-loaded", "true");
  await expect(dossier).toHaveAttribute("data-desk-pivot-mode", "tabletop-center");
  await expect(dossier).toHaveAttribute("data-desk-pivot-ready", "true");

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

  await page.mouse.wheel(0, Math.ceil(dossierBox!.height + 160));
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

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await waitForHeroActive(dossier);
  await waitForDossierInteractive(dossier);

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

  await expect(page.locator("html")).toHaveAttribute("data-experience", "vintage");
  await expect(dossier).toHaveAttribute("data-experience", "vintage");
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

test("hero 3d dossier starts at the final hero pose without initial table intro", async ({
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
    .toBeLessThan(250);
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
  await waitForHeroActive(dossier);
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
  await waitForHeroActive(dossier);
  await waitForDossierInteractive(dossier);
  await expect(dossier).toHaveAttribute("data-open", "false");
});

test("hero 3d dossier skips intro and keeps reduced hover in reduced motion", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHero(page);

  const reducedMotionIndicator = page.getByRole("button", {
    name: "Movimento reduzido ativo",
  });

  await expect(reducedMotionIndicator).toBeVisible();
  await reducedMotionIndicator.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "Seu sistema está pedindo menos movimento",
  );

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
  await expect(dossier).toHaveAttribute("data-motion-scale", "0.32");
  await expect
    .poll(async () => Math.abs(await readNumericData(dossier, "data-camera-z-delta")), {
      timeout: 8_000,
    })
    .toBeGreaterThan(0.12);
  await expect
    .poll(async () => Math.abs(await readNumericData(dossier, "data-camera-z-delta")), {
      timeout: 8_000,
    })
    .toBeLessThan(0.35);

  await toggle.click({ force: true });
  await expect(dossier).toHaveAttribute("data-open", "true");

  await toggle.click({ force: true });
  await expect(dossier).toHaveAttribute("data-open", "false");

  await page.waitForLoadState("load");
  await page.waitForSelector("#contact", { state: "attached" });
  await page.evaluate(() => {
    document.getElementById("contact")?.scrollIntoView({ block: "center" });
  });

  const phoneProp = page.getByTestId("rotary-telephone-3d");

  await expect(phoneProp.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => phoneProp.getAttribute("data-receiver-found"), { timeout: 30_000 })
    .toBe("true");
  await expect(phoneProp).toHaveAttribute("data-receiver-rest-applied", "true");
  await expect(phoneProp).toHaveAttribute("data-receiver-state", "rest");

  const reducedPhoneCanvas = phoneProp.locator("canvas");
  const reducedPhoneCanvasBox = await reducedPhoneCanvas.boundingBox();
  const reducedPhoneHoverTargets = [
    [0.78, 0.48],
    [0.7, 0.48],
    [0.62, 0.52],
    [0.82, 0.56],
    [0.5, 0.5],
  ];
  let reducedPhoneHoverAttempt = 0;

  expect(reducedPhoneCanvasBox).not.toBeNull();
  await expect(phoneProp).toHaveAttribute("data-motion-scale", "0.32");
  await expect
    .poll(
      async () => {
        const phoneBox = await reducedPhoneCanvas.boundingBox();
        const [xRatio, yRatio] =
          reducedPhoneHoverTargets[
            reducedPhoneHoverAttempt % reducedPhoneHoverTargets.length
          ];

        reducedPhoneHoverAttempt += 1;

        if (!phoneBox) {
          return 0;
        }

        await page.mouse.move(
          phoneBox.x + phoneBox.width * xRatio,
          phoneBox.y + phoneBox.height * yRatio,
          { steps: 6 },
        );
        await page.waitForTimeout(120);

        return Math.abs(await readNumericData(phoneProp, "data-receiver-x-delta"));
      },
      { timeout: 6_000 },
    )
    .toBeGreaterThan(0.005);
  await expect
    .poll(
      async () => Math.abs(await readNumericData(phoneProp, "data-receiver-x-delta")),
      { timeout: 4_000 },
    )
    .toBeLessThan(0.04);

  expect(browserIssues).toEqual([]);
});

// The calibration UI is now behind /admin/calibration. Public access is covered
// by admin-auth.spec.ts, and authenticated calibration coverage will return
// when the admin test harness can provide a real Supabase session.
test.skip("3d calibration interface exposes adjustable desk, dossier and phone snippets", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await page.goto("/interface", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("calibration-interface")).toBeVisible();
  await expect(page.getByTestId("desk-calibration-canvas")).toBeVisible();
  await expect(page.getByTestId("dossier-calibration-canvas")).toBeVisible();
  await expect(page.getByTestId("phone-calibration-canvas")).toBeVisible();
  await expect(page.getByTestId("desk-calibration-canvas").locator("canvas")).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByTestId("dossier-calibration-canvas").locator("canvas"),
  ).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("phone-calibration-canvas").locator("canvas")).toBeVisible({
    timeout: 15_000,
  });
  const dossierCalibrationCanvas = page.getByTestId("dossier-calibration-canvas");
  const phoneCalibrationCanvas = page.getByTestId("phone-calibration-canvas");
  await expect(page.getByTestId("desk-calibration-canvas")).toHaveAttribute(
    "data-camera-reference",
    "home-hero",
  );
  await expect(page.getByTestId("desk-calibration-canvas")).toHaveAttribute(
    "data-desk-pivot-mode",
    "tabletop-center",
  );
  await expect
    .poll(
      () => page.getByTestId("desk-calibration-canvas").getAttribute(
        "data-reference-dossier",
      ),
      { timeout: 15_000 },
    )
    .toBe("detective-dossier-glb");
  await expect
    .poll(
      () => page.getByTestId("desk-calibration-canvas").getAttribute(
        "data-desk-pivot-ready",
      ),
      { timeout: 15_000 },
    )
    .toBe("true");
  await expect(dossierCalibrationCanvas).toHaveAttribute(
    "data-camera-reference",
    "home-hero",
  );
  await expect(dossierCalibrationCanvas).toHaveAttribute(
    "data-preview-lighting",
    "true",
  );

  const deskOutput = page.getByTestId("desk-output");
  const dossierOutput = page.getByTestId("dossier-output");
  const phoneOutput = page.getByTestId("phone-output");

  await expect(deskOutput).toContainText("position: [");
  await expect(deskOutput).toContainText("rotation: [");
  await expect(dossierOutput).toContainText("position: [");
  await expect(phoneOutput).toContainText("model:");
  await expect(phoneOutput).toContainText("receiver:");

  await page.getByTestId("desk-position-x-input").fill("1.23");
  await expect(deskOutput).toContainText("position: [1.23");
  await page.getByTestId("dossier-table-position-x-input").fill("0.77");
  await expect(dossierOutput).toContainText("position: [0.77");
  await page.getByTestId("dossier-preview-lighting-input").uncheck();
  await expect(page.getByTestId("dossier-preview-lighting-input")).not.toBeChecked();
  await expect(dossierCalibrationCanvas).toHaveAttribute("data-preview-lighting", "false");
  await page.getByTestId("dossier-preview-lighting-input").check();
  await expect(dossierCalibrationCanvas).toHaveAttribute("data-preview-lighting", "true");

  await page.getByTestId("phone-model-position-x-input").fill("-0.44");
  await page.getByTestId("phone-model-fit-size-input").fill("3.9");
  await expect(phoneOutput).toContainText("fitSize: 3.9");

  await page.getByTestId("receiver-hover-position-x-input").fill("-0.11");
  await page.getByTestId("receiver-hover-position-y-input").fill("0.19");
  await page.getByTestId("receiver-hover-position-z-input").fill("0.14");
  await page.getByTestId("receiver-preview-hover-input").check();
  await expect(page.getByTestId("receiver-preview-hover-input")).toBeChecked();
  await expect(phoneCalibrationCanvas).toHaveAttribute("data-motion-scale", "1.00");
  await expect(phoneCalibrationCanvas).toHaveAttribute("data-receiver-state", "hover");
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-x-delta", -0.11);
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-y-delta", 0.19);
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-z-delta", 0.14);
  await page.getByRole("button", { name: "salvar e aplicar na pagina" }).click();
  await expect(page.getByTestId("calibration-save-status")).toContainText(
    "Calibracao salva",
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("calibration-interface")).toBeVisible();
  await expect(page.getByTestId("desk-position-x-input")).toHaveValue("1.23");
  await expect(page.getByTestId("dossier-table-position-x-input")).toHaveValue("0.77");
  await expect(page.getByTestId("phone-model-position-x-input")).toHaveValue("-0.44");
  await expect(page.getByTestId("receiver-hover-position-x-input")).toHaveValue("-0.11");

  await page.evaluate(() => {
    window.localStorage.setItem("portfolio-language", "pt-BR");
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dossier = page.getByTestId("dossier-hero-canvas");

  await expect(dossier.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => dossier.getAttribute("data-desk-layout-x"), { timeout: 30_000 })
    .toBe("1.2300");
  await expect
    .poll(() => dossier.getAttribute("data-dossier-table-x"), { timeout: 30_000 })
    .toBe("0.7700");

  await page.locator("#contact").scrollIntoViewIfNeeded();
  const phoneProp = page.getByTestId("rotary-telephone-3d");

  await expect(phoneProp.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect(phoneProp).toHaveAttribute("data-model-position-x", "-0.4400");
  await expect(phoneProp).toHaveAttribute("data-model-fit-size", "3.9000");
  const phoneBox = await phoneProp.boundingBox();

  expect(phoneBox).not.toBeNull();
  await page.mouse.move(
    phoneBox!.x + phoneBox!.width * 0.78,
    phoneBox!.y + phoneBox!.height * 0.48,
    { steps: 8 },
  );
  await expect(phoneProp).toHaveAttribute("data-motion-scale", "1.00");
  await expect(phoneProp).toHaveAttribute("data-receiver-state", "hover");
  await expectReceiverDelta(phoneProp, "data-receiver-x-delta", -0.11);
  await expectReceiverDelta(phoneProp, "data-receiver-y-delta", 0.19);
  await expectReceiverDelta(phoneProp, "data-receiver-z-delta", 0.14);

  expect(browserIssues).toEqual([]);
});

test.skip("3d calibration interface mirrors reduced-motion receiver deltas", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/interface", { waitUntil: "domcontentloaded" });

  const phoneCalibrationCanvas = page.getByTestId("phone-calibration-canvas");

  await expect(phoneCalibrationCanvas.locator("canvas")).toBeVisible({
    timeout: 15_000,
  });
  await expect(phoneCalibrationCanvas).toHaveAttribute("data-motion-scale", "0.32");

  await page.getByTestId("receiver-preview-hover-input").check();
  await expect(phoneCalibrationCanvas).toHaveAttribute("data-receiver-state", "hover");
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-x-delta", -0.0064);
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-y-delta", 0.0864);
  await expectReceiverDelta(phoneCalibrationCanvas, "data-receiver-z-delta", 0.176);

  expect(browserIssues).toEqual([]);
});

test("film reel supports looped buttons, wheel, drag, CRT preview effects, and public controls", async ({
  page,
}) => {
  const browserIssues = createBrowserIssueTracker(page);

  await openHome(page);

  const root = page.locator("html");
  const reel = page.locator(".film-reel");
  const track = page.locator(".film-reel-track");
  const slides = page.locator(".film-reel-slide");
  const nextProjectButton = page.getByRole("button", {
    exact: true,
    name: "Próximo projeto",
  });
  const previousProjectButton = page.getByRole("button", {
    exact: true,
    name: "Projeto anterior",
  });
  const carouselRegion = page.getByRole("region", {
    name: "Projetos em destaque",
  });
  const activeStatus = page.locator("[data-film-reel-status]");

  await expect(carouselRegion).toBeVisible();
  await expect(reel).toBeVisible();
  await expect(reel).toHaveAttribute("tabindex", "0");
  await expect(reel).toHaveAttribute("aria-label", "Película de projetos");
  await expect(page.getByTestId("light-switch-toggle-3d")).toHaveCount(0);
  await expect(page.getByTestId("photographic-film-3d")).toHaveCount(0);
  await expect(root).toHaveAttribute("lang", "pt-BR");
  await expect(root).toHaveAttribute("data-language", "pt-BR");
  await expect(slides).toHaveCount(28);
  await expect(page.locator('.film-reel-slide[data-active="true"]')).toHaveCount(1);
  await expect(activeStatus).toContainText("Projeto ativo: 1 de 4");
  const activeProjectArticle = page.getByRole("article", {
    name: /Projeto 1 de 4: Portfólio Gerenciável/i,
  });

  await expect(activeProjectArticle).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("link", {
      name: "Código do projeto: Portfólio Gerenciável",
    }),
  ).toBeVisible();
  await expect(
    activeProjectArticle.locator(
      '[aria-label="Demonstração indisponível: Portfólio Gerenciável"]',
    ),
  ).toBeVisible();
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
  await nextProjectButton.click();
  await expectTrackToMove(track, before);

  before = await trackTransform(track);
  await previousProjectButton.click();
  await expectTrackToMove(track, before);

  await reel.focus();
  before = await trackTransform(track);
  await page.keyboard.press("ArrowRight");
  await expectTrackToMove(track, before);
  await expect(activeStatus).toContainText("Projeto ativo: 2 de 4");

  before = await trackTransform(track);
  await page.keyboard.press("ArrowLeft");
  await expectTrackToMove(track, before);
  await expect(activeStatus).toContainText("Projeto ativo: 1 de 4");

  await page.keyboard.press("End");
  await expect(activeStatus).toContainText("Projeto ativo: 4 de 4");
  await page.keyboard.press("Home");
  await expect(activeStatus).toContainText("Projeto ativo: 1 de 4");

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
    await nextProjectButton.click();
  }

  for (let index = 0; index < 6; index += 1) {
    await previousProjectButton.click();
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

  await page.locator("#contact").scrollIntoViewIfNeeded();

  const contactCard = page.locator("#contact .section-card");
  const contactSection = page.locator("#contact");
  const footer = page.locator("footer");
  const phoneProp = page.getByTestId("rotary-telephone-3d");

  await expect(contactCard).toHaveCSS("overflow", "visible");
  await expect(phoneProp).toBeVisible();
  await expect(phoneProp.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect(phoneProp).toHaveAttribute("data-visual-treatment", "vintage-noir");
  await expect(phoneProp).toHaveAttribute("data-lighting-treatment", "vintage-noir");
  await expect(phoneProp.locator(".vintage-3d-grain")).toHaveCount(1);
  await expect(phoneProp.locator(".vintage-3d-noise")).toHaveCount(1);
  await expect
    .poll(() => phoneProp.getAttribute("data-receiver-found"), { timeout: 30_000 })
    .toBe("true");

  const phoneBox = await phoneProp.boundingBox();
  const phoneCanvasBox = await phoneProp.locator("canvas").boundingBox();
  const contactCardBox = await contactCard.boundingBox();
  const contactSectionBox = await contactSection.boundingBox();
  const footerBox = await footer.boundingBox();

  expect(phoneBox).not.toBeNull();
  expect(phoneCanvasBox).not.toBeNull();
  expect(contactCardBox).not.toBeNull();
  expect(contactSectionBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(phoneBox!.width).toBeGreaterThan(480);
  expect(phoneBox!.height).toBeGreaterThan(340);
  expect(phoneCanvasBox!.width).toBeGreaterThan(480);
  expect(phoneCanvasBox!.height).toBeGreaterThan(340);
  expect(phoneBox!.y + phoneBox!.height).toBeLessThanOrEqual(
    contactSectionBox!.y + contactSectionBox!.height + 2,
  );
  expect(phoneBox!.y + phoneBox!.height).toBeLessThan(footerBox!.y + 2);

  await page.mouse.move(
    phoneBox!.x + phoneBox!.width * 0.78,
    phoneBox!.y + phoneBox!.height * 0.48,
    { steps: 8 },
  );
  await expect
    .poll(() => phoneProp.getAttribute("data-receiver-state"), { timeout: 4_000 })
    .toBe("hover");
  await expect
    .poll(
      async () => Math.abs(await readNumericData(phoneProp, "data-receiver-x-delta")),
      { timeout: 4_000 },
    )
    .toBeGreaterThan(0.015);

  await page.mouse.move(10, 10, { steps: 8 });
  await expect
    .poll(() => phoneProp.getAttribute("data-receiver-state"), { timeout: 4_000 })
    .toBe("rest");
  await expect
    .poll(
      async () => Math.abs(await readNumericData(phoneProp, "data-receiver-x-delta")),
      { timeout: 4_000 },
    )
    .toBeLessThan(0.01);

  expect(browserIssues).toEqual([]);
});

test.describe("language detection", () => {
  test.use({ locale: "en-US" });

  test("uses the browser language by default when there is no saved choice", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      Object.defineProperty(navigator, "language", {
        get: () => "en-US",
      });
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const root = page.locator("html");
    const featuredProjectsHeading = page.getByRole("heading", {
      name: "Featured projects",
    });

    await expect(featuredProjectsHeading).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveAttribute("lang", "en", { timeout: 15_000 });
    await expect(root).toHaveAttribute("data-language", "en", {
      timeout: 15_000,
    });

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
