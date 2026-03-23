'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { APP_NAME } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    // 역할 조회 후 라우트
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: employee } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', user.id)
        .single();

      if (employee) {
        router.push(`/${employee.role}/dashboard`);
      } else {
        setError('등록된 직원 정보가 없습니다. 관리자에게 문의하세요.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm">
        {/* 로고/앱명 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#007AFF] rounded-[22px] mx-auto mb-6 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ios-text tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-sm text-ios-subtext mt-2">
            업무를 시작하려면 로그인하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="text-sm text-[#FF3B30] text-center">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}
