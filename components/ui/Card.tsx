import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export default function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
