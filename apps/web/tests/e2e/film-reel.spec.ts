import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function trackTransform(track: Locator) {
  return track.evaluate((element) => window.getComputedStyle(element).transform);
}

async function expectTrackToMove(track: Locator, previousTransform: string) {
  await expect
    .poll(() => trackTransform(track), { timeout: 5_000 })
    .not.toBe(previousTransform);
}

async function openHome(page: Page, language = "pt-BR") {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("portfolio-language", selectedLanguage);
  }, language);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Projetos em destaque" }).scrollIntoViewIfNeeded();
}

test("film reel supports looped buttons, wheel, drag, CRT preview effects, and theme toggles", async ({
  page,
}) => {
  const consoleErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

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

  expect(consoleErrors).toEqual([]);
});

test.describe("language detection", () => {
  test.use({ locale: "en-US" });

  test("uses the browser language by default when there is no saved choice", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/", { waitUntil: "networkidle" });

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

test("projects section has no automated WCAG A/AA axe violations", async ({ page }) => {
  await openHome(page);

  const results = await new AxeBuilder({ page })
    .include("#projects")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
