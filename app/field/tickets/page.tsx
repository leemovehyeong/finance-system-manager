'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import TopBar from '@/components/layout/TopBar';
import TicketCard from '@/components/ticket/TicketCard';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Ticket } from '@/types';

export default function FieldTicketsFeed() {
  const { employee } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
    subscribeToTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*, assigned_to_employee:employees!tickets_assigned_to_fkey(name)')
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(50);

      setTickets(data || []);
    } catch (err) {
      console.error('Field tickets fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTickets = () => {
    const channel = supabase
      .channel('field-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAccept = async (ticketId: string) => {
    if (!employee) return;

    await supabase.from('tickets').update({
      status: 'accepted',
      assigned_to: employee.id,
      accepted_at: new Date().toISOString(),
    }).eq('id', ticketId);

    // 시스템 댓글
    await supabase.from('ticket_comments').insert({
      ticket_id: ticketId,
      employee_id: employee.id,
      content: `${employee.name}님이 수락했습니다.`,
      is_system: true,
    });

    fetchTickets();
  };

  return (
    <>
      <TopBar title="업무 피드" />

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : tickets.length === 0 ? (
          <EmptyState icon="tray" title="대기 중인 업무가 없습니다" />
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              basePath="/field"
              showAcceptButton
              onAccept={handleAccept}
            />
          ))
        )}
      </div>
    </>
  );
}
