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
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      // 회원가입
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? '이미 등록된 이메일입니다.'
          : '회원가입에 실패했습니다. 비밀번호는 6자 이상이어야 합니다.');
        setLoading(false);
        return;
      }
    }

    // 로그인
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

      if (employee?.role) {
        router.push(`/${employee.role}/dashboard`);
      } else {
        // employees 레코드가 없으면 자동 생성 (role=null, 대기 상태)
        if (!employee) {
          await supabase.from('employees').insert({
            auth_id: user.id,
            name: user.email?.split('@')[0] || '미지정',
            email: user.email || '',
          });
        }
        router.push('/pending');
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
            {mode === 'login' ? '업무를 시작하려면 로그인하세요' : '새 계정을 만들어 주세요'}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleAuth} className="space-y-4">
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
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
            {mode === 'login' ? '로그인' : '회원가입'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-sm text-[#007AFF] press-effect"
          >
            {mode === 'login' ? '처음이신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
