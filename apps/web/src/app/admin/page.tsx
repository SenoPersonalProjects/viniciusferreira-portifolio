"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminContent = {
  profile: Record<string, unknown> | null;
  contactLinks: Array<Record<string, unknown>>;
  technologies: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  roadmap: Array<Record<string, unknown>>;
  siteCopy: Array<Record<string, unknown>>;
};

const emptyContent: AdminContent = {
  profile: null,
  contactLinks: [],
  technologies: [],
  projects: [],
  roadmap: [],
  siteCopy: [],
};

const templates = {
  contactLinks: {
    label: "Novo link",
    type: "external",
    url: "",
    order: 99,
    visible: true,
  },
  technologies: {
    categoryPt: "Nova categoria",
    categoryEn: "New category",
    items: ["TypeScript"],
    order: 99,
    visible: true,
  },
  projects: {
    titlePt: "Novo projeto",
    titleEn: "New project",
    slug: "novo-projeto",
    descriptionPt: "Descricao do projeto.",
    descriptionEn: "Project description.",
    stack: ["TypeScript"],
    repositoryUrl: "",
    liveUrl: "",
    featured: true,
    frameCode: "VF-000",
    posterImage: "/projects/portfolio/poster.svg",
    previewImages: ["/projects/portfolio/preview-01.svg"],
    published: true,
    order: 99,
  },
  roadmap: {
    startDate: "2026-01",
    endDate: "2026-01",
    titlePt: "Novo marco",
    titleEn: "New milestone",
    type: "projeto",
    summaryPt: "Resumo.",
    summaryEn: "Summary.",
    detailsPt: "Detalhes.",
    detailsEn: "Details.",
    technologies: ["TypeScript"],
    order: 99,
    published: true,
  },
  siteCopy: {
    key: "section.field",
    locale: "pt-BR",
    value: "Texto editavel",
  },
};

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:3333"
  );
}

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  };
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseJson(value: string) {
  return JSON.parse(value) as Record<string, unknown>;
}

