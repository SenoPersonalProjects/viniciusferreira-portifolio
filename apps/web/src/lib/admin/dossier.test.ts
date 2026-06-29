import { describe, expect, it } from "vitest";

import { dossierByLocale, type DossierContent } from "@/data/dossier";
import {
  createDossierDraft,
  getDossierFormValues,
  resetDossierDraft,
  validateDossierForm,
} from "@/lib/admin/dossier";

describe("admin dossier helper", () => {
  it("creates a draft without mutating the original content", () => {
    const source: DossierContent = {
      ...dossierByLocale.pt,
      redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
    };
    const draft = createDossierDraft(source);

    draft.subject = "OUTRO ASSUNTO";
    if (draft.redactions?.[0]) {
      draft.redactions[0].x = 99;
    }

    expect(source.subject).toBe("VINICIUS FERREIRA");
    expect(source.redactions?.[0]?.x).toBe(1);
  });

  it("normalizes strings with trim while preserving note, accents and casing", () => {
    const result = validateDossierForm(
      {
        ...getDossierFormValues(dossierByLocale.pt),
        classification: " Confidencial ",
        mainPhotoUrl: " /profile/detective/individual-1.jpeg ",
        note: "  Nota com Acentos e Casing Preservado.  ",
      },
      dossierByLocale.pt,
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.classification).toBe("Confidencial");
      expect(result.payload.mainPhotoUrl).toBe(
        "/profile/detective/individual-1.jpeg",
      );
      expect(result.payload.note).toBe("Nota com Acentos e Casing Preservado.");
    }
  });

  it("accepts internal paths and http urls for images", () => {
    const result = validateDossierForm({
      ...getDossierFormValues(dossierByLocale.en),
      mainPhotoUrl: "https://example.com/main.jpg",
      polaroidPhotoUrl: "/profile/detective/individual-2.jpeg",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid image paths", () => {
    const result = validateDossierForm({
      ...getDossierFormValues(dossierByLocale.en),
      mainPhotoUrl: "profile/detective/individual-1.jpeg",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.mainPhotoUrl).toContain("deve começar");
    }
  });

  it("rejects empty required text fields", () => {
    const result = validateDossierForm({
      ...getDossierFormValues(dossierByLocale.pt),
      note: " ",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.note).toBeDefined();
    }
  });

  it("resets draft to the current local content", () => {
    const reset = resetDossierDraft("pt");

    expect(reset.formValues.note).toBe(dossierByLocale.pt.note);
    expect(reset.preview).toEqual(dossierByLocale.pt);
    expect(reset.preview).not.toBe(dossierByLocale.pt);
  });
});
