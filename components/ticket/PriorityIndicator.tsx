import { PRIORITY } from '@/lib/constants';
import type { Priority } from '@/types';

interface PriorityIndicatorProps {
  priority: Priority;
}

export default function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const config = PRIORITY[priority];

  if (priority === 'normal') return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium"
      style={{ color: config.color }}
    >
      {priority === 'urgent' && '●'}
      {config.label}
    </span>
  );
}
