"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SignInResult =
  | {
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

export type AdminAuthContextValue = {
  accessToken: string;
  configError: string | null;
  isLoading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  user: User | null;
};

export const AdminAuthContext =
  createContext<AdminAuthContextValue | null>(null);

const genericLoginError =
  "Não foi possível entrar. Verifique as credenciais e a autorização administrativa.";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) {
        return;
      }

      const result = getSupabaseBrowserClient();

      setClient(result.client);
      setConfigError(result.configError);

      if (!result.client) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    let isMounted = true;

    void client.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!client) {
        return {
          ok: false,
          error: genericLoginError,
        };
      }

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return {
          ok: false,
          error: genericLoginError,
        };
      }

      setSession(data.session);
      return { ok: true };
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (client) {
      await client.auth.signOut();
    }

    setSession(null);
  }, [client]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      accessToken: session?.access_token ?? "",
      configError,
      isLoading,
      session,
      signIn,
      signOut,
      user: session?.user ?? null,
    }),
    [configError, isLoading, session, signIn, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
