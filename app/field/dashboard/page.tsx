'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { SignOut } from '@phosphor-icons/react';
import type { Ticket } from '@/types';

export default function FieldDashboard() {
  const { employee, signOut } = useAuth();
  const [myTasks, setMyTasks] = useState<Ticket[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    signOut();
    router.push('/login');
    router.refresh();
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard?role=field');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      const data = await res.json();
      setMyTasks(data.myTasks || []);
      setPendingCount(data.pendingCount || 0);
      setCompletedToday(data.completedToday || 0);
    } catch (err) {
      console.error('Field dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="px-5 pt-6"><DashboardSkeleton /></div>;

  if (error) {
    return (
      <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-caption text-text-tertiary">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchData(); }} className="text-caption text-black font-medium">다시 시도</button>
        <button onClick={handleSignOut} className="text-caption text-status-urgent mt-2">로그아웃</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption text-text-tertiary mb-1">{employee?.name || '사용자'}님, 오늘도 힘내세요</p>
          <h1 className="text-display text-text-primary">{APP_NAME}</h1>
        </div>
        <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center press-effect">
          <SignOut size={18} className="text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="press-effect cursor-pointer text-center" onClick={() => router.push('/field/tickets')}>
          <p className="text-micro text-text-tertiary mb-2">대기 중</p>
          <p className="text-[2rem] font-bold text-status-pending leading-none">{pendingCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-micro text-text-tertiary mb-2">내 진행</p>
          <p className="text-[2rem] font-bold text-text-primary leading-none">{myTasks.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-micro text-text-tertiary mb-2">오늘 완료</p>
          <p className="text-[2rem] font-bold text-status-complete leading-none">{completedToday}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-title text-text-primary mb-3">진행 중인 업무</h2>
        {myTasks.length === 0 ? (
          <EmptyState icon="check" title="진행 중인 업무가 없습니다" description="피드에서 새 업무를 수락하세요" />
        ) : (
          <div className="space-y-3">
            {myTasks.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} basePath="/field" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
