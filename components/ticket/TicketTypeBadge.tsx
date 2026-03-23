import Badge from '@/components/ui/Badge';
import { TICKET_TYPES } from '@/lib/constants';
import type { TicketType } from '@/types';

interface TicketTypeBadgeProps {
  type: TicketType;
  className?: string;
}

export default function TicketTypeBadge({ type, className }: TicketTypeBadgeProps) {
  const config = TICKET_TYPES[type];
  return <Badge label={config.label} color={config.color} className={className} />;
}
