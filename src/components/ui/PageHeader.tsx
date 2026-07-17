import type { ReactNode } from 'react';
import { classNames } from '../../lib/format';

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; className?: string }) {
  return (
    <header className={classNames('mb-6 flex flex-col gap-4 border-b border-borderSoft pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight text-textStrong sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[15px] leading-6 text-textSoft">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, description, actions, className }: { title: string; description?: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={classNames('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-textStrong">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-5 text-textSoft">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
