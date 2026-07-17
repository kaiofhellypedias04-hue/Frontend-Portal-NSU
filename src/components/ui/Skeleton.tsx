import { classNames } from '../../lib/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-lg bg-slate-700/40', className)} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 8, title }: { rows?: number; title?: string }) {
  return (
    <div className="glass-card overflow-hidden" role="status" aria-label={title || 'Carregando dados'}>
      <div className="border-b border-borderSoft p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">{title || 'Carregando dados...'}</span>
    </div>
  );
}
