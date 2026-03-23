'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import TopBar from '@/components/layout/TopBar';
import TicketCard from '@/components/ticket/TicketCard';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket } from '@/types';
import { cn } from '@/lib/utils';

type TabKey = 'active' | 'completed';

export default function FieldMyTasks() {
  const { employee } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('active');
  const supabase = createClient();

  useEffect(() => {
    if (employee) fetchMyTasks();
  }, [employee, tab]);

  const fetchMyTasks = async () => {
    if (!employee) return;
    setLoading(true);

    const statuses = tab === 'active' ? ['accepted', 'in_progress'] : ['completed'];

    const { data } = await supabase
      .from('tickets')
      .select('*')
      .eq('assigned_to', employee.id)
      .in('status', statuses)
      .order('updated_at', { ascending: false })
      .limit(50);

    setTickets(data || []);
    setLoading(false);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'active', label: '진행 중' },
    { key: 'completed', label: '완료' },
  ];

  return (
    <>
      <TopBar title="내 업무" />

      {/* 탭 */}
      <div className="px-5 pt-3 pb-2 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium press-effect transition-colors',
              tab === t.key
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-ios-subtext'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={tab === 'active' ? 'check' : 'clipboard'}
            title={tab === 'active' ? '진행 중인 업무가 없습니다' : '완료된 업무가 없습니다'}
          />
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} basePath="/field" />
          ))
        )}
      </div>
    </>
  );
}
