'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { TICKET_STATUS } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import TicketCard from '@/components/ticket/TicketCard';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket, TicketStatus } from '@/types';
import { cn } from '@/lib/utils';

function AdminTicketsContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | 'all'>(
    (searchParams.get('status') as TicketStatus) || 'all'
  );
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase
      .from('tickets')
      .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query.limit(100);
    setTickets(data || []);
    setLoading(false);
  };

  const filters = [
    { key: 'all' as const, label: '전체' },
    ...Object.entries(TICKET_STATUS).map(([key, config]) => ({
      key: key as TicketStatus,
      label: config.label,
    })),
  ];

  return (
    <>
      <TopBar title="전체 티켓" />

      <div className="px-5 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap press-effect transition-colors',
                filter === f.key
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-white text-ios-subtext'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : tickets.length === 0 ? (
          <EmptyState icon="clipboard" title="해당 티켓이 없습니다" />
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} basePath="/admin" />
          ))
        )}
      </div>
    </>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-6 space-y-3">{[...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)}</div>}>
      <AdminTicketsContent />
    </Suspense>
  );
}
