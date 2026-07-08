import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Fechar" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-borderSoft bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <Button variant="ghost" onClick={onClose} className="px-3">
            <X size={18} />
          </Button>
        </div>
        {children}
      </aside>
    </div>
  );
}
