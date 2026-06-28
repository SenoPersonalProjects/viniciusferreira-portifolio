import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseBrowserClientResult =
  | {
      client: SupabaseClient;
      configError: null;
    }
  | {
      client: null;
      configError: string;
    };

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
  };
}

export function getSupabaseBrowserClient(): SupabaseBrowserClientResult {
  const config = getSupabaseBrowserConfig();

  if (!config.url || !config.publishableKey) {
    return {
      client: null,
      configError:
        "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para acessar o painel.",
    };
  }

  if (typeof window === "undefined") {
    return {
      client: null,
      configError: "Cliente Supabase disponível apenas no navegador.",
    };
  }

  browserClient ??= createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return {
    client: browserClient,
    configError: null,
  };
}
