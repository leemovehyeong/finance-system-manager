import Badge from '@/components/ui/Badge';
import { TICKET_STATUS } from '@/lib/constants';
import type { TicketStatus } from '@/types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export default function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = TICKET_STATUS[status];
  return <Badge label={config.label} color={config.color} className={className} />;
}
