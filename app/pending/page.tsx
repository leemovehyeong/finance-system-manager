'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { APP_NAME } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function PendingPage() {
  const router = useRouter();
  const supabase = createClient();

  // 5초마다 승인 여부 체크
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', user.id)
        .single();

      if (employee?.role) {
        router.push(`/${employee.role}/dashboard`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#FF9500] rounded-[22px] mx-auto mb-6 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-ios-text tracking-tight mb-2">
          승인 대기 중
        </h1>

        <p className="text-base text-ios-subtext leading-relaxed mb-2">
          관리자가 역할을 배정하면<br />
          자동으로 이동합니다.
        </p>

        <p className="text-sm text-ios-subtext mb-8">
          {APP_NAME}
        </p>

        <Button variant="ghost" onClick={handleSignOut}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}
