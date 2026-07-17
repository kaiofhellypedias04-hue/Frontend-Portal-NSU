import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { classNames } from '../../lib/format';

export type ToastTone = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<(toasts: ToastItem[]) => void>();

function emit() {
  for (const listener of listeners) listener(items);
}

export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id);
  emit();
}

function push(tone: ToastTone, title: string, description?: string) {
  const id = nextId++;
  // Erros ficam mais tempo na tela; sucesso/info somem sozinhos mais rapido.
  const duration = tone === 'error' ? 8000 : 4500;
  items = [...items.slice(-3), { id, tone, title, description }];
  emit();
  window.setTimeout(() => dismissToast(id), duration);
}

export const toast = {
  success: (title: string, description?: string) => push('success', title, description),
  error: (title: string, description?: string) => push('error', title, description),
  info: (title: string, description?: string) => push('info', title, description),
};

const toneStyles: Record<ToastTone, { box: string; icon: typeof Info }> = {
  success: { box: 'border-emerald-400/30 bg-emerald-950/90 text-emerald-100', icon: CheckCircle2 },
  error: { box: 'border-rose-400/30 bg-rose-950/90 text-rose-100', icon: AlertTriangle },
  info: { box: 'border-sky-400/30 bg-slate-950/90 text-sky-100', icon: Info },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-4 sm:items-end sm:pr-6" role="status" aria-live="polite">
      {toasts.map((item) => {
        const { box, icon: Icon } = toneStyles[item.tone];
        return (
          <div
            key={item.id}
            className={classNames(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur',
              box,
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? <p className="mt-0.5 break-words text-xs opacity-80">{item.description}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Fechar aviso"
              className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
              onClick={() => dismissToast(item.id)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
