import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
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
  nickname?: string;
  role_title?: string;
  organization: string;
  avatar_url?: string;
  phone?: string;
}

export interface AuthorizedMemberInfo {
  id: string;
  email: string;
  name: string;
  nickname: string;
  role: UserRole;
  roleTitle: string;
  organization: string;
  avatarUrl: string;
  groupName: string;
}

export const AUTHORIZED_TEAM_MEMBERS: AuthorizedMemberInfo[] = [
  // 1. ฝ่ายบริหารโครงการ
  {
    id: 'pm-01',
    email: 'dencapvision@gmail.com',
    name: 'นายอนุสรณ์ หนองนา (เด่น)',
    nickname: 'เด่น',
    role: 'project_admin',
    roleTitle: 'Super Admin / ผู้จัดการโครงการ (PM & Learning Architect Lead)',
    organization: 'สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    groupName: '1. ฝ่ายบริหารโครงการ',
  },
  {
    id: 'pm-02',
    email: 'taleiw1717@gmail.com',
    name: 'คุณต้นหลิว (Co-PM)',
    nickname: 'ต้นหลิว',
    role: 'pm',
    roleTitle: 'ผู้ช่วยผู้จัดการโครงการ (Co-Project Manager & Coordination Lead)',
    organization: 'ทีมบริหารโครงการ สกสว.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    groupName: '1. ฝ่ายบริหารโครงการ',
  },
  {
    id: 'pm-03',
    email: 'kraiput.in@gmail.com',
    name: 'นายไกรพุฒ อินทรพาณิชย์ (ไนท์)',
    nickname: 'ไนท์',
    role: 'pm',
    roleTitle: 'ผู้อำนวยการโครงการอาวุโส (Senior Project Director)',
    organization: 'ทีมบริหารโครงการ สกสว.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    groupName: '1. ฝ่ายบริหารโครงการ',
  },
  {
    id: 'pm-04',
    email: 'pimpasphitcha@gmail.com',
    name: 'คุณพิมพัสพิชชา (เบนซ์)',
    nickname: 'เบนซ์',
    role: 'researcher',
    roleTitle: 'ผู้ประสานงานโครงการและการสื่อสารองค์กร (Project Coordinator)',
    organization: 'ทีมบริหารโครงการ สกสว.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    groupName: '1. ฝ่ายบริหารโครงการ',
  },

  // 2. ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย
  {
    id: 'adv-01',
    email: 'napawat.sue@mfu.ac.th',
    name: 'ผศ.ดร.นภวัตร สุวรรณฉัตรพงศ์ (อ.มะตูม)',
    nickname: 'อ.มะตูม',
    role: 'legal_advisor',
    roleTitle: 'หัวหน้าทีมวิชาการและผู้เชี่ยวชาญด้านกฎหมายมหาชนและการบริหาร ววน.',
    organization: 'มหาวิทยาลัยแม่ฟ้าหลวง',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    groupName: '2. ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย',
  },
  {
    id: 'adv-02',
    email: 'tp.marut@gmail.com',
    name: 'ผศ.ดร.มารุต พัฒผล (อ.ปุ่น)',
    nickname: 'อ.ปุ่น',
    role: 'legal_advisor',
    roleTitle: 'ผู้เชี่ยวชาญด้านการออกแบบหลักสูตร การวัดประเมินผล และการเรียนรู้ตลอดชีวิต',
    organization: 'ผู้เชี่ยวชาญอิสระ / มหาวิทยาลัยศรีนครินทรวิโรฒ',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    groupName: '2. ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย',
  },
  {
    id: 'adv-03',
    email: 'karnkul.bum@mfu.ac.th',
    name: 'ผศ.ดร.กานต์กุล บำรุงจิตต์ (อ.บอย)',
    nickname: 'อ.บอย',
    role: 'legal_advisor',
    roleTitle: 'ผู้เชี่ยวชาญด้านกฎหมายปกครองและการจัดทำระเบียบภาครัฐ',
    organization: 'มหาวิทยาลัยแม่ฟ้าหลวง',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    groupName: '2. ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย',
  },
  {
    id: 'adv-04',
    email: 'kanokporns@go.buu.ac.th',
    name: 'ผศ.ดร.กนกพร ศรีปทุมรักษ์ (อ.อู๋)',
    nickname: 'อ.อู๋',
    role: 'legal_advisor',
    roleTitle: 'ผู้เชี่ยวชาญด้านการบริหารจัดการนวัตกรรมและทรัพย์สินทางปัญญา',
    organization: 'มหาวิทยาลัยบูรพา',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    groupName: '2. ฝ่ายที่ปรึกษาวิชาการ/กฎหมาย',
  },

  // 3. ฝ่ายที่ปรึกษา HR & Learning
  {
    id: 'adv-05',
    email: 'b.phalapong@gmail.com',
    name: 'คุณพละพงศ์ บุญศิริ (แอ๋ม)',
    nickname: 'แอ๋ม',
    role: 'hrd',
    roleTitle: 'ที่ปรึกษาอาวุโสด้านการออกแบบสถาปัตยกรรมการเรียนรู้และระบบ HRD',
    organization: 'ที่ปรึกษาองค์กรอิสระ',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    groupName: '3. ฝ่ายที่ปรึกษา HR & Learning',
  },
  {
    id: 'adv-06',
    email: 'atichart.sri@gmail.com',
    name: 'คุณอธิชาติ ศรีสุริยา (ซัน)',
    nickname: 'ซัน',
    role: 'hrd',
    roleTitle: 'ที่ปรึกษาด้านการออกแบบโมดูลพัฒนาผู้บริหารทุกระดับ (Executive Development Advisor)',
    organization: 'ที่ปรึกษาพัฒนาภาวะผู้นำอิสระ',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    groupName: '3. ฝ่ายที่ปรึกษา HR & Learning',
  },
  {
    id: 'adv-07',
    email: 'c.benrabbit@gmail.com',
    name: 'คุณสายป่าน (Learning & Media Specialist)',
    nickname: 'สายป่าน',
    role: 'hrd',
    roleTitle: 'ที่ปรึกษาด้านการออกแบบสื่อการเรียนรู้และ Infographic (Learning Media Specialist)',
    organization: 'ทีมออกแบบสื่อการเรียนรู้ ววน.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    groupName: '3. ฝ่ายที่ปรึกษา HR & Learning',
  },
];

