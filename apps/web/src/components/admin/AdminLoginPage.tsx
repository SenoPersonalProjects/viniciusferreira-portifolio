"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { useAdminSession } from "@/hooks/useAdminSession";

export function AdminLoginPage() {
  const router = useRouter();
  const { isLoading, session, signIn } = useAdminSession();
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
    <main className="portfolio-shell grid min-h-svh place-items-center overflow-x-hidden px-4 py-8 text-[var(--color-foreground)] sm:px-6 md:px-10">
      <div className="grid w-full max-w-2xl place-items-center">
        <section className="section-card w-full p-6 sm:p-8 md:p-10">
          <p className="section-eyebrow">Admin</p>
          <h1 className="section-title mt-5 max-w-full text-balance break-words text-4xl leading-none sm:text-5xl md:text-[3.5rem]">
            Acesso administrativo
          </h1>
          <p className="mt-6 font-[var(--font-body)] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Entre com seu email e senha autorizados para gerenciar o conteúdo
            do portfólio.
          </p>
          <AdminLoginForm
            errorMessage={errorMessage}
            isSubmitting={isSubmitting || isLoading}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}
