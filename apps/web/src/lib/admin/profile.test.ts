import { describe, expect, it } from "vitest";

import {
  getProfileFormValues,
  validateProfileForm,
  type AdminProfile,
} from "@/lib/admin/profile";

const validValues = {
  headlineEn: "I build clear and manageable web products.",
  headlinePt: "Desenvolvo produtos web claros e gerenciáveis.",
  locationEn: "Brazil",
  locationPt: "Brasil",
  name: "Vinicius Ferreira",
  roleEn: "Full Stack Developer",
  rolePt: "Desenvolvedor Full Stack",
  summaryEn:
    "I am a full stack developer focused on frontend architecture and consistent APIs.",
  summaryPt:
    "Sou desenvolvedor full stack focado em arquitetura de frontend e APIs consistentes.",
};

const existingProfile: AdminProfile = {
  ...validValues,
  id: "profile-id",
};

describe("profile validation", () => {
  it("normalizes profile text with trim only", () => {
    const result = validateProfileForm({
      ...validValues,
      headlinePt: "  Código claro com experiência consistente.  ",
      name: "  Vinícius Ferreira  ",
      rolePt: "  Desenvolvedor Full Stack  ",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.payload.name).toBe("Vinícius Ferreira");
      expect(result.payload.rolePt).toBe("Desenvolvedor Full Stack");
      expect(result.payload.headlinePt).toBe(
        "Código claro com experiência consistente.",
      );
      expect(result.payload.rolePt).not.toBe(
        result.payload.rolePt.toUpperCase(),
      );
    }
  });

  it("rejects empty and short required fields", () => {
    const result = validateProfileForm({
      ...validValues,
      headlineEn: "short",
      locationPt: "",
      name: "V",
      roleEn: "FE",
      summaryPt: "curto",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.roleEn).toBeDefined();
      expect(result.errors.headlineEn).toBeDefined();
      expect(result.errors.summaryPt).toBeDefined();
      expect(result.errors.locationPt).toBeDefined();
    }
  });

  it("rejects values above configured limits", () => {
    const result = validateProfileForm({
      ...validValues,
      headlinePt: "a".repeat(181),
      locationEn: "b".repeat(81),
      name: "c".repeat(81),
      rolePt: "d".repeat(81),
      summaryEn: "e".repeat(801),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.rolePt).toBeDefined();
      expect(result.errors.headlinePt).toBeDefined();
      expect(result.errors.summaryEn).toBeDefined();
      expect(result.errors.locationEn).toBeDefined();
    }
  });

  it("maps existing profile to form values without inventing fallbacks", () => {
    expect(getProfileFormValues(existingProfile)).toEqual(validValues);
    expect(getProfileFormValues(null)).toEqual({
      headlineEn: "",
      headlinePt: "",
      locationEn: "",
      locationPt: "",
      name: "",
      roleEn: "",
      rolePt: "",
      summaryEn: "",
      summaryPt: "",
    });
  });
});
