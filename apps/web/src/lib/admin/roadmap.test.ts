import { describe, expect, it } from "vitest";

import {
  getNextRoadmapOrder,
  parseRoadmapTechnologies,
  validateRoadmapItemForm,
} from "@/lib/admin/roadmap";

const validValues = {
  detailsEn: "Detailed English description for the roadmap timeline item.",
  detailsPt: "Descrição detalhada em português para o item da trajetória.",
  endDate: "Atual",
  order: "",
  published: true,
  startDate: "2024 — atual",
  summaryEn: "English summary for this timeline item.",
  summaryPt: "Resumo em português para este item da trajetória.",
  technologies: "Next.js\nReact\nNext.js",
  titleEn: "Full stack practice",
  titlePt: "Prática full stack",
  type: "carreira",
};

describe("roadmap item validation", () => {
  it("normalizes editorial periods, bilingual text and technologies", () => {
    const result = validateRoadmapItemForm(
      {
        ...validValues,
        endDate: " Present ",
        startDate: " Jan 2024 ",
        titleEn: " Full stack practice ",
        titlePt: " Prática full stack ",
      },
      [{ order: 4 }],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload).toEqual({
        detailsEn: validValues.detailsEn,
        detailsPt: validValues.detailsPt,
        endDate: "Present",
        order: 5,
        published: true,
        startDate: "Jan 2024",
        summaryEn: validValues.summaryEn,
        summaryPt: validValues.summaryPt,
        technologies: ["Next.js", "React"],
        titleEn: "Full stack practice",
        titlePt: "Prática full stack",
        type: "carreira",
      });
    }
  });

  it("accepts empty technologies, order zero and unpublished state", () => {
    const result = validateRoadmapItemForm(
      {
        ...validValues,
        order: "0",
        published: false,
        technologies: "\n  \n",
        type: "projeto",
      },
      [],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.order).toBe(0);
      expect(result.payload.published).toBe(false);
      expect(result.payload.technologies).toEqual([]);
      expect(result.payload.type).toBe("projeto");
    }
  });

  it("rejects invalid types and short bilingual fields", () => {
    const result = validateRoadmapItemForm(
      {
        ...validValues,
        detailsEn: "short",
        detailsPt: "curto",
        summaryEn: "short",
        summaryPt: "curto",
        titleEn: "EN",
        titlePt: "PT",
        type: "achievement",
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.type).toBeDefined();
      expect(result.errors.titlePt).toBeDefined();
      expect(result.errors.summaryPt).toBeDefined();
      expect(result.errors.detailsPt).toBeDefined();
    }
  });

  it("rejects long technologies and invalid order values", () => {
    const result = validateRoadmapItemForm(
      {
        ...validValues,
        order: "1.5",
        technologies: "Tecnologia com nome excessivamente longo para timeline",
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.technologies).toContain("ultrapassa 40 caracteres");
      expect(result.errors.order).toContain("número inteiro");
    }
  });

  it("deduplicates exact repeated technology lines", () => {
    expect(parseRoadmapTechnologies("React\nReact\n react ")).toEqual([
      "React",
      "react",
    ]);
  });

  it("returns zero as the first suggested order", () => {
    expect(getNextRoadmapOrder([])).toBe(0);
  });
});
