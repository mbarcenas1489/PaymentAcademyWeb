"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    // Safety timeout to never get stuck on a blank loading screen
    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 3500);

    async function initAuth() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!mounted) return;

        if (sessionError) {
          setError(sessionError.message);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : "Error al obtener la sesión";
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        clearTimeout(timer);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          return false;
        }
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al iniciar sesión";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cerrar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    session,
    user,
    isAuthenticated: !!session,
    loading,
    error,
    signIn,
    signOut,
    clearError: () => setError(null),
  };
}
