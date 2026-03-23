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
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `${color}1A`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