export function findAuthorizedMember(email: string): AuthorizedMemberInfo | undefined {
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_TEAM_MEMBERS.find((m) => m.email.toLowerCase() === normalized);
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAdminOrPm: boolean;
  isAuthenticated: boolean;
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

  const getStoredLocalSession = useCallback((): { session: Session; profile: UserProfile; role: UserRole } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('tsri_auth_session');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed?.session?.user?.email || parsed?.profile?.email || parsed?.user?.email) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed parsing local tsri_auth_session', e);
    }
    return null;
  }, []);

  const fetchProfileAndRole = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      const local = getStoredLocalSession();
      if (local) {
        setProfile(local.profile);
        setRole(local.role);
        return;
      }
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      const userEmail = currentSession.user.email || '';
      const authMember = findAuthorizedMember(userEmail);
      const userId = currentSession.user.id;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile({
          ...profileData,
          nickname: authMember?.nickname || profileData.nickname,
          role_title: authMember?.roleTitle || profileData.role_title,
        });
      } else if (authMember) {
        setProfile({
          id: userId,
          email: authMember.email,
          full_name: authMember.name,
          nickname: authMember.nickname,
          role_title: authMember.roleTitle,
          organization: authMember.organization,
          avatar_url: authMember.avatarUrl,
        });
      } else {
        const meta = currentSession.user.user_metadata || {};
        setProfile({
          id: userId,
          email: userEmail,
          full_name: meta.full_name || userEmail || 'ผู้ใช้งานระบบ',
          organization: meta.organization || 'สกสว.',
        });
      }

      // 2. Fetch Role
      if (authMember) {
        setRole(authMember.role);
      } else {
        const { data: memberData } = await supabase
          .from('project_members')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (memberData?.role) {
          setRole(memberData.role as UserRole);
        } else {
          const metaRole = currentSession.user.user_metadata?.role;
          setRole((metaRole as UserRole) || 'viewer');
        }
      }
    } catch (err) {
      console.error('Error fetching profile and role:', err);
    }
  }, [getStoredLocalSession]);

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user ?? null);
        await fetchProfileAndRole(currentSession);
      } else {
        const local = getStoredLocalSession();
        if (local) {
          setSession(local.session);
          setUser(local.session.user);
          setProfile(local.profile);
          setRole(local.role);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      }
    } catch (err) {
      console.error('Error refreshing auth state:', err);
    }
  }, [fetchProfileAndRole, getStoredLocalSession]);

  useEffect(() => {
    let isMounted = true;

    const checkInitialAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user ?? null);
          await fetchProfileAndRole(currentSession);
        } else {
          const local = getStoredLocalSession();
          if (local && isMounted) {
            setSession(local.session);
            setUser(local.session.user);
            setProfile(local.profile);
            setRole(local.role);
          }
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        const local = getStoredLocalSession();
        if (local && isMounted) {
          setSession(local.session);
          setUser(local.session.user);
          setProfile(local.profile);
          setRole(local.role);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkInitialAuth();

    // Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user ?? null);
        await fetchProfileAndRole(newSession);
      } else {
        const local = getStoredLocalSession();
        if (local) {
          setSession(local.session);
          setUser(local.session.user);
          setProfile(local.profile);
          setRole(local.role);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      }
      if (isMounted) setIsLoading(false);
    });

    // Custom SPA auth changed event
    const handleAuthChanged = () => {
      refreshAuth();
    };
    window.addEventListener('tsri-auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('tsri-auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, [fetchProfileAndRole, getStoredLocalSession, refreshAuth]);

  const signOut = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tsri_auth_session');
        window.dispatchEvent(new Event('tsri-auth-changed'));
      }
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
    isAuthenticated: !!session,
    isLoading,
    refreshAuth,
    signOut,
  };
}

/**
 * Hook to enforce authentication on protected routes (/dashboard, /reviews, etc.)
 * Redirects unauthenticated users to /login immediately.
 */
export function useRequireAuth(defaultRedirectTo: string = '/login') {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.session) {
      const currentPath = location.pathname + location.search;
      const targetUrl =
        currentPath && currentPath !== '/' && currentPath !== '/login'
          ? `/login?returnTo=${encodeURIComponent(currentPath)}`
          : defaultRedirectTo;
      navigate(targetUrl, { replace: true });
    }
  }, [auth.session, auth.isLoading, navigate, location, defaultRedirectTo]);

  return { ...auth, isAuthenticated: !!auth.session };
}
