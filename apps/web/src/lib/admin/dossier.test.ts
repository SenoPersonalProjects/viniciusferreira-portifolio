import { describe, expect, it } from "vitest";

import { dossierByLocale, type DossierContent } from "@/data/dossier";
import {
  createDossierDraftFromPersisted,
  createDossierDraft,
  getDossierStateFromPersisted,
  getDossierFormValues,
  resetDossierDraft,
  validateDossierForm,
  validateDossierSavePayload,
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

  it("maps persisted records to a local draft shape", () => {
    const draft = createDossierDraftFromPersisted({
      ...dossierByLocale.en,
      createdAt: "2026-06-29T00:00:00.000Z",
      id: "dossier-en",
      locale: "en",
      redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
      stack: ["NEXT.JS", "NESTJS", "TYPESCRIPT"],
      updatedAt: "2026-06-29T00:00:00.000Z",
    });

    expect(draft.stack).toBe("NEXT.JS / NESTJS / TYPESCRIPT");
    expect(draft.note).toBe(dossierByLocale.en.note);
    expect(draft.redactions?.[0]?.x).toBe(1);
  });

  it("uses database records when present and fallback local otherwise", () => {
    const state = getDossierStateFromPersisted([
      {
        ...dossierByLocale.en,
        id: "dossier-en",
        locale: "en",
        stack: ["NEXT.JS", "NESTJS"],
      },
    ]);

    expect(state.origins.en).toBe("database");
    expect(state.origins.pt).toBe("fallback");
    expect(state.previews.en.stack).toBe("NEXT.JS / NESTJS");
    expect(state.previews.pt).toEqual(dossierByLocale.pt);
  });

  it("prepares a normalized persistence payload without mutating local content", () => {
    const result = validateDossierSavePayload(
      {
        ...getDossierFormValues(dossierByLocale.pt),
        stack: " Next.js / NestJS / Next.js ",
      },
      dossierByLocale.pt,
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.stack).toEqual(["Next.js", "NestJS"]);
      expect(result.draft.stack).toBe("Next.js / NestJS");
      expect(dossierByLocale.pt.stack).toBe("NEXT.JS / NESTJS / TYPESCRIPT");
    }
  });
});
