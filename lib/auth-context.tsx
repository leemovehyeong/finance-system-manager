'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Employee } from '@/types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employee: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // 5초 타임아웃 — 세션 복원 실패 시에도 앱이 동작하도록
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        console.warn('Auth session timeout');
        setLoading(false);
      }
    }, 5000);

    const getSession = async () => {
      try {
        // getSession()은 로컬 캐시에서 읽기 때문에 빠름
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from('employees')
            .select('*')
            .eq('auth_id', currentUser.id)
            .single();
          if (!cancelled) setEmployee(data);
        }
      } catch (err) {
        console.error('Auth session error:', err);
      } finally {
        if (!cancelled) {
          clearTimeout(timeout);
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: User | null } | null) => {
        if (cancelled) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('employees')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
          if (!cancelled) setEmployee(data);
        } else {
          setEmployee(null);
        }
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ user, employee, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
