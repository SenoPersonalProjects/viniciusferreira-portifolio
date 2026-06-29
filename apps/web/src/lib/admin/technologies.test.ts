import { describe, expect, it } from "vitest";

import {
  getNextTechnologyOrder,
  parseTechnologyItems,
  validateTechnologyForm,
} from "@/lib/admin/technologies";

describe("technology validation", () => {
  it("normalizes categories and textarea items", () => {
    const result = validateTechnologyForm(
      {
        categoryEn: " Frontend ",
        categoryPt: " Frontend ",
        items: "Next.js\n\nReact\nTypeScript\nReact",
        order: "",
        visible: true,
      },
      [{ order: 3 }],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload).toEqual({
        categoryEn: "Frontend",
        categoryPt: "Frontend",
        items: ["Next.js", "React", "TypeScript"],
        order: 4,
        visible: true,
      });
    }
  });

  it("accepts order zero and a false visible value", () => {
    const result = validateTechnologyForm(
      {
        categoryEn: "Database",
        categoryPt: "Banco de dados",
        items: "PostgreSQL",
        order: "0",
        visible: false,
      },
      [],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.order).toBe(0);
      expect(result.payload.visible).toBe(false);
    }
  });

  it("rejects empty item lists", () => {
    const result = validateTechnologyForm(
      {
        categoryEn: "Tools",
        categoryPt: "Ferramentas",
        items: "\n  \n",
        order: "1",
        visible: true,
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.items).toContain("pelo menos um item");
    }
  });

  it("rejects long items and invalid order values", () => {
    const result = validateTechnologyForm(
      {
        categoryEn: "Backend",
        categoryPt: "Backend",
        items: "Tecnologia com nome excessivamente longo para o painel",
        order: "1.5",
        visible: true,
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.items).toContain("ultrapassa 40 caracteres");
      expect(result.errors.order).toContain("número inteiro");
    }
  });

  it("deduplicates exact repeated item lines", () => {
    expect(parseTechnologyItems("React\nReact\n react ")).toEqual([
      "React",
      "react",
    ]);
  });

  it("returns zero as the first suggested order", () => {
    expect(getNextTechnologyOrder([])).toBe(0);
  });
});
