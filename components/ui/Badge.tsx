import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  color: string;
  className?: string;
}

export default function Badge({ label, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}14`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
