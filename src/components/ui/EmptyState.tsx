import type { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-borderSoft bg-slate-950/30 p-8 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-lg text-sm text-textSoft">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
