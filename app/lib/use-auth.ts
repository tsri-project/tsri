import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@remix-run/react';
import { supabase } from '~/lib/supabase.client';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole =
  | 'project_admin'
  | 'pm'
  | 'legal_advisor'
  | 'researcher'
  | 'hrd'
  | 'stakeholder'
  | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  organization: string;
  avatar_url?: string;
  phone?: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdminOrPm: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      const userId = currentSession.user.id;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback to metadata
        const meta = currentSession.user.user_metadata || {};
        setProfile({
          id: userId,
          email: currentSession.user.email || '',
          full_name: meta.full_name || currentSession.user.email || 'ผู้ใช้งานระบบ',
          organization: meta.organization || 'สกสว.',
        });
      }

      // 2. Fetch Project Member Role
      const { data: memberData } = await supabase
        .from('project_members')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberData?.role) {
        setRole(memberData.role as UserRole);
      } else {
        const metaRole = currentSession.user.user_metadata?.role;
        setRole((metaRole as UserRole) || null);
      }
    } catch (err) {
      console.error('Error fetching profile and role:', err);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      await fetchProfileAndRole(currentSession);
    } catch (err) {
      console.error('Error refreshing auth state:', err);
    }
  }, [fetchProfileAndRole]);

  useEffect(() => {
    let isMounted = true;

    // Initial session load
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession) {
        await fetchProfileAndRole(currentSession);
      }
      if (isMounted) setIsLoading(false);
    }).catch((err) => {
      console.error('Error getting initial session:', err);
      if (isMounted) setIsLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession) {
        await fetchProfileAndRole(newSession);
      } else {
        setProfile(null);
        setRole(null);
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRole]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  const isAdminOrPm = role === 'project_admin' || role === 'pm';

  return {
    session,
    user,
    profile,
    role,
    isAdminOrPm,
    isLoading,
    refreshAuth,
    signOut,
  };
}

/**
 * Hook to enforce authentication on protected routes (/dashboard, /reviews, etc.)
 * Redirects unauthenticated users to /login immediately.
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.session) {
      navigate(redirectTo, { replace: true });
    }
  }, [auth.session, auth.isLoading, navigate, redirectTo]);

  return { ...auth, isAuthenticated: !!auth.session };
}