function ResourceEditor({
  title,
  endpoint,
  items,
  token,
  onReload,
  template,
}: {
  title: string;
  endpoint: string;
  items: Array<Record<string, unknown>>;
  token: string;
  onReload: () => void;
  template: Record<string, unknown>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const apiBaseUrl = getApiBaseUrl();

  const existingDraftEntries = useMemo(
    () =>
      items.map((item, index) => ({
        key: String(item.id ?? `existing-${index}`),
        item,
        fallback: stringify(item),
      })),
    [items],
  );

  const newDraftEntries = useMemo(
    () =>
      Object.entries(drafts)
        .filter(([key]) => key.startsWith("new-"))
        .map(([key, raw]) => ({
          key,
          item: {} as Record<string, unknown>,
          fallback: raw,
        })),
    [drafts],
  );

  async function saveItem(item: Record<string, unknown>, raw: string) {
    const payload = parseJson(raw);
    const id = typeof item.id === "string" ? item.id : "";
    const url = id
      ? `${apiBaseUrl}/admin/${endpoint}/${encodeURIComponent(id)}`
      : `${apiBaseUrl}/admin/${endpoint}`;

    await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    setDrafts({});
    onReload();
  }

  async function deleteItem(item: Record<string, unknown>) {
    if (typeof item.id !== "string") {
      return;
    }

    await fetch(`${apiBaseUrl}/admin/${endpoint}/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setDrafts({});
    onReload();
  }

  function addDraft() {
    const key = `new-${Date.now()}`;
    setDrafts((current) => ({
      ...current,
      [key]: stringify(template),
    }));
  }

  return (
    <section className="section-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-[var(--font-display)] text-3xl uppercase">
          {title}
        </h2>
        <button
          type="button"
          className="secondary-action h-10 px-4 text-[10px] uppercase tracking-[0.2em]"
          onClick={addDraft}
        >
          Novo
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        {[...existingDraftEntries, ...newDraftEntries].map(
          ({ key, item, fallback }) => {
            const raw = drafts[key] ?? fallback;

            return (
              <article
                key={key}
                className="border border-[var(--color-border)] p-4"
              >
                <textarea
                  className="min-h-64 w-full resize-y border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-[var(--font-mono)] text-xs text-[var(--color-foreground)]"
                  value={raw}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="primary-action h-10 px-4 text-[10px] uppercase tracking-[0.2em]"
                    onClick={() => void saveItem(item, raw)}
                  >
                    Salvar
                  </button>
                  {"id" in item && (
                    <button
                      type="button"
                      className="secondary-action h-10 px-4 text-[10px] uppercase tracking-[0.2em]"
                      onClick={() => void deleteItem(item)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

export default function AdminPage() {
  const apiBaseUrl = getApiBaseUrl();
  const supabaseConfig = getSupabaseConfig();
  const supabase = useMemo(() => {
    if (!supabaseConfig.url || !supabaseConfig.publishableKey) {
      return null;
    }

    return createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }, [supabaseConfig.publishableKey, supabaseConfig.url]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<AdminContent>(emptyContent);
  const [profileDraft, setProfileDraft] = useState("{}");
  const [status, setStatus] = useState(
    "Entre com email e senha do Supabase Auth.",
  );

  const token = session?.access_token ?? "";
  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  const loadContent = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await fetch(`${apiBaseUrl}/admin/content`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      setStatus(`Falha ao carregar: ${response.status}`);
      return;
    }

    const data = (await response.json()) as AdminContent;
    setContent(data);
    setProfileDraft(stringify(data.profile ?? {}));
    setStatus("Conteudo carregado.");
  }, [apiBaseUrl, authHeaders, token]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session ?? null);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(
        nextSession
          ? "Sessao Supabase ativa."
          : "Entre com email e senha do Supabase Auth.",
      );
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => window.clearTimeout(handle);
  }, [loadContent]);

  async function login() {
    if (!supabase) {
      setStatus("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setStatus(error?.message ?? "Login recusado pelo Supabase.");
      return;
    }

    setPassword("");
    setSession(data.session);
    setStatus("Login Supabase realizado.");
  }

  async function logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setContent(emptyContent);
    setProfileDraft("{}");
    setStatus("Sessao encerrada.");
  }

  async function saveProfile() {
    await fetch(`${apiBaseUrl}/admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(parseJson(profileDraft)),
    });
    await loadContent();
  }

  return (
    <main className="portfolio-shell min-h-screen px-6 py-10 text-[var(--color-foreground)] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="section-eyebrow">Admin</p>
        <h1 className="section-title mt-5 text-5xl md:text-7xl">
          Conteudo gerenciavel
        </h1>
        <p className="mt-5 max-w-3xl font-[var(--font-body)] text-[var(--color-muted)]">
          MVP administrativo para editar portfolio, contatos, tecnologias,
          projetos e roadmap usando Supabase Auth e a API NestJS.
        </p>

        <section className="section-card mt-10 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
          <label className="grid gap-2">
            <span className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em]">
              Email admin
            </span>
            <input
              className="border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 font-[var(--font-mono)] text-sm"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em]">
              Senha Supabase
            </span>
            <input
              className="border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 font-[var(--font-mono)] text-sm"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="primary-action h-11 px-6 text-[10px] uppercase tracking-[0.2em]"
            disabled={!supabase}
            onClick={() => void login()}
          >
            Entrar
          </button>
          <button
            type="button"
            className="secondary-action h-11 px-6 text-[10px] uppercase tracking-[0.2em]"
            disabled={!token}
            onClick={() => void loadContent()}
          >
            Recarregar
          </button>
          <p className="font-[var(--font-mono)] text-xs text-[var(--color-muted)] md:col-span-4">
            {status}
            {session?.user.email ? ` Usuario: ${session.user.email}.` : ""}
          </p>
          {token && (
            <button
              type="button"
              className="secondary-action h-11 px-6 text-[10px] uppercase tracking-[0.2em] md:col-span-4 md:w-fit"
              onClick={() => void logout()}
            >
              Sair
            </button>
          )}
        </section>

        {token && (
          <div className="mt-8 grid gap-8">
            <section className="section-card p-6">
              <h2 className="font-[var(--font-display)] text-3xl uppercase">
                Perfil
              </h2>
              <textarea
                className="mt-5 min-h-80 w-full resize-y border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-[var(--font-mono)] text-xs text-[var(--color-foreground)]"
                value={profileDraft}
                onChange={(event) => setProfileDraft(event.target.value)}
              />
              <button
                type="button"
                className="primary-action mt-3 h-10 px-4 text-[10px] uppercase tracking-[0.2em]"
                onClick={() => void saveProfile()}
              >
                Salvar perfil
              </button>
            </section>

            <ResourceEditor
              title="Contatos"
              endpoint="contact-links"
              items={content.contactLinks}
              token={token}
              onReload={() => void loadContent()}
              template={templates.contactLinks}
            />
            <ResourceEditor
              title="Tecnologias"
              endpoint="technologies"
              items={content.technologies}
              token={token}
              onReload={() => void loadContent()}
              template={templates.technologies}
            />
            <ResourceEditor
              title="Projetos"
              endpoint="projects"
              items={content.projects}
              token={token}
              onReload={() => void loadContent()}
              template={templates.projects}
            />
            <ResourceEditor
              title="Roadmap"
              endpoint="roadmap"
              items={content.roadmap}
              token={token}
              onReload={() => void loadContent()}
              template={templates.roadmap}
            />
            <ResourceEditor
              title="Textos avulsos"
              endpoint="site-copy"
              items={content.siteCopy}
              token={token}
              onReload={() => void loadContent()}
              template={templates.siteCopy}
            />
          </div>
        )}
      </div>
    </main>
  );
}
