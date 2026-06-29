import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
});

test("admin login page renders without a real Supabase session", async ({ page }) => {
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Acesso administrativo" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email autorizado")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Entrar no painel" }),
  ).toBeVisible();
});

test("admin protected routes redirect to login without session", async ({
  page,
}) => {
  test.setTimeout(90_000);

  const protectedRoutes = [
    { path: "/admin", hiddenText: "Painel administrativo" },
    { path: "/admin/profile", hiddenText: "Gerenciar perfil" },
    { path: "/admin/contacts", hiddenText: "Gerenciar contatos" },
    { path: "/admin/technologies", hiddenText: "Gerenciar stack" },
    { path: "/admin/roadmap", hiddenText: "Gerenciar trajetória" },
    { path: "/admin/projects", hiddenText: "Gerenciar projetos" },
    { path: "/admin/site-copy", hiddenText: "Gerenciar textos" },
    { path: "/admin/dossier", hiddenText: "Preview do dossiê" },
  ];

  for (const route of protectedRoutes) {
    await test.step(`${route.path} redirects to login`, async () => {
      await page.goto("about:blank");
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/admin\/login$/, { timeout: 20_000 });
      await expect(page.getByText(route.hiddenText)).toHaveCount(0);
    });
  }

  await test.step("/admin/calibration redirects to login", async () => {
    await page.goto("about:blank");
    await page.goto("/admin/calibration", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin\/login$/, { timeout: 20_000 });
    await expect(page.getByTestId("calibration-interface")).toHaveCount(0);
  });
});

test("legacy interface route no longer exposes calibration publicly", async ({
  page,
}) => {
  await page.goto("/interface", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByTestId("calibration-interface")).toHaveCount(0);
});
