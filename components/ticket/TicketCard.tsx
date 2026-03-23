'use client';

import Card from '@/components/ui/Card';
import TicketStatusBadge from './TicketStatusBadge';
import TicketTypeBadge from './TicketTypeBadge';
import PriorityIndicator from './PriorityIndicator';
import { TICKET_SOURCE } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';
import type { Ticket } from '@/types';
import { useRouter } from 'next/navigation';

interface TicketCardProps {
  ticket: Ticket;
  basePath: string; // '/office' | '/field' | '/admin'
  showAcceptButton?: boolean;
  onAccept?: (ticketId: string) => void;
}

export default function TicketCard({ ticket, basePath, showAcceptButton, onAccept }: TicketCardProps) {
  const router = useRouter();
  const sourceConfig = TICKET_SOURCE[ticket.source];

  return (
    <Card
      className="press-effect cursor-pointer"
      onClick={() => router.push(`${basePath}/tickets/${ticket.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TicketTypeBadge type={ticket.type} />
          {sourceConfig.badge && (
            <span className="text-xs text-[#007AFF] font-medium">
              {sourceConfig.badge}
            </span>
          )}
          <PriorityIndicator priority={ticket.priority} />
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <h3 className="text-base font-semibold text-ios-text mb-1 line-clamp-1">
        {ticket.title}
      </h3>

      <p className="text-sm text-ios-subtext mb-3">
        {ticket.store_name}
        {ticket.store_address && ` · ${ticket.store_address}`}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-ios-subtext">
          #{ticket.ticket_number} · {timeAgo(ticket.created_at)}
        </span>
        {ticket.assigned_to_employee && (
          <span className="text-xs text-ios-subtext">
            {ticket.assigned_to_employee.name}
          </span>
        )}
      </div>

      {showAcceptButton && ticket.status === 'pending' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept?.(ticket.id);
          }}
          className="w-full mt-3 h-[44px] bg-[#007AFF] text-white rounded-xl font-semibold press-effect"
        >
          수락하기
        </button>
      )}
    </Card>
  );
}
