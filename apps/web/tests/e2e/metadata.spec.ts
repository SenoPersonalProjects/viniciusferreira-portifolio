import { expect, test } from "@playwright/test";

test("home exposes seo metadata, structured data and social assets", async ({
  page,
  request,
}) => {
  const robots = await request.get("/robots.txt");
  const sitemap = await request.get("/sitemap.xml");
  const openGraphImage = await request.get("/opengraph-image");
  const twitterImage = await request.get("/twitter-image");

  await expect(robots).toBeOK();
  await expect(sitemap).toBeOK();
  await expect(openGraphImage).toBeOK();
  await expect(twitterImage).toBeOK();

  expect(await robots.text()).toContain("Disallow: /admin");
  expect(await robots.text()).toContain("Disallow: /interface");
  expect(await robots.text()).toContain("Sitemap: http://localhost:3000/sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>http://localhost:3000/</loc>");
  expect(openGraphImage.headers()["content-type"]).toContain("image/png");
  expect(twitterImage.headers()["content-type"]).toContain("image/png");

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle("Vinicius Ferreira | Desenvolvedor Full Stack");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Portfólio pessoal de Vinicius Ferreira/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /\/twitter-image/,
  );

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();

  expect(jsonLd).not.toBeNull();

  const structuredData = JSON.parse(jsonLd ?? "") as {
    "@type": string;
    mainEntity: {
      "@type": string;
      name: string;
      jobTitle: string;
      sameAs: string[];
      knowsAbout: string[];
    };
  };

  expect(structuredData["@type"]).toBe("ProfilePage");
  expect(structuredData.mainEntity).toMatchObject({
    "@type": "Person",
    name: "Vinicius Ferreira",
    jobTitle: "Desenvolvedor Full Stack",
  });
  expect(structuredData.mainEntity.sameAs).toContain(
    "https://github.com/SenoPersonalProjects",
  );
  expect(structuredData.mainEntity.knowsAbout).toContain("Next.js");
  expect(structuredData.mainEntity.knowsAbout).toContain("TypeScript");
});
