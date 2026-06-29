"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";

const adminNavItems = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/profile", label: "Perfil" },
  { href: "/admin/contacts", label: "Contatos" },
  { href: "/admin/technologies", label: "Stack" },
  { href: "/admin/roadmap", label: "Trajetória" },
  { href: "/admin/projects", label: "Projetos" },
  { href: "/admin/site-copy", label: "Textos" },
  { href: "/admin/calibration", label: "Calibração 3D" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, session, signOut, user } = useAdminSession();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/admin/login");
    }
  }, [isLoading, router, session]);

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  if (isLoading) {
    return (
      <main className="portfolio-shell min-h-screen px-6 py-10 text-[var(--color-foreground)] md:px-10">
        <section className="section-card mx-auto max-w-3xl p-8">
          <p className="section-eyebrow">Admin</p>
          <h1 className="section-title mt-4 text-4xl">Validando sessão</h1>
          <p className="mt-5 font-[var(--font-body)] text-[var(--color-muted)]">
            Conferindo a sessão Supabase no navegador.
          </p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="portfolio-shell min-h-screen px-6 py-10 text-[var(--color-foreground)] md:px-10">
        <section className="section-card mx-auto max-w-3xl p-8">
          <p className="section-eyebrow">Admin</p>
          <h1 className="section-title mt-4 text-4xl">
            Redirecionando para login
          </h1>
          <p className="mt-5 font-[var(--font-body)] text-[var(--color-muted)]">
            Esta área exige uma sessão administrativa.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="portfolio-shell min-h-screen text-[var(--color-foreground)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 md:grid-cols-[18rem_1fr] md:px-10">
        <aside className="section-card h-fit p-5 md:sticky md:top-6">
          <Link
            href="/"
            className="font-[var(--font-display)] text-3xl text-[var(--color-foreground)]"
          >
            V.F.S.
          </Link>
          <p className="mt-4 font-[var(--font-body)] text-sm leading-relaxed text-[var(--color-muted)]">
            Painel administrativo com sessão Supabase. A autorização real dos
            dados continua no AdminGuard da API.
          </p>

          <nav aria-label="Navegação administrativa" className="mt-8 grid gap-3">
            {adminNavItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border px-4 py-3 font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.22em] transition ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-surface-soft)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-foreground)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-[var(--color-border)] pt-5">
            <p className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Usuário
            </p>
            <p className="mt-2 break-all font-[var(--font-mono)] text-xs text-[var(--color-foreground)]">
              {user?.email ?? "Sessão ativa"}
            </p>
            <button
              type="button"
              className="secondary-action mt-5 h-10 w-full px-4 text-[10px] uppercase tracking-[0.2em]"
              onClick={() => void handleSignOut()}
            >
              Sair
            </button>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
