import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

import {
  createOptionsResponse,
  getFunctionPath,
  handleError,
  HttpError,
  jsonResponse,
  requireMethod,
} from "../_shared/http.ts";
import { mapPublicDossier } from "../_shared/dossier.ts";
import {
  assertMany,
  assertSingle,
  getSupabaseServerClient,
} from "../_shared/supabase.ts";

type Locale = "pt-BR" | "en";
type DossierLocale = "pt" | "en";

function resolveLocale(locale?: string | null): Locale {
  return locale === "en" ? "en" : "pt-BR";
}

function resolveDossierLocale(locale?: string | null): DossierLocale {
  if (!locale) {
    return "pt";
  }

  const normalized = locale.trim();

  if (normalized === "pt" || normalized === "en") {
    return normalized;
  }

  throw new HttpError(400, "Locale do dossie invalido");
}

function resolveSiteCopyLocale(locale?: string | null): Locale {
  if (!locale) {
    return "pt-BR";
  }

  const normalized = locale.trim();

  if (normalized === "pt-BR" || normalized === "en") {
    return normalized;
  }

  throw new HttpError(400, "Locale de textos invalido");
}

function isEmailUrl(url: string) {
  return url.startsWith("mailto:") ? url.replace("mailto:", "") : "";
}

async function getPublicDossier(request: Request) {
  requireMethod(request, "GET");

  const url = new URL(request.url);
  const locale = resolveDossierLocale(url.searchParams.get("locale"));
  const supabase = getSupabaseServerClient();
  const dossier = await assertSingle<Record<string, unknown>>(
    supabase.from("DossierContent").select("*").eq("locale", locale).maybeSingle(),
  );

  if (!dossier) {
    return jsonResponse(request, {
      content: null,
      source: "empty",
    });
  }

  return jsonResponse(request, {
    content: mapPublicDossier(dossier),
    source: "database",
  });
}

async function getPublicSiteCopy(request: Request) {
  requireMethod(request, "GET");

  const url = new URL(request.url);
  const locale = resolveSiteCopyLocale(url.searchParams.get("locale"));
  const supabase = getSupabaseServerClient();
  const items = await assertMany<{
    key: string;
    locale: Locale;
    value: string;
  }>(
    supabase
      .from("SiteCopy")
      .select("key, locale, value")
      .eq("locale", locale)
      .order("key", { ascending: true }),
  );

  return jsonResponse(request, {
    items: items.map((item) => ({
      key: item.key,
      locale: item.locale,
      value: item.value,
    })),
    source: items.length > 0 ? "database" : "empty",
  });
}

async function getPublicPortfolio(request: Request) {
  requireMethod(request, "GET");

  const url = new URL(request.url);
  const locale = resolveLocale(url.searchParams.get("locale"));
  const supabase = getSupabaseServerClient();

  const [profiles, contactLinks, technologies, projects, roadmap] =
    await Promise.all([
      assertMany<Record<string, unknown>>(
        supabase
          .from("Profile")
          .select("*")
          .order("updatedAt", { ascending: false })
          .limit(1),
      ),
      assertMany<Record<string, unknown>>(
        supabase
          .from("ContactLink")
          .select("*")
          .order("order", { ascending: true }),
      ),
      assertMany<Record<string, unknown>>(
        supabase
          .from("Technology")
          .select("*")
          .eq("visible", true)
          .order("order", { ascending: true }),
      ),
      assertMany<Record<string, unknown>>(
        supabase
          .from("Project")
          .select("*")
          .order("order", { ascending: true }),
      ),
      assertMany<Record<string, unknown>>(
        supabase
          .from("RoadmapItem")
          .select("*")
          .order("order", { ascending: true }),
      ),
    ]);

  const profile = profiles[0];
  const github =
    contactLinks.find((link) => link.type === "github")?.url ?? "";
  const linkedin =
    contactLinks.find((link) => link.type === "linkedin")?.url ?? "";
  const email = isEmailUrl(
    String(contactLinks.find((link) => link.type === "email")?.url ?? ""),
  );

  return jsonResponse(request, {
    contactLinks: contactLinks.map((link) => ({
      id: String(link.id),
      label: String(link.label ?? ""),
      order: Number(link.order ?? 0),
      type: link.type,
      url: String(link.url ?? ""),
      visible: Boolean(link.visible),
    })),
    profile: {
      headline:
        locale === "en"
          ? String(profile?.headlineEn ?? "")
          : String(profile?.headlinePt ?? ""),
      location:
        locale === "en"
          ? String(profile?.locationEn ?? "Brazil")
          : String(profile?.locationPt ?? "Brasil"),
      name: String(profile?.name ?? "Vinicius Ferreira"),
      role:
        locale === "en"
          ? String(profile?.roleEn ?? "")
          : String(profile?.rolePt ?? ""),
      socialLinks: {
        email,
        github: String(github),
        linkedin: String(linkedin),
      },
      summary:
        locale === "en"
          ? String(profile?.summaryEn ?? "")
          : String(profile?.summaryPt ?? ""),
    },
    projects: projects.map((project) => ({
      description:
        locale === "en"
          ? String(project.descriptionEn ?? "")
          : String(project.descriptionPt ?? ""),
      featured: Boolean(project.featured),
      frameCode: String(project.frameCode ?? ""),
      liveUrl: String(project.liveUrl ?? ""),
      order: Number(project.order ?? 0),
      posterImage: String(project.posterImage ?? ""),
      previewImages: Array.isArray(project.previewImages)
        ? project.previewImages
        : [],
      published: Boolean(project.published),
      repositoryUrl: String(project.repositoryUrl ?? ""),
      slug: String(project.slug ?? ""),
      stack: Array.isArray(project.stack) ? project.stack : [],
      title:
        locale === "en"
          ? String(project.titleEn ?? "")
          : String(project.titlePt ?? ""),
    })),
    roadmap: roadmap.map((item) => ({
      details:
        locale === "en"
          ? String(item.detailsEn ?? "")
          : String(item.detailsPt ?? ""),
      endDate: String(item.endDate ?? ""),
      id: String(item.id),
      order: Number(item.order ?? 0),
      published: Boolean(item.published),
      startDate: String(item.startDate ?? ""),
      summary:
        locale === "en"
          ? String(item.summaryEn ?? "")
          : String(item.summaryPt ?? ""),
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      title:
        locale === "en"
          ? String(item.titleEn ?? "")
          : String(item.titlePt ?? ""),
      type: item.type,
    })),
    technologies: technologies.map((technology) => ({
      category:
        locale === "en"
          ? String(technology.categoryEn ?? "")
          : String(technology.categoryPt ?? ""),
      id: String(technology.id),
      items: Array.isArray(technology.items) ? technology.items : [],
      order: Number(technology.order ?? 0),
    })),
  });
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return createOptionsResponse(request);
  }

  try {
    const path = getFunctionPath(request, "portfolio");

    if (path === "/" || path === "") {
      return await getPublicPortfolio(request);
    }

    if (path === "/dossier") {
      return await getPublicDossier(request);
    }

    if (path === "/site-copy") {
      return await getPublicSiteCopy(request);
    }

    throw new HttpError(404, "Rota publica nao encontrada");
  } catch (error) {
    return handleError(request, error);
  }
});
