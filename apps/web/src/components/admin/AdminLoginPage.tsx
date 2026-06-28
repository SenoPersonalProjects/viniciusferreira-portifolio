"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { useAdminSession } from "@/hooks/useAdminSession";

export function AdminLoginPage() {
  const router = useRouter();
  const { configError, isLoading, session, signIn } = useAdminSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/admin");
    }
  }, [isLoading, router, session]);

  async function handleSubmit(email: string, password: string) {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (result.ok) {
        router.replace("/admin");
      } else {
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="portfolio-shell min-h-screen px-6 py-12 text-[var(--color-foreground)] md:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center">
        <section className="section-card max-w-xl p-8 md:p-10">
          <p className="section-eyebrow">Admin</p>
          <h1 className="section-title mt-5 text-4xl md:text-6xl">
            Acesso administrativo
          </h1>
          <p className="mt-6 font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Entre com seu email e senha autorizados para gerenciar o conteúdo
            do portfólio.
          </p>
          <AdminLoginForm
            configError={configError}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting || isLoading}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}
