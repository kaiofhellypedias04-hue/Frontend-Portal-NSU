import { classNames, statusLabel } from '../../lib/format';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

const toneClasses: Record<Tone, string> = {
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  danger: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  info: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  muted: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
};

export function statusTone(status?: string | null): Tone {
  const s = (status || '').toLowerCase();
  if (['ok', 'online', 'ativo', 'rodando', 'finalizado', 'normal', 'success'].includes(s)) return 'success';
  if (['pendente', 'aguardando', 'warning'].includes(s)) return 'warning';
  if (['erro', 'offline', 'vencido', 'cancelado', 'cancelada', 'danger'].includes(s)) return 'danger';
  if (['restrita', 'producao', 'info'].includes(s)) return 'info';
  return 'muted';
}

export function Badge({ value, tone, className }: { value?: string | null; tone?: Tone; className?: string }) {
  const finalTone = tone || statusTone(value);
  return (
    <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', toneClasses[finalTone], className)}>
      {statusLabel(value)}
    </span>
  );
}
