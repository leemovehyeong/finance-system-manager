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
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('Auth session timeout');
        setAuthReady(true);
        setLoading(false);
      }
    }, 5000);

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // 세션 복원 완료 → children 렌더링 허용
        // 이 시점에서 Supabase 클라이언트에 JWT가 설정됨
        setAuthReady(true);

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
        setAuthReady(true);
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

  // 세션 복원 완료 전에는 children을 렌더링하지 않음
  // → 페이지 컴포넌트의 useEffect가 인증된 상태에서만 실행됨
  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, employee, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
