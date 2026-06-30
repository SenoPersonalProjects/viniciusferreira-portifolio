export type AdminTechnology = {
  id: string;
  categoryPt: string;
  categoryEn: string;
  items: string[];
  order: number;
  visible: boolean;
};

export type TechnologyPayload = {
  categoryPt: string;
  categoryEn: string;
  items: string[];
  order: number;
  visible: boolean;
};

export type TechnologyFormValues = {
  categoryPt: string;
  categoryEn: string;
  items: string;
  order: string;
  visible: boolean;
};

export type TechnologyValidationErrors = Partial<
  Record<keyof TechnologyFormValues, string>
>;

type ValidationResult =
  | {
      errors: TechnologyValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: TechnologyPayload;
    };

function normalizeText(value: string) {
  return value.trim();
}

function validateCategory(value: string, label: string) {
  const normalized = normalizeText(value);

  if (normalized.length < 2 || normalized.length > 60) {
    return {
      error: `Informe ${label} com 2 a 60 caracteres.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

export function parseTechnologyItems(itemsText: string) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const line of itemsText.split(/\r?\n/)) {
    const item = line.trim();

    if (!item || seen.has(item)) {
      continue;
    }

    seen.add(item);
    items.push(item);
  }

  return items;
}

export function getNextTechnologyOrder(
  technologies: Array<Pick<AdminTechnology, "order">>,
) {
  if (technologies.length === 0) {
    return 0;
  }

  return Math.max(...technologies.map((technology) => technology.order)) + 1;
}

export function getTechnologyFormValues(
  technology?: AdminTechnology | null,
): TechnologyFormValues {
  return {
    categoryEn: technology?.categoryEn ?? "",
    categoryPt: technology?.categoryPt ?? "",
    items: technology?.items.join("\n") ?? "",
    order:
      typeof technology?.order === "number" ? String(technology.order) : "",
    visible: technology?.visible ?? true,
  };
}

export function sortTechnologies(technologies: AdminTechnology[]) {
  return [...technologies].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.categoryPt.localeCompare(b.categoryPt);
  });
}

export function getTechnologyItemsCount(technologies: AdminTechnology[]) {
  return technologies.reduce(
    (total, technology) => total + technology.items.length,
    0,
  );
}

export function validateTechnologyForm(
  values: TechnologyFormValues,
  technologies: Array<Pick<AdminTechnology, "order">>,
): ValidationResult {
  const errors: TechnologyValidationErrors = {};
  const categoryPt = validateCategory(values.categoryPt, "a categoria PT");
  const categoryEn = validateCategory(values.categoryEn, "a categoria EN");
  const items = parseTechnologyItems(values.items);
  const longItem = items.find((item) => item.length > 40);
  const orderValue = values.order.trim();

  if (categoryPt.error) {
    errors.categoryPt = categoryPt.error;
  }

  if (categoryEn.error) {
    errors.categoryEn = categoryEn.error;
  }

  if (items.length === 0) {
    errors.items = "Informe pelo menos um item de tecnologia.";
  } else if (items.length > 30) {
    errors.items = "Informe no maximo 30 itens.";
  } else if (longItem) {
    errors.items = `O item "${longItem}" ultrapassa 40 caracteres.`;
  }

  let order = getNextTechnologyOrder(technologies);

  if (orderValue) {
    const parsedOrder = Number(orderValue);

    if (!Number.isInteger(parsedOrder)) {
      errors.order = "Informe um número inteiro para a ordem.";
    } else {
      order = parsedOrder;
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
    payload: {
      categoryEn: categoryEn.value,
      categoryPt: categoryPt.value,
      items,
      order,
      visible: values.visible,
    },
  };
}
