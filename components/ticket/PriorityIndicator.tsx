import { PRIORITY } from '@/lib/constants';
import { Warning } from '@phosphor-icons/react/dist/ssr';
import type { Priority } from '@/types';

interface PriorityIndicatorProps {
  priority: Priority;
}

export default function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  if (priority === 'normal') return null;

  const config = PRIORITY[priority];

  return (
    <span
      className="inline-flex items-center gap-0.5 text-micro font-medium"
      style={{ color: config.color }}
    >
      {priority === 'urgent' && <Warning size={12} weight="fill" />}
      {config.label}
    </span>
  );
}
