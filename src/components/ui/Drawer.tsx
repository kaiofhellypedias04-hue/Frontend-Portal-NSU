import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { Button } from './Button';

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  expandable?: boolean;
};

const DrawerExpandedContext = createContext(false);

export function useDrawerExpanded() {
  return useContext(DrawerExpandedContext);
}

export function Drawer({ open, title, onClose, children, expandable = false }: DrawerProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [expanded, setExpanded] = useState(false);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previousFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Fechar" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-borderSoft bg-surface p-4 shadow-2xl outline-none transition-[max-width] duration-300 sm:p-6 ${
          expanded ? 'max-w-none' : 'max-w-xl'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-xl font-bold text-white">{title}</h2>
          <div className="flex shrink-0 items-center gap-1">
            {expandable ? (
              <Button
                variant="ghost"
                onClick={() => setExpanded((value) => !value)}
                className="px-3"
                aria-label={expanded ? 'Recolher painel' : 'Expandir painel'}
                title={expanded ? 'Voltar ao painel lateral' : 'Expandir para tela inteira'}
              >
                {expanded ? <ChevronsRight size={19} /> : <ChevronsLeft size={19} />}
              </Button>
            ) : null}
            <Button variant="ghost" onClick={onClose} className="px-3" aria-label="Fechar painel">
              <X size={18} />
            </Button>
          </div>
        </div>
        <DrawerExpandedContext.Provider value={expanded}>
          <div className={expanded ? 'mx-auto w-full max-w-[1800px]' : undefined}>{children}</div>
        </DrawerExpandedContext.Provider>
      </aside>
    </div>
  );
}
