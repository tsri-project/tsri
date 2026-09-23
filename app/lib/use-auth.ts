import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('Error fetching Supabase session:', err);
      if (isMounted) {
        setIsLoading(false);
      }
    });

    // 2. Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  return { session, user, isLoading, signOut };
}

/**
 * Hook to enforce authentication on protected routes (/dashboard, /reviews, etc.)
 * Redirects unauthenticated users to /login immediately.
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const navigate = useNavigate();
  const { session, user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate(redirectTo, { replace: true });
    }
  }, [session, isLoading, navigate, redirectTo]);

  return { session, user, isLoading, isAuthenticated: !!session, signOut };
}
