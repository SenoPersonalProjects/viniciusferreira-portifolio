export type AdminProject = {
  id: string;
  titlePt: string;
  titleEn: string;
  slug: string;
  descriptionPt: string;
  descriptionEn: string;
  stack: string[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  frameCode: string | null;
  posterImage: string;
  previewImages: string[];
  published: boolean;
  order: number;
};

export type ProjectPayload = {
  titlePt: string;
  titleEn: string;
  slug: string;
  descriptionPt: string;
  descriptionEn: string;
  stack: string[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  frameCode: string | null;
  posterImage: string;
  previewImages: string[];
  published: boolean;
  order: number;
};

export type ProjectFormValues = {
  titlePt: string;
  titleEn: string;
  slug: string;
  descriptionPt: string;
  descriptionEn: string;
  stack: string;
  repositoryUrl: string;
  liveUrl: string;
  featured: boolean;
  frameCode: string;
  posterImage: string;
  previewImages: string;
  published: boolean;
  order: string;
};

export type ProjectValidationErrors = Partial<
  Record<keyof ProjectFormValues, string>
>;

type ValidationResult =
  | {
      errors: ProjectValidationErrors;
      ok: false;
    }
  | {
      ok: true;
      payload: ProjectPayload;
    };

const urlPattern = /^https?:\/\//i;
const internalOrExternalAssetPattern = /^(\/|https?:\/\/)/i;
const slugPattern = /^[a-z0-9-]+$/;

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

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function validateOptionalUrl(value: string, label: string) {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return {
      error: null,
      value: null,
    };
  }

  if (!urlPattern.test(normalized)) {
    return {
      error: `${label} deve comecar com http:// ou https://.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

function validateAssetPath(value: string, label: string) {
  const normalized = value.trim();

  if (!internalOrExternalAssetPattern.test(normalized)) {
    return {
      error: `${label} deve comecar com /, http:// ou https://.`,
      value: normalized,
    };
  }

  return {
    error: null,
    value: normalized,
  };
}

export function createProjectSlug(title: string) {
  return title
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function parseProjectLines(text: string) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    const item = line.trim();

    if (!item || seen.has(item)) {
      continue;
    }

    seen.add(item);
    items.push(item);
  }

  return items;
}

export function getNextProjectOrder(projects: Array<Pick<AdminProject, "order">>) {
  if (projects.length === 0) {
    return 0;
  }

  return Math.max(...projects.map((project) => project.order)) + 1;
}

export function getProjectFormValues(
  project?: AdminProject | null,
): ProjectFormValues {
  return {
    descriptionEn: project?.descriptionEn ?? "",
    descriptionPt: project?.descriptionPt ?? "",
    featured: project?.featured ?? true,
    frameCode: project?.frameCode ?? "",
    liveUrl: project?.liveUrl ?? "",
    order: typeof project?.order === "number" ? String(project.order) : "",
    posterImage: project?.posterImage ?? "",
    previewImages: project?.previewImages.join("\n") ?? "",
    published: project?.published ?? true,
    repositoryUrl: project?.repositoryUrl ?? "",
    slug: project?.slug ?? "",
    stack: project?.stack.join("\n") ?? "",
    titleEn: project?.titleEn ?? "",
    titlePt: project?.titlePt ?? "",
  };
}

export function sortProjects(projects: AdminProject[]) {
  return [...projects].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.titlePt.localeCompare(b.titlePt);
  });
}

export function getProjectSummary(projects: AdminProject[]) {
  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;

  return {
    featuredCount,
    publishedCount,
    totalCount: projects.length,
  };
}

export function validateProjectForm(
  values: ProjectFormValues,
  projects: Array<Pick<AdminProject, "order">>,
): ValidationResult {
  const errors: ProjectValidationErrors = {};
  const titlePt = validateLength(values.titlePt, "o titulo PT", 3, 100);
  const titleEn = validateLength(values.titleEn, "o titulo EN", 3, 100);
  const descriptionPt = validateLength(
    values.descriptionPt,
    "a descricao PT",
    10,
    500,
  );
  const descriptionEn = validateLength(
    values.descriptionEn,
    "a descricao EN",
    10,
    500,
  );
  const slug = values.slug.trim().toLowerCase();
  const stack = parseProjectLines(values.stack);
  const previewImages = parseProjectLines(values.previewImages);
  const repositoryUrl = validateOptionalUrl(values.repositoryUrl, "Repositorio");
  const liveUrl = validateOptionalUrl(values.liveUrl, "Demo");
  const frameCode = normalizeOptionalText(values.frameCode);
  const posterImage = validateAssetPath(values.posterImage, "Poster");
  const orderValue = values.order.trim();

  if (titlePt.error) {
    errors.titlePt = titlePt.error;
  }

  if (titleEn.error) {
    errors.titleEn = titleEn.error;
  }

  if (descriptionPt.error) {
    errors.descriptionPt = descriptionPt.error;
  }

  if (descriptionEn.error) {
    errors.descriptionEn = descriptionEn.error;
  }

  if (slug.length < 3 || slug.length > 80) {
    errors.slug = "Informe um slug com 3 a 80 caracteres.";
  } else if (!slugPattern.test(slug)) {
    errors.slug = "Use apenas letras minusculas, numeros e hifen.";
  }

  const longStackItem = stack.find((item) => item.length > 40);

  if (stack.length === 0) {
    errors.stack = "Informe pelo menos uma tecnologia.";
  } else if (stack.length > 30) {
    errors.stack = "Informe no maximo 30 tecnologias.";
  } else if (longStackItem) {
    errors.stack = `A tecnologia "${longStackItem}" ultrapassa 40 caracteres.`;
  }

  if (repositoryUrl.error) {
    errors.repositoryUrl = repositoryUrl.error;
  }

  if (liveUrl.error) {
    errors.liveUrl = liveUrl.error;
  }

  if (frameCode && frameCode.length > 24) {
    errors.frameCode = "Informe um codigo com no maximo 24 caracteres.";
  }

  if (!values.posterImage.trim()) {
    errors.posterImage = "Informe o caminho do poster.";
  } else if (posterImage.error) {
    errors.posterImage = posterImage.error;
  }

  const invalidPreviewImage = previewImages.find(
    (image) => !internalOrExternalAssetPattern.test(image),
  );

  if (previewImages.length > 12) {
    errors.previewImages = "Informe no maximo 12 imagens de preview.";
  } else if (invalidPreviewImage) {
    errors.previewImages = `A imagem "${invalidPreviewImage}" deve comecar com /, http:// ou https://.`;
  }

  let order = getNextProjectOrder(projects);

  if (orderValue) {
    const parsedOrder = Number(orderValue);

    if (!Number.isInteger(parsedOrder)) {
      errors.order = "Informe um numero inteiro para a ordem.";
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
      descriptionEn: descriptionEn.value,
      descriptionPt: descriptionPt.value,
      featured: values.featured,
      frameCode,
      liveUrl: liveUrl.value,
      order,
      posterImage: posterImage.value,
      previewImages,
      published: values.published,
      repositoryUrl: repositoryUrl.value,
      slug,
      stack,
      titleEn: titleEn.value,
      titlePt: titlePt.value,
    },
  };
}
