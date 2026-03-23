'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME, TICKET_STATUS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket, TicketStatus } from '@/types';

export default function OfficeDashboard() {
  const { employee, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard?role=office');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `서버 오류 (${res.status})`);
      }
      const data = await res.json();
      setTickets(data.tickets || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Office dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 pt-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-ios-subtext text-sm">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchData(); }} className="text-[#007AFF] text-sm font-medium">
          다시 시도
        </button>
        <button onClick={handleSignOut} className="text-[#FF3B30] text-sm mt-2">
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ios-subtext mb-1">
            {employee?.name}님, 안녕하세요
          </p>
          <h1 className="text-2xl font-semibold text-ios-text tracking-tight">
            {APP_NAME}
          </h1>
        </div>
        <button onClick={handleSignOut} className="text-sm text-[#FF3B30] press-effect">
          로그아웃
        </button>
      </div>

      {/* 새 접수 버튼 */}
      <Button
        size="lg"
        className="w-full"
        onClick={() => router.push('/office/tickets/new')}
      >
        + 새 티켓 접수
      </Button>

      {/* 상태 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(TICKET_STATUS) as [TicketStatus, typeof TICKET_STATUS[TicketStatus]][]).map(([key, config]) => (
          <Card key={key} className="press-effect" onClick={() => router.push(`/office/tickets?status=${key}`)}>
            <p className="text-sm text-ios-subtext mb-1">{config.label}</p>
            <p className="text-2xl font-semibold" style={{ color: config.color }}>
              {stats[key] || 0}
            </p>
          </Card>
        ))}
      </div>

      {/* 최근 티켓 */}
      <div>
        <h2 className="text-lg font-semibold text-ios-text mb-3">최근 접수</h2>
        {tickets.length === 0 ? (
          <EmptyState icon="📋" title="아직 접수된 티켓이 없습니다" />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} basePath="/office" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
