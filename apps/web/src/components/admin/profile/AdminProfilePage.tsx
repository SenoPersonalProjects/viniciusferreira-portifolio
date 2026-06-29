"use client";

import { useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminApiError, adminApiFetch } from "@/lib/admin/adminApi";
import type { AdminProfile, ProfilePayload } from "@/lib/admin/profile";

import { ProfileForm } from "./ProfileForm";

type AdminContent = {
  profile: AdminProfile | null;
};

type PageStatus = "idle" | "loading" | "ready" | "error";

function getAdminErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) {
    if (error.code === "unauthorized" || error.code === "forbidden") {
      return "A API recusou a sessão. Confirme o login e a allowlist SUPABASE_ADMIN_EMAILS.";
    }

    if (error.code === "unavailable") {
      return "API administrativa indisponível. Confirme se o backend está em execução.";
    }

    return error.message;
  }

  return "Não foi possível concluir a operação de perfil.";
}

export function AdminProfilePage() {
  const { accessToken } = useAdminSession();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [status, setStatus] = useState<PageStatus>("idle");

  const loadProfile = useCallback(async () => {
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

      setProfile(data?.profile ?? null);
      setStatus("ready");
    } catch (loadError) {
      setError(getAdminErrorMessage(loadError));
      setStatus("error");
    }
  }, [accessToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadProfile();
    });
  }, [loadProfile]);

  async function handleSubmit(payload: ProfilePayload) {
    if (!accessToken) {
      setError("Sessão administrativa ausente.");
      return;
    }

    setError(null);
    setIsSaving(true);
    setNotice(null);

    try {
      const updatedProfile = await adminApiFetch<AdminProfile>(
        "/admin/profile",
        {
          body: JSON.stringify(payload),
          method: "PUT",
        },
        accessToken,
      );

      setProfile(updatedProfile);
      setNotice("Perfil atualizado com sucesso.");
    } catch (saveError) {
      setError(getAdminErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-8">
      <section className="section-card p-7 md:p-10">
        <p className="section-eyebrow">Admin / Perfil</p>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="section-title text-4xl md:text-6xl">
              Gerenciar perfil
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Edite as informações principais que identificam o portfólio nas
              experiências em português e inglês.
            </p>
          </div>
          <button
            className="secondary-action h-11 px-5 text-[10px] uppercase tracking-[0.2em]"
            disabled={status === "loading"}
            onClick={() => void loadProfile()}
            type="button"
          >
            {status === "loading" ? "Carregando..." : "Recarregar"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 font-[var(--font-mono)] text-xs text-[var(--color-muted)]">
          {status === "loading" ? <p>Carregando perfil...</p> : null}
          {status === "ready" && !profile ? (
            <p>
              Nenhum perfil salvo ainda. O primeiro salvamento criará o registro
              principal.
            </p>
          ) : null}
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

      {status === "loading" && !profile ? (
        <div className="section-card p-6">
          <p className="font-[var(--font-body)] text-sm text-[var(--color-muted)]">
            Preparando formulário...
          </p>
        </div>
      ) : (
        <ProfileForm
          initialValue={profile}
          isSubmitting={isSaving}
          key={profile?.id ?? "new-profile"}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
