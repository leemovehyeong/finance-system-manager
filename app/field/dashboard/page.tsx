'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME } from '@/lib/constants';
import Card from '@/components/ui/Card';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket } from '@/types';

export default function FieldDashboard() {
  const { employee, signOut } = useAuth();
  const [myTasks, setMyTasks] = useState<Ticket[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (employee) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const fetchData = async () => {
    if (!employee) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [tasksRes, pendingRes, completedRes] = await Promise.all([
        supabase.from('tickets')
          .select('*')
          .eq('assigned_to', employee.id)
          .in('status', ['accepted', 'in_progress'])
          .order('accepted_at', { ascending: false }),
        supabase.from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', employee.id)
          .eq('status', 'completed')
          .gte('completed_at', today.toISOString()),
      ]);

      setMyTasks(tasksRes.data || []);
      setPendingCount(pendingRes.count || 0);
      setCompletedToday(completedRes.count || 0);
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
        <p className="text-ios-subtext text-sm">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchData(); }} className="text-[#007AFF] text-sm font-medium">다시 시도</button>
        <button onClick={handleSignOut} className="text-[#FF3B30] text-sm mt-2">로그아웃</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ios-subtext mb-1">{employee?.name}님, 오늘도 힘내세요</p>
          <h1 className="text-2xl font-semibold text-ios-text tracking-tight">{APP_NAME}</h1>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#FF3B30] press-effect">로그아웃</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="press-effect text-center" onClick={() => router.push('/field/tickets')}>
          <p className="text-xs text-ios-subtext mb-1">대기 중</p>
          <p className="text-2xl font-semibold text-[#FF9500]">{pendingCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ios-subtext mb-1">내 진행</p>
          <p className="text-2xl font-semibold text-[#007AFF]">{myTasks.length}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ios-subtext mb-1">오늘 완료</p>
          <p className="text-2xl font-semibold text-[#34C759]">{completedToday}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ios-text mb-3">진행 중인 업무</h2>
        {myTasks.length === 0 ? (
          <EmptyState icon="✅" title="진행 중인 업무가 없습니다" description="피드에서 새 업무를 수락하세요" />
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
