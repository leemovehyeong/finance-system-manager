'use client';

import Card from '@/components/ui/Card';
import TicketStatusBadge from './TicketStatusBadge';
import TicketTypeBadge from './TicketTypeBadge';
import PriorityIndicator from './PriorityIndicator';
import { TICKET_SOURCE } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import type { Ticket } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowRight } from '@phosphor-icons/react';

interface TicketCardProps {
  ticket: Ticket;
  basePath: string;
  showAcceptButton?: boolean;
  onAccept?: (ticketId: string) => void;
}

export default function TicketCard({ ticket, basePath, showAcceptButton, onAccept }: TicketCardProps) {
  const router = useRouter();
  const sourceConfig = TICKET_SOURCE[ticket.source];

  return (
    <Card
      className="press-effect cursor-pointer hover:shadow-card-hover transition-shadow"
      onClick={() => router.push(`${basePath}/tickets/${ticket.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TicketTypeBadge type={ticket.type} />
          <PriorityIndicator priority={ticket.priority} />
          {sourceConfig.badge && (
            <span className="text-micro text-text-tertiary font-medium">
              {sourceConfig.badge}
            </span>
          )}
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <h3 className="text-body font-semibold text-text-primary mb-1 line-clamp-1">
        {ticket.title}
      </h3>

      <p className="text-caption text-text-secondary mb-3 line-clamp-1">
        {ticket.store_name}
        {ticket.store_address && ` · ${ticket.store_address}`}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-micro text-text-tertiary">
          #{ticket.ticket_number} · {timeAgo(ticket.created_at)}
        </span>
        {ticket.assigned_to_employee ? (
          <span className="text-micro text-text-secondary font-medium">
            {ticket.assigned_to_employee.name}
          </span>
        ) : (
          <ArrowRight size={14} className="text-text-tertiary" />
        )}
      </div>

      {showAcceptButton && ticket.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept?.(ticket.id);
          }}
          className="w-full mt-3 h-11 bg-black text-white rounded-full font-semibold text-caption press-effect"
        >
          수락하기
        </button>
      )}
    </Card>
  );
}
