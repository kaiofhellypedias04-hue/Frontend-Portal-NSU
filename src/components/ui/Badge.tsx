import { twMerge } from 'tailwind-merge';
import { statusLabel } from '../../lib/format';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

const toneClasses: Record<Tone, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-accent/30 bg-accent/10 text-accent',
  muted: 'border-borderSoft bg-panel2 text-textSoft',
};

export function statusTone(status?: string | null): Tone {
  const s = (status || '').toLowerCase();
  if (['ok', 'online', 'ativo', 'rodando', 'finalizado', 'normal', 'success'].includes(s)) return 'success';
  if (['pendente', 'aguardando', 'warning'].includes(s)) return 'warning';
  if (['erro', 'offline', 'vencido', 'cancelado', 'cancelada', 'substituido', 'substituida', 'danger'].includes(s)) return 'danger';
  if (['restrita', 'producao', 'info'].includes(s)) return 'info';
  return 'muted';
}

export function Badge({ value, tone, className }: { value?: string | null; tone?: Tone; className?: string }) {
  const finalTone = tone || statusTone(value);
  return (
    // twMerge (nao classNames/join simples) para que um className vindo de
    // fora (ex.: text-[11px], px-2) realmente substitua o tamanho/padding
    // padrao (text-xs, px-2.5) em vez de deixar as duas classes conflitantes
    // no DOM e o resultado visual dependendo da ordem imprevisivel do CSS.
    <span className={twMerge('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', toneClasses[finalTone], className)}>
      {statusLabel(value)}
    </span>
  );
}
