"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";
import { useAdminSession } from "@/hooks/useAdminSession";

type AdminContent = {
  contactLinks: Array<Record<string, unknown>>;
  dossierContent: Array<Record<string, unknown>>;
  profile: Record<string, unknown> | null;
  projects: Array<Record<string, unknown>>;
  roadmap: Array<Record<string, unknown>>;
  siteCopy: Array<Record<string, unknown>>;
  technologies: Array<Record<string, unknown>>;
};

type DashboardState =
  | { data: AdminContent | null; error: null; status: "idle" | "loading" }
  | { data: AdminContent | null; error: string; status: "error" }
  | { data: AdminContent; error: null; status: "ready" };

const emptyAdminContent: AdminContent = {
  contactLinks: [],
  dossierContent: [],
  profile: null,
  projects: [],
  roadmap: [],
  siteCopy: [],
  technologies: [],
};

function getErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) {
    if (error.code === "unauthorized" || error.code === "forbidden") {
      return "A API recusou a sessão. Confirme o login e a allowlist SUPABASE_ADMIN_EMAILS.";
    }

    if (error.code === "unavailable") {
      return "API administrativa indisponível. Confirme se o backend está em execução.";
    }

    return error.message;
  }

  return "Não foi possível carregar o resumo administrativo.";
}

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getProfileSummary(profile: Record<string, unknown> | null) {
  if (!profile) {
    return "Nome, cargo e localização não configurados";
  }

  const name = getStringValue(profile.name) ?? "Nome não configurado";
  const role = getStringValue(profile.rolePt) ?? "Cargo PT não configurado";
  const location =
    getStringValue(profile.locationPt) ?? "Localização PT não configurada";

  return `${name}, ${role}, ${location}`;
}

function getVisibleContactSummary(contactLinks: Array<Record<string, unknown>>) {
  const visibleCount = contactLinks.filter((link) => link.visible).length;

  return `${pluralize(contactLinks.length, "link", "links")}, ${pluralize(
    visibleCount,
    "visível",
    "visíveis",
  )}`;
}

function getVisibleTechnologySummary(
  technologies: Array<Record<string, unknown>>,
) {
  const visibleCount = technologies.filter(
    (technology) => technology.visible,
  ).length;
  const itemsCount = technologies.reduce((total, technology) => {
    return total + (Array.isArray(technology.items) ? technology.items.length : 0);
  }, 0);

  return `${pluralize(technologies.length, "grupo", "grupos")}, ${pluralize(
    visibleCount,
    "visível",
    "visíveis",
  )}, ${pluralize(itemsCount, "item", "itens")}`;
}

function getRoadmapSummary(roadmap: Array<Record<string, unknown>>) {
  const publishedCount = roadmap.filter((item) => item.published).length;
  const types = Array.from(
    new Set(
      roadmap
        .map((item) => (typeof item.type === "string" ? item.type : ""))
        .filter(Boolean),
    ),
  );
  const typeSummary = types.length > 0 ? `, ${types.join(", ")}` : "";

  return `${pluralize(roadmap.length, "item", "itens")}, ${pluralize(
    publishedCount,
    "publicado",
    "publicados",
  )}${typeSummary}`;
}

function getProjectSummary(projects: Array<Record<string, unknown>>) {
  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;

  return `${pluralize(projects.length, "projeto", "projetos")}, ${pluralize(
    publishedCount,
    "publicado",
    "publicados",
  )}, ${pluralize(featuredCount, "destacado", "destacados")}`;
}

function getSiteCopySummary(siteCopy: Array<Record<string, unknown>>) {
  const locales = Array.from(
    new Set(
      siteCopy
        .map((record) => (typeof record.locale === "string" ? record.locale : ""))
        .filter(Boolean),
    ),
  );
  const uniqueKeys = new Set(
    siteCopy
      .map((record) => (typeof record.key === "string" ? record.key : ""))
      .filter(Boolean),
  );
  const localeSummary =
    locales.length > 0 ? `, locales: ${locales.join(", ")}` : "";

  return `${pluralize(siteCopy.length, "registro", "registros")}, ${pluralize(
    uniqueKeys.size,
    "chave única",
    "chaves únicas",
  )}${localeSummary}`;
}

