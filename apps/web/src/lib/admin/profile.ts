export type AdminProfile = {
  id: string;
  name: string;
  rolePt: string;
  roleEn: string;
  headlinePt: string;
  headlineEn: string;
  summaryPt: string;
  summaryEn: string;
  locationPt: string;
  locationEn: string;
};

export type ProfilePayload = {
  name: string;
  rolePt: string;
  roleEn: string;
  headlinePt: string;
  headlineEn: string;
  summaryPt: string;
  summaryEn: string;
  locationPt: string;
  locationEn: string;
};

export type ProfileFormValues = ProfilePayload;

export type ProfileValidationErrors = Partial<
  Record<keyof ProfileFormValues, string>
>;

type ValidationResult =
  | {
      errors: ProfileValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: ProfilePayload;
    };

type FieldRule = {
  key: keyof ProfileFormValues;
  label: string;
  maxLength: number;
  minLength: number;
};

const profileRules: FieldRule[] = [
  { key: "name", label: "o nome", maxLength: 80, minLength: 2 },
  { key: "rolePt", label: "o cargo PT", maxLength: 80, minLength: 3 },
  { key: "roleEn", label: "o cargo EN", maxLength: 80, minLength: 3 },
  {
    key: "headlinePt",
    label: "a headline PT",
    maxLength: 180,
    minLength: 10,
  },
  {
    key: "headlineEn",
    label: "a headline EN",
    maxLength: 180,
    minLength: 10,
  },
  {
    key: "summaryPt",
    label: "o resumo PT",
    maxLength: 800,
    minLength: 20,
  },
  {
    key: "summaryEn",
    label: "o resumo EN",
    maxLength: 800,
    minLength: 20,
  },
  {
    key: "locationPt",
    label: "a localização PT",
    maxLength: 80,
    minLength: 2,
  },
  {
    key: "locationEn",
    label: "a localização EN",
    maxLength: 80,
    minLength: 2,
  },
];

function validateField(value: string, rule: FieldRule) {
  const normalized = value.trim();

  if (
    normalized.length < rule.minLength ||
    normalized.length > rule.maxLength
  ) {
    return {
      error: `Informe ${rule.label} com ${rule.minLength} a ${rule.maxLength} caracteres.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

export function getProfileFormValues(
  profile?: AdminProfile | null,
): ProfileFormValues {
  return {
    headlineEn: profile?.headlineEn ?? "",
    headlinePt: profile?.headlinePt ?? "",
    locationEn: profile?.locationEn ?? "",
    locationPt: profile?.locationPt ?? "",
    name: profile?.name ?? "",
    roleEn: profile?.roleEn ?? "",
    rolePt: profile?.rolePt ?? "",
    summaryEn: profile?.summaryEn ?? "",
    summaryPt: profile?.summaryPt ?? "",
  };
}

export function validateProfileForm(
  values: ProfileFormValues,
): ValidationResult {
  const errors: ProfileValidationErrors = {};
  const payload = {} as ProfilePayload;

  for (const rule of profileRules) {
    const result = validateField(values[rule.key], rule);

    payload[rule.key] = result.value;

    if (result.error) {
      errors[rule.key] = result.error;
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    payload,
  };
}
