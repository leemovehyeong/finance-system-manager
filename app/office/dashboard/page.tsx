'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { APP_NAME, TICKET_STATUS } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TicketCard from '@/components/ticket/TicketCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { SignOut, Plus } from '@phosphor-icons/react';
import type { Ticket, TicketStatus } from '@/types';

export default function OfficeDashboard() {
  const { employee, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const fetchData = async () => {
    try {
      const [ticketsRes, statusRes] = await Promise.all([
        supabase.from('tickets')
          .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('tickets').select('status'),
      ]);

      setTickets(ticketsRes.data || []);

      const counts: Record<string, number> = {};
      for (const key of Object.keys(TICKET_STATUS)) counts[key] = 0;
      if (statusRes.data) {
        for (const t of statusRes.data) {
          if (t.status in counts) counts[t.status]++;
        }
      }
      setStats(counts);
    } catch (err) {
      console.error('Office dashboard fetch error:', err);
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
          <p className="text-caption text-text-tertiary mb-1">{employee?.name}님, 안녕하세요</p>
          <h1 className="text-display text-text-primary">{APP_NAME}</h1>
        </div>
        <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center press-effect">
          <SignOut size={18} className="text-text-secondary" />
        </button>
      </div>

      <Button size="lg" className="w-full gap-2" onClick={() => router.push('/office/tickets/new')}>
        <Plus size={18} weight="bold" /> 새 티켓 접수
      </Button>

      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(TICKET_STATUS) as [TicketStatus, typeof TICKET_STATUS[TicketStatus]][]).map(([key, config]) => (
          <Card key={key} className="press-effect cursor-pointer" onClick={() => router.push(`/office/tickets?status=${key}`)}>
            <p className="text-caption text-text-tertiary mb-2">{config.label}</p>
            <p className="text-[2rem] font-bold text-text-primary leading-none">{stats[key] || 0}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-title text-text-primary mb-3">최근 접수</h2>
        {tickets.length === 0 ? (
          <EmptyState icon="clipboard" title="아직 접수된 티켓이 없습니다" />
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
