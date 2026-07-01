"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";
import {
  adminApiFetch,
  getAdminApiErrorMessage,
} from "@/lib/admin/adminApi";
import {
  type AdminProject,
  type ProjectPayload,
  getProjectSummary,
  sortProjects,
} from "@/lib/admin/projects";

import { ProjectForm } from "./ProjectForm";
import { ProjectList } from "./ProjectList";

type AdminContent = {
  projects: AdminProject[];
};

type PageStatus = "idle" | "loading" | "ready" | "error";

const emptyContent: AdminContent = {
  projects: [],
};

function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

function getAdminErrorMessage(error: unknown) {
  return getAdminApiErrorMessage(
    error,
    "Não foi possível concluir a operação de projetos.",
  );
}

function getProjectsSummary(projects: AdminProject[]) {
  const summary = getProjectSummary(projects);

  return `${pluralize(summary.totalCount, "projeto", "projetos")}, ${pluralize(
    summary.publishedCount,
    "publicado",
    "publicados",
  )}, ${pluralize(summary.featuredCount, "destacado", "destacados")}`;
}

export function AdminProjectsPage() {
  const { accessToken } = useAdminSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [status, setStatus] = useState<PageStatus>("idle");

  const sortedProjects = useMemo(() => sortProjects(projects), [projects]);

  const loadProjects = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const data = await adminApiFetch<AdminContent>(
        "/admin/content",
        undefined,
        accessToken,
      );

      setProjects(sortProjects(data?.projects ?? emptyContent.projects));
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadProjects();
    });
  }, [loadProjects]);

  async function handleSubmit(payload: ProjectPayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    setError(null);
    setIsSaving(true);
    setNotice(null);

    try {
      if (editingProject) {
        const updated = await adminApiFetch<AdminProject>(
          `/admin/projects/${encodeURIComponent(editingProject.id)}`,
          {
            body: JSON.stringify(payload),
            method: "PUT",
          },
          accessToken,
        );

        setProjects((current) =>
          sortProjects(
            current.map((project) =>
              project.id === editingProject.id ? updated : project,
            ),
          ),
        );
        setEditingProject(null);
        setNotice("Projeto atualizado com sucesso.");
        return;
      }

      const created = await adminApiFetch<AdminProject>(
        "/admin/projects",
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
        accessToken,
      );

      setProjects((current) => sortProjects([...current, created]));
      setNotice("Projeto criado com sucesso.");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project: AdminProject) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    const shouldDelete = window.confirm(
      `Excluir o projeto "${project.titlePt}"? Esta ação não pode ser desfeita.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(project.id);
    setError(null);
    setNotice(null);

    try {
      await adminApiFetch<{ deleted: boolean }>(
        `/admin/projects/${encodeURIComponent(project.id)}`,
        {
          method: "DELETE",
        },
        accessToken,
      );

      setProjects((current) =>
        current.filter((currentProject) => currentProject.id !== project.id),
      );

      if (editingProject?.id === project.id) {
        setEditingProject(null);
      }

      setNotice("Projeto excluído com sucesso.");
    } catch (deleteError) {
      setError(getAdminErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Projetos</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar projetos
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Controle os projetos exibidos no Film Reel público sem alterar a
              lógica do carrossel ou os assets existentes.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadProjects()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          <p>{getProjectsSummary(sortedProjects)}</p>
          {notice ? (
            <p className="text-[var(--color-foreground)]" role="status">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="text-[var(--color-foreground)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section aria-label="Lista de projetos" className="grid gap-4">
          {status === "loading" && sortedProjects.length === 0 ? (
            <div className="section-card p-6">
              <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
                Carregando projetos...
              </p>
            </div>
          ) : (
            <ProjectList
              deletingId={deletingId}
              editingId={editingProject?.id ?? null}
              onDelete={(project) => void handleDelete(project)}
              onEdit={setEditingProject}
              projects={sortedProjects}
            />
          )}
        </section>

        <aside className="h-fit xl:sticky xl:top-6">
          <ProjectForm
            initialValue={editingProject}
            isSubmitting={isSaving}
            key={editingProject?.id ?? "new-project"}
            onCancelEdit={() => setEditingProject(null)}
            onSubmit={handleSubmit}
            projects={sortedProjects}
          />
        </aside>
      </div>
    </div>
  );
}
