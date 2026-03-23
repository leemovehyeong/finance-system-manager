import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export default function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border-light',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
