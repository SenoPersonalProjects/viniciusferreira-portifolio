import { describe, expect, it } from "vitest";

import {
  getNextContactLinkOrder,
  validateContactLinkForm,
} from "@/lib/admin/contactLinks";

describe("contact link validation", () => {
  it("normalizes plain email values to mailto links", () => {
    const result = validateContactLinkForm(
      {
        label: "Email",
        order: "",
        type: "email",
        url: "contato@example.com",
        visible: true,
      },
      [{ order: 3 }],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload).toEqual({
        label: "Email",
        order: 4,
        type: "email",
        url: "mailto:contato@example.com",
        visible: true,
      });
    }
  });

  it("preserves valid mailto email values", () => {
    const result = validateContactLinkForm(
      {
        label: "Email",
        order: "0",
        type: "email",
        url: "mailto:contato@example.com",
        visible: false,
      },
      [],
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.order).toBe(0);
      expect(result.payload.url).toBe("mailto:contato@example.com");
      expect(result.payload.visible).toBe(false);
    }
  });

  it("rejects non-http URLs for external links", () => {
    const result = validateContactLinkForm(
      {
        label: "Portfolio",
        order: "1",
        type: "external",
        url: "ftp://example.com",
        visible: true,
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.url).toContain("http://");
    }
  });

  it("rejects unknown contact types", () => {
    const result = validateContactLinkForm(
      {
        label: "Contato",
        order: "1",
        type: "mastodon",
        url: "https://example.com",
        visible: true,
      },
      [],
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.type).toBeDefined();
    }
  });

  it("returns zero as the first suggested order", () => {
    expect(getNextContactLinkOrder([])).toBe(0);
  });
});
