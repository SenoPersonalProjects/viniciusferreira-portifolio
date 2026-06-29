import { describe, expect, it } from "vitest";

import {
  getSiteCopyLocaleOptions,
  getSiteCopyPreview,
  sortSiteCopy,
  validateSiteCopyForm,
} from "@/lib/admin/siteCopy";

describe("site copy validation", () => {
  it("normalizes key casing and trims values while preserving text casing", () => {
    const result = validateSiteCopyForm({
      key: " Hero.Headline ",
      locale: " pt-BR ",
      value: "  Texto com Acentos e Casing Preservado.  ",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload).toEqual({
        key: "hero.headline",
        locale: "pt-BR",
        value: "Texto com Acentos e Casing Preservado.",
      });
    }
  });

  it("accepts dot, underscore and hyphen in keys", () => {
    const result = validateSiteCopyForm({
      key: "projects.empty-state_cta",
      locale: "en",
      value: "Open project",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects spaces, accents and invalid key length", () => {
    const withSpace = validateSiteCopyForm({
      key: "hero headline",
      locale: "pt-BR",
      value: "Texto",
    });
    const withAccent = validateSiteCopyForm({
      key: "herói.headline",
      locale: "pt-BR",
      value: "Texto",
    });
    const tooShort = validateSiteCopyForm({
      key: "ab",
      locale: "pt-BR",
      value: "Texto",
    });

    expect(withSpace.ok).toBe(false);
    expect(withAccent.ok).toBe(false);
    expect(tooShort.ok).toBe(false);
  });

  it("validates locale and value", () => {
    const invalidLocale = validateSiteCopyForm({
      key: "hero.headline",
      locale: "portugues brasil",
      value: "Texto",
    });
    const emptyValue = validateSiteCopyForm({
      key: "hero.headline",
      locale: "pt-BR",
      value: "   ",
    });

    expect(invalidLocale.ok).toBe(false);
    expect(emptyValue.ok).toBe(false);
  });

  it("preserves legacy locale options for existing records", () => {
    expect(getSiteCopyLocaleOptions("pt")).toEqual(["pt-BR", "en", "pt"]);
  });

  it("sorts records by key and locale", () => {
    expect(
      sortSiteCopy([
        { id: "3", key: "contact.cta", locale: "en", value: "Contact" },
        { id: "2", key: "about.title", locale: "pt-BR", value: "Sobre" },
        { id: "1", key: "about.title", locale: "en", value: "About" },
      ]).map((record) => `${record.key}:${record.locale}`),
    ).toEqual(["about.title:en", "about.title:pt-BR", "contact.cta:en"]);
  });

  it("creates a short plain text preview", () => {
    expect(getSiteCopyPreview(" Linha 1\n\nLinha 2 ", 14)).toBe("Linha 1 Linha…");
  });
});
