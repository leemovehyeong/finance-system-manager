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
import type { Ticket, TicketStatus } from '@/types';

export default function OfficeDashboard() {
  const { employee } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsResult, statsResult] = await Promise.allSettled([
        supabase
          .from('tickets')
          .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('tickets').select('status'),
      ]);

      if (ticketsResult.status === 'fulfilled') {
        setTickets(ticketsResult.value.data || []);
      }

      if (statsResult.status === 'fulfilled' && statsResult.value.data) {
        const counts: Record<string, number> = {};
        for (const key of Object.keys(TICKET_STATUS)) {
          counts[key] = 0;
        }
        for (const ticket of statsResult.value.data) {
          if (ticket.status in counts) {
            counts[ticket.status]++;
          }
        }
        setStats(counts);
      }
    } catch (err) {
      console.error('Office dashboard fetch error:', err);
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

  return (
    <div className="px-5 pt-6 space-y-6">
      {/* 헤더 */}
      <div>
        <p className="text-sm text-ios-subtext mb-1">
          {employee?.name}님, 안녕하세요
        </p>
        <h1 className="text-2xl font-semibold text-ios-text tracking-tight">
          {APP_NAME}
        </h1>
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
