import type { ReactNode } from 'react';
import { classNames } from '../../lib/format';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={classNames('glass-card p-5', className)}>{children}</div>;
}

export function MetricCard({ label, value, hint, children }: { label: string; value: ReactNode; hint?: string; children?: ReactNode }) {
  return (
    <Card className="min-h-[116px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-textSoft">{label}</p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-textStrong">{value}</div>
          {hint ? <p className="mt-2 text-xs text-textSoft">{hint}</p> : null}
        </div>
        {children}
      </div>
    </Card>
  );
}
