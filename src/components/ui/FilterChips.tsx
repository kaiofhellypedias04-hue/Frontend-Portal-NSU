import { X } from 'lucide-react';

export type FilterChip = {
  key: string;
  label: string;
};

export function FilterChips({ chips, onRemove }: { chips: FilterChip[]; onRemove: (key: string) => void }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-borderSoft/70 bg-accent/[0.035] px-4 py-3">
      <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.14em] text-textSoft">Filtros ativos</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-lg border border-accent/25 bg-accent/10 py-1 pl-3 pr-2 text-xs font-semibold text-accent transition hover:border-accent/50 hover:bg-accent/15"
          onClick={() => onRemove(chip.key)}
          title={`Remover filtro: ${chip.label}`}
        >
          <span className="truncate">{chip.label}</span>
          <X size={12} className="shrink-0" />
        </button>
      ))}
    </div>
  );
}
