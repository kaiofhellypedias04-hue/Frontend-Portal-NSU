import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from './Button';

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', tone = 'danger', onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; tone?: 'primary' | 'danger'; onConfirm: () => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" tabIndex={-1} className="w-full max-w-md rounded-2xl border border-borderSoft bg-panel p-5 shadow-card outline-none" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning"><AlertTriangle size={22} /></div>
          <div className="min-w-0 flex-1"><h2 id="confirm-title" className="text-lg font-bold text-textStrong">{title}</h2><p className="mt-1 text-sm leading-6 text-textSoft">{description}</p></div>
          <button className="grid h-10 w-10 place-items-center rounded-xl text-textSoft hover:bg-panel2" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant={tone} onClick={onConfirm}>{confirmLabel}</Button></div>
      </div>
    </div>
  );
}
