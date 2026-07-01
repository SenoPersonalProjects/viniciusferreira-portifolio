import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

import { getBearerToken, HttpError } from "./http.ts";

export function getSupabaseServerClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  const supabaseSecret =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");

  if (!supabaseUrl || !supabaseSecret) {
    throw new HttpError(500, "Supabase server-side nao configurado");
  }

  return createClient(supabaseUrl, supabaseSecret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getAllowedAdminEmails() {
  return (Deno.env.get("ADMIN_EMAILS") ?? Deno.env.get("SUPABASE_ADMIN_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new HttpError(401, "Token admin ausente");
  }

  const allowedEmails = getAllowedAdminEmails();

  if (allowedEmails.length === 0) {
    throw new HttpError(401, "Allowlist admin nao configurada");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new HttpError(401, "Token Supabase invalido");
  }

  const email = data.user.email?.trim().toLowerCase() ?? "";

  if (!email) {
    throw new HttpError(401, "Token Supabase sem email");
  }

  if (!allowedEmails.includes(email)) {
    throw new HttpError(403, "Email admin nao autorizado");
  }

  return {
    email,
    supabase,
    user: data.user,
  };
}

export async function assertSingle<T>(
  operation: PromiseLike<{ data: T | null; error: { message: string } | null }>,
) {
  const { data, error } = await operation;

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data;
}

export async function assertMany<T>(
  operation: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const { data, error } = await operation;

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data ?? [];
}

export function createId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