function getDossierSummary(dossierContent: Array<Record<string, unknown>>) {
  const locales = Array.from(
    new Set(
      dossierContent
        .map((record) => (typeof record.locale === "string" ? record.locale : ""))
        .filter(Boolean),
    ),
  );

  if (locales.length === 0) {
    return "Persistência admin ativa, sem registro no banco";
  }

  return `Persistência admin ativa, locales no banco: ${locales.join(", ")}`;
}

export function AdminDashboard() {
  const { accessToken } = useAdminSession();
  const [state, setState] = useState<DashboardState>({
    data: null,
    error: null,
    status: "idle",
  });

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setState((current) => ({
      data: current.data,
      error: null,
      status: "loading",
    }));

    try {
      const data = await adminApiFetch<AdminContent>(
        "/admin/content",
        undefined,
        accessToken,
      );

      setState({
        data: data ?? emptyAdminContent,
        error: null,
        status: "ready",
      });
    } catch (error) {
      setState({
        data: null,
        error: getErrorMessage(error),
        status: "error",
      });
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboard();
    });
  }, [loadDashboard]);

  const content = state.data ?? emptyAdminContent;
  const modules = useMemo(
    () => [
      {
        actionLabel: "Gerenciar",
        description: getProfileSummary(content.profile),
        href: "/admin/profile",
        label: "Perfil",
        status: content.profile ? "Editável" : "Sem dados",
      },
      {
        actionLabel: "Gerenciar",
        description: getVisibleContactSummary(content.contactLinks),
        href: "/admin/contacts",
        label: "Contatos",
        status: "Editável",
      },
      {
        actionLabel: "Gerenciar",
        description: getVisibleTechnologySummary(content.technologies),
        href: "/admin/technologies",
        label: "Stack",
        status: "Editável",
      },
      {
        actionLabel: "Gerenciar",
        description: getRoadmapSummary(content.roadmap),
        href: "/admin/roadmap",
        label: "Trajetória",
        status: "Editável",
      },
      {
        actionLabel: "Gerenciar",
        description: getProjectSummary(content.projects),
        href: "/admin/projects",
        label: "Projetos",
        status: "Editável",
      },
      {
        actionLabel: "Gerenciar",
        description: getSiteCopySummary(content.siteCopy),
        href: "/admin/site-copy",
        label: "Textos",
        status: "Editável",
      },
      {
        actionLabel: "Gerenciar",
        description: getDossierSummary(content.dossierContent),
        href: "/admin/dossier",
        label: "Dossiê",
        status: "Persistente",
      },
      {
        description: "Metadados e preview social serão editáveis depois",
        label: "SEO",
        status: "Planejado",
      },
      {
        description: "Ferramenta local com presets e localStorage existentes",
        href: "/admin/calibration",
        label: "Calibração 3D",
        status: "Ativo",
      },
    ],
    [content],
  );

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Painel administrativo
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Fundação segura para gerenciar o portfólio. Nesta etapa, o painel
              apenas lê o resumo do conteúdo e prepara a navegação dos módulos.
            </p>
          </div>
          <button
            type="button"
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            onClick={() => void loadDashboard()}
          >
            Recarregar
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>
            Segurança: a navegação client-side melhora a experiência, mas a API
            continua protegida pelo AdminGuard com Supabase JWT e allowlist.
          </p>
          {state.status === "loading" ? <p>Carregando resumo...</p> : null}
          {state.status === "error" ? (
            <p className="text-[var(--color-foreground)]" role="alert">
              {state.error}
            </p>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Módulos administrativos"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {modules.map((module) => {
          const card = (
            <article className="section-card h-full p-6 transition hover:border-[var(--color-primary)]">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-[var(--font-display)] text-3xl uppercase text-[var(--color-foreground)]">
                  {module.label}
                </h2>
                <span className="border border-[var(--color-border)] px-3 py-1 font-[var(--font-industrial)] text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {module.status}
                </span>
              </div>
              <p className="mt-5 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
                {module.description}
              </p>
              {module.actionLabel ? (
                <p className="mt-5 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] text-[var(--color-primary)]">
                  {module.actionLabel}
                </p>
              ) : null}
            </article>
          );

          return module.href ? (
            <Link key={module.label} href={module.href}>
              {card}
            </Link>
          ) : (
            <div key={module.label}>{card}</div>
          );
        })}
      </section>
    </div>
  );
}
