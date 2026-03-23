import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function TicketCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border-light p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border-light p-5 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
