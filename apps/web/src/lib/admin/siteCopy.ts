export const SITE_COPY_LOCALES = ["pt-BR", "en"] as const;

export type SiteCopyLocale = (typeof SITE_COPY_LOCALES)[number];

export type AdminSiteCopy = {
  id: string;
  key: string;
  locale: string;
  value: string;
};

export type SiteCopyPayload = {
  key: string;
  locale: string;
  value: string;
};

export type SiteCopyFormValues = SiteCopyPayload;

export type SiteCopyValidationErrors = Partial<
  Record<keyof SiteCopyFormValues, string>
>;

type ValidationResult =
  | {
      errors: SiteCopyValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: SiteCopyPayload;
    };

const keyPattern = /^[a-z0-9._-]+$/;
const localePattern = /^[a-z]{2}(?:-[A-Za-z]{2})?$/;

export function getSiteCopyFormValues(
  siteCopy?: AdminSiteCopy | null,
): SiteCopyFormValues {
  return {
    key: siteCopy?.key ?? "",
    locale: siteCopy?.locale ?? SITE_COPY_LOCALES[0],
    value: siteCopy?.value ?? "",
  };
}

export function getSiteCopyLocaleOptions(currentLocale?: string) {
  const normalizedCurrent = currentLocale?.trim();
  const options = [...SITE_COPY_LOCALES];

  if (
    normalizedCurrent &&
    !options.includes(normalizedCurrent as SiteCopyLocale)
  ) {
    return [...options, normalizedCurrent];
  }

  return options;
}

export function getSiteCopyPreview(value: string, maxLength = 160) {
  const preview = value.trim().replace(/\s+/g, " ");

  if (preview.length <= maxLength) {
    return preview;
  }

  return `${preview.slice(0, maxLength - 1)}…`;
}

export function sortSiteCopy(records: AdminSiteCopy[]) {
  return [...records].sort((a, b) => {
    const keyCompare = a.key.localeCompare(b.key);

    if (keyCompare !== 0) {
      return keyCompare;
    }

    return a.locale.localeCompare(b.locale);
  });
}

export function validateSiteCopyForm(
  values: SiteCopyFormValues,
): ValidationResult {
  const errors: SiteCopyValidationErrors = {};
  const key = values.key.trim().toLowerCase();
  const locale = values.locale.trim();
  const value = values.value.trim();

  if (key.length < 3 || key.length > 120) {
    errors.key = "Informe uma chave com 3 a 120 caracteres.";
  } else if (!keyPattern.test(key)) {
    errors.key =
      "Use apenas letras minúsculas, números, ponto, hífen e underscore.";
  }

  if (!locale) {
    errors.locale = "Selecione um locale.";
  } else if (locale.length > 20 || !localePattern.test(locale)) {
    errors.locale = "Use um locale curto, como pt-BR ou en.";
  }

  if (value.length < 1 || value.length > 5000) {
    errors.value = "Informe um texto com 1 a 5000 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    payload: {
      key,
      locale,
      value,
    },
  };
}
