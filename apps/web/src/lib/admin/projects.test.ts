import { describe, expect, it } from "vitest";

import {
  createProjectSlug,
  getNextProjectOrder,
  parseProjectLines,
  validateProjectForm,
} from "@/lib/admin/projects";

const validValues = {
  descriptionEn: "English project description with enough useful context.",
  descriptionPt: "Descrição em português com contexto suficiente do projeto.",
  featured: true,
  frameCode: "VF-010",
  liveUrl: "",
  order: "",
  posterImage: "/projects/portfolio/poster.svg",
  previewImages:
    "/projects/portfolio/preview-01.svg\n/projects/portfolio/preview-01.svg",
  published: true,
  repositoryUrl: "https://github.com/SenoPersonalProjects/example",
  slug: "portfolio-gerenciavel",
  stack: "Next.js\nReact\nNext.js\nTypeScript",
  titleEn: "Manageable portfolio",
  titlePt: "Portfólio gerenciável",
};

describe("project validation", () => {
  it("generates a safe slug from a Portuguese title", () => {
    expect(createProjectSlug(" Portfólio Gerenciável 2026! ")).toBe(
      "portfolio-gerenciavel-2026",
    );
  });

  it("normalizes bilingual text, stack, optional fields and images", () => {
    const result = validateProjectForm(
      {
        ...validValues,
        descriptionEn: ` ${validValues.descriptionEn} `,
        descriptionPt: ` ${validValues.descriptionPt} `,
        frameCode: " ",
        liveUrl: " ",
        slug: " Portfolio-Gerenciavel ",
        titleEn: " Manageable portfolio ",
        titlePt: " Portfólio gerenciável ",
      },
      [{ order: 4 }],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload).toEqual({
        descriptionEn: validValues.descriptionEn,
        descriptionPt: validValues.descriptionPt,
        featured: true,
        frameCode: null,
        liveUrl: null,
        order: 5,
        posterImage: "/projects/portfolio/poster.svg",
        previewImages: ["/projects/portfolio/preview-01.svg"],
        published: true,
        repositoryUrl: "https://github.com/SenoPersonalProjects/example",
        slug: "portfolio-gerenciavel",
        stack: ["Next.js", "React", "TypeScript"],
        titleEn: "Manageable portfolio",
        titlePt: "Portfólio gerenciável",
      });
    }
  });

  it("accepts order zero, empty preview images and false flags", () => {
    const result = validateProjectForm(
      {
        ...validValues,
        featured: false,
        order: "0",
        previewImages: "\n  \n",
        published: false,
        repositoryUrl: "",
      },
      [],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.order).toBe(0);
      expect(result.payload.previewImages).toEqual([]);
      expect(result.payload.repositoryUrl).toBeNull();
      expect(result.payload.featured).toBe(false);
      expect(result.payload.published).toBe(false);
    }
  });

  it("rejects invalid slug, urls, poster and stack", () => {
    const result = validateProjectForm(
      {
        ...validValues,
        liveUrl: "portfolio.dev",
        posterImage: "projects/poster.svg",
        repositoryUrl: "github.com/repo",
        slug: "portfólio gerenciável",
        stack: "",
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.slug).toBeDefined();
      expect(result.errors.repositoryUrl).toBeDefined();
      expect(result.errors.liveUrl).toBeDefined();
      expect(result.errors.posterImage).toBeDefined();
      expect(result.errors.stack).toBeDefined();
    }
  });

  it("rejects long stack items, invalid previews and invalid order", () => {
    const result = validateProjectForm(
      {
        ...validValues,
        order: "1.5",
        previewImages: "projects/preview.svg",
        stack: "Tecnologia com nome excessivamente longo para o Film Reel",
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.stack).toContain("ultrapassa 40 caracteres");
      expect(result.errors.previewImages).toContain("deve comecar");
      expect(result.errors.order).toContain("inteiro");
    }
  });

  it("deduplicates exact repeated lines", () => {
    expect(parseProjectLines("React\nReact\n react ")).toEqual([
      "React",
      "react",
    ]);
  });

  it("returns zero as the first suggested order", () => {
    expect(getNextProjectOrder([])).toBe(0);
  });
});
