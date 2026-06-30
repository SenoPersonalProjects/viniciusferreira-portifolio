"use client";

import { type FormEvent, useState } from "react";

type AdminLoginFormProps = {
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit: (email: string, password: string) => Promise<void> | void;
};

export function AdminLoginForm({
  errorMessage,
  isSubmitting = false,
  onSubmit,
}: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isDisabled = isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <form className="mt-10 grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Email autorizado
        </span>
        <input
          className="h-12 border border-[var(--color-border)] bg-[var(--color-background)] px-4 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="font-[var(--font-industrial)] text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Senha
        </span>
        <input
          className="h-12 border border-[var(--color-border)] bg-[var(--color-background)] px-4 font-[var(--font-body)] text-sm text-[var(--color-foreground)]"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {errorMessage ? (
        <p
          className="border border-[var(--color-primary)] bg-[var(--color-surface-soft)] p-4 font-[var(--font-mono)] text-xs leading-relaxed text-[var(--color-foreground)]"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        className="primary-action h-12 px-6 text-[10px] uppercase tracking-[0.24em] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isDisabled}
      >
        {isSubmitting ? "Verificando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
