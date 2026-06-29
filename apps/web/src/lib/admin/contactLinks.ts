import type { ContactLink } from "@/data/portfolioContent";

export const CONTACT_LINK_TYPES = [
  "email",
  "github",
  "linkedin",
  "external",
] as const;

export type ContactLinkType = (typeof CONTACT_LINK_TYPES)[number];

export type ContactLinkPayload = {
  label: string;
  type: ContactLinkType;
  url: string;
  order: number;
  visible: boolean;
};

export type ContactLinkFormValues = {
  label: string;
  type: string;
  url: string;
  order: string;
  visible: boolean;
};

export type ContactLinkValidationErrors = Partial<
  Record<keyof ContactLinkFormValues, string>
>;

type ValidationResult =
  | {
      errors: ContactLinkValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: ContactLinkPayload;
    };

function isContactLinkType(type: string): type is ContactLinkType {
  return CONTACT_LINK_TYPES.includes(type as ContactLinkType);
}

function isHttpUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeEmailUrl(url: string) {
  const email = url.replace(/^mailto:/i, "").trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return isEmail ? `mailto:${email}` : "";
}

export function getNextContactLinkOrder(
  contactLinks: Array<Pick<ContactLink, "order">>,
) {
  if (contactLinks.length === 0) {
    return 0;
  }

  return Math.max(...contactLinks.map((link) => link.order)) + 1;
}

export function getContactLinkFormValues(
  contactLink?: ContactLink | null,
): ContactLinkFormValues {
  return {
    label: contactLink?.label ?? "",
    type: contactLink?.type ?? "external",
    url: contactLink?.url ?? "",
    order:
      typeof contactLink?.order === "number" ? String(contactLink.order) : "",
    visible: contactLink?.visible ?? true,
  };
}

export function sortContactLinks(contactLinks: ContactLink[]) {
  return [...contactLinks].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.label.localeCompare(b.label);
  });
}

export function validateContactLinkForm(
  values: ContactLinkFormValues,
  contactLinks: Array<Pick<ContactLink, "order">>,
): ValidationResult {
  const errors: ContactLinkValidationErrors = {};
  const label = values.label.trim();
  const type = values.type.trim();
  const url = values.url.trim();
  const orderValue = values.order.trim();

  if (label.length < 2 || label.length > 60) {
    errors.label = "Informe um label com 2 a 60 caracteres.";
  }

  if (!isContactLinkType(type)) {
    errors.type = "Selecione um tipo de contato válido.";
  }

  let normalizedUrl = "";

  if (!url) {
    errors.url = "Informe a URL ou email do contato.";
  } else if (type === "email") {
    normalizedUrl = normalizeEmailUrl(url);

    if (!normalizedUrl) {
      errors.url = "Informe um email válido ou mailto:email@dominio.com.";
    }
  } else if (isContactLinkType(type)) {
    normalizedUrl = url;

    if (!isHttpUrl(url)) {
      errors.url = "Informe uma URL iniciada por http:// ou https://.";
    }
  }

  let order = getNextContactLinkOrder(contactLinks);

  if (orderValue) {
    const parsedOrder = Number(orderValue);

    if (!Number.isInteger(parsedOrder)) {
      errors.order = "Informe um número inteiro para a ordem.";
    } else {
      order = parsedOrder;
    }
  }

  if (Object.keys(errors).length > 0 || !isContactLinkType(type)) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    payload: {
      label,
      type,
      url: normalizedUrl,
      order,
      visible: values.visible,
    },
  };
}
