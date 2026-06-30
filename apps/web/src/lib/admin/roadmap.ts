export const ROADMAP_TYPES = ["formacao", "carreira", "projeto"] as const;

export type RoadmapType = (typeof ROADMAP_TYPES)[number];

export type AdminRoadmapItem = {
  id: string;
  startDate: string;
  endDate: string;
  titlePt: string;
  titleEn: string;
  type: RoadmapType;
  summaryPt: string;
  summaryEn: string;
  detailsPt: string;
  detailsEn: string;
  technologies: string[];
  order: number;
  published: boolean;
};

export type RoadmapItemPayload = {
  startDate: string;
  endDate: string;
  titlePt: string;
  titleEn: string;
  type: RoadmapType;
  summaryPt: string;
  summaryEn: string;
  detailsPt: string;
  detailsEn: string;
  technologies: string[];
  order: number;
  published: boolean;
};

export type RoadmapItemFormValues = {
  startDate: string;
  endDate: string;
  titlePt: string;
  titleEn: string;
  type: string;
  summaryPt: string;
  summaryEn: string;
  detailsPt: string;
  detailsEn: string;
  technologies: string;
  order: string;
  published: boolean;
};

export type RoadmapValidationErrors = Partial<
  Record<keyof RoadmapItemFormValues, string>
>;

type ValidationResult =
  | {
      errors: RoadmapValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: RoadmapItemPayload;
    };

function validateLength(
  value: string,
  label: string,
  minLength: number,
  maxLength: number,
) {
  const normalized = value.trim();

  if (normalized.length < minLength || normalized.length > maxLength) {
    return {
      error: `Informe ${label} com ${minLength} a ${maxLength} caracteres.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

function isRoadmapType(type: string): type is RoadmapType {
  return ROADMAP_TYPES.includes(type as RoadmapType);
}

export function parseRoadmapTechnologies(technologiesText: string) {
  const seen = new Set<string>();
  const technologies: string[] = [];

  for (const line of technologiesText.split(/\r?\n/)) {
    const technology = line.trim();

    if (!technology || seen.has(technology)) {
      continue;
    }

    seen.add(technology);
    technologies.push(technology);
  }

  return technologies;
}

export function getNextRoadmapOrder(
  roadmap: Array<Pick<AdminRoadmapItem, "order">>,
) {
  if (roadmap.length === 0) {
    return 0;
  }

  return Math.max(...roadmap.map((item) => item.order)) + 1;
}

export function getRoadmapItemFormValues(
  item?: AdminRoadmapItem | null,
): RoadmapItemFormValues {
  return {
    detailsEn: item?.detailsEn ?? "",
    detailsPt: item?.detailsPt ?? "",
    endDate: item?.endDate ?? "",
    order: typeof item?.order === "number" ? String(item.order) : "",
    published: item?.published ?? true,
    startDate: item?.startDate ?? "",
    summaryEn: item?.summaryEn ?? "",
    summaryPt: item?.summaryPt ?? "",
    technologies: item?.technologies.join("\n") ?? "",
    titleEn: item?.titleEn ?? "",
    titlePt: item?.titlePt ?? "",
    type: item?.type ?? "projeto",
  };
}

export function sortRoadmapItems(roadmap: AdminRoadmapItem[]) {
  return [...roadmap].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.titlePt.localeCompare(b.titlePt);
  });
}

export function getRoadmapTypeSummary(roadmap: AdminRoadmapItem[]) {
  return ROADMAP_TYPES.filter((type) =>
    roadmap.some((item) => item.type === type),
  );
}

export function validateRoadmapItemForm(
  values: RoadmapItemFormValues,
  roadmap: Array<Pick<AdminRoadmapItem, "order">>,
): ValidationResult {
  const errors: RoadmapValidationErrors = {};
  const startDate = validateLength(values.startDate, "o inicio", 2, 30);
  const endDate = validateLength(values.endDate, "o fim", 2, 30);
  const titlePt = validateLength(values.titlePt, "o titulo PT", 3, 100);
  const titleEn = validateLength(values.titleEn, "o titulo EN", 3, 100);
  const summaryPt = validateLength(values.summaryPt, "o resumo PT", 10, 280);
  const summaryEn = validateLength(values.summaryEn, "o resumo EN", 10, 280);
  const detailsPt = validateLength(values.detailsPt, "os detalhes PT", 10, 1000);
  const detailsEn = validateLength(values.detailsEn, "os detalhes EN", 10, 1000);
  const type = values.type.trim();
  const technologies = parseRoadmapTechnologies(values.technologies);
  const longTechnology = technologies.find((technology) => technology.length > 40);
  const orderValue = values.order.trim();

  if (startDate.error) {
    errors.startDate = startDate.error;
  }

  if (endDate.error) {
    errors.endDate = endDate.error;
  }

  if (titlePt.error) {
    errors.titlePt = titlePt.error;
  }

  if (titleEn.error) {
    errors.titleEn = titleEn.error;
  }

  if (!isRoadmapType(type)) {
    errors.type = "Selecione um tipo válido.";
  }

  if (summaryPt.error) {
    errors.summaryPt = summaryPt.error;
  }

  if (summaryEn.error) {
    errors.summaryEn = summaryEn.error;
  }

  if (detailsPt.error) {
    errors.detailsPt = detailsPt.error;
  }

  if (detailsEn.error) {
    errors.detailsEn = detailsEn.error;
  }

  if (technologies.length > 30) {
    errors.technologies = "Informe no máximo 30 tecnologias.";
  } else if (longTechnology) {
    errors.technologies = `A tecnologia "${longTechnology}" ultrapassa 40 caracteres.`;
  }

  let order = getNextRoadmapOrder(roadmap);

  if (orderValue) {
    const parsedOrder = Number(orderValue);

    if (!Number.isInteger(parsedOrder)) {
      errors.order = "Informe um número inteiro para a ordem.";
    } else {
      order = parsedOrder;
    }
  }

  if (Object.keys(errors).length > 0 || !isRoadmapType(type)) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    ok: true,
    payload: {
      detailsEn: detailsEn.value,
      detailsPt: detailsPt.value,
      endDate: endDate.value,
      order,
      published: values.published,
      startDate: startDate.value,
      summaryEn: summaryEn.value,
      summaryPt: summaryPt.value,
      technologies,
      titleEn: titleEn.value,
      titlePt: titlePt.value,
      type,
    },
  };
}
