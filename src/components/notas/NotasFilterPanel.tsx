import { ChevronDown, Filter, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { FilterChips, type FilterChip } from '../ui/FilterChips';
import { formatDate } from '../../lib/format';
import type { NotasFilters } from '../../types/api';
import { useEmpresas } from '../../hooks/useEmpresas';
import { SavedViews } from '../ui/SavedViews';

const STATUS_LABELS: Record<string, string> = {
  normal: 'Normal',
  cancelada: 'Cancelada',
  substituida: 'Substituída',
};

export function NotasFilterPanel({ value, onChange }: { value: NotasFilters; onChange: (filters: NotasFilters) => void }) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState<NotasFilters>(value);
  const { data: empresas = [] } = useEmpresas();
  useEffect(() => { const toggle = () => setOpen((state) => !state); window.addEventListener('portal:toggle-filters', toggle); return () => window.removeEventListener('portal:toggle-filters', toggle); }, []);

  const chips = useMemo<FilterChip[]>(() => {
    const result: FilterChip[] = [];
    if (value.empresa_id) {
      const empresa = empresas.find((item) => String(item.id) === String(value.empresa_id));
      result.push({ key: 'empresa_id', label: `Empresa: ${empresa?.nome || value.empresa_id}` });
    }
    if (value.status_documento) result.push({ key: 'status_documento', label: `Status: ${STATUS_LABELS[value.status_documento] || value.status_documento}` });
    if (value.chave) result.push({ key: 'chave', label: `Chave: ${value.chave}` });
    if (value.busca) result.push({ key: 'busca', label: `Busca: ${value.busca}` });
    if (value.prestador_cnpj) result.push({ key: 'prestador_cnpj', label: `CNPJ prestador: ${value.prestador_cnpj}` });
    if (value.tomador_cnpj) result.push({ key: 'tomador_cnpj', label: `CNPJ tomador: ${value.tomador_cnpj}` });
    if (value.data_inicio) result.push({ key: 'data_inicio', label: `De: ${formatDate(value.data_inicio)}` });
    if (value.data_fim) result.push({ key: 'data_fim', label: `Até: ${formatDate(value.data_fim)}` });
    return result;
  }, [value, empresas]);

  function setField(key: keyof NotasFilters, fieldValue: string) {
    setDraft((current) => ({ ...current, [key]: fieldValue || undefined, offset: 0 }));
  }

  function removeFilter(key: string) {
    const next = { ...value, [key]: undefined, offset: 0 };
    setDraft(next);
    onChange(next);
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...draft, limit: 500, offset: 0 });
  }

  function clear() {
    const clean = { limit: 500, offset: 0 };
    setDraft(clean);
    onChange(clean);
  }

  return (
    <section className="glass-card mb-5 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-borderSoft p-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex items-center gap-2 text-left" onClick={() => setOpen((state) => !state)}>
          <Filter size={20} className="text-accent" />
          <div>
            <h2 className="font-semibold text-textStrong">Filtros</h2>
            <p className="text-sm text-textSoft">Refine as notas sem travar o monitoramento ao vivo.</p>
          </div>
          <ChevronDown size={18} className={open ? 'rotate-180 transition' : 'transition'} />
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setOpen((state) => !state)}>{open ? 'Ocultar filtros' : 'Mostrar filtros'}</Button>
        </div>
      </div>
      <FilterChips chips={chips} onRemove={removeFilter} />
      <div className="border-b border-borderSoft px-4 py-3"><SavedViews storageKey="views:notas" value={value} onApply={(saved) => { setDraft(saved); onChange(saved); }} /></div>
      {chips.length > 0 ? (
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          Filtros ativos podem ocultar notas recém-importadas. Limpe os filtros para ver tudo em ordem de importação.
        </div>
      ) : null}

      {open ? (
        <form className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={apply}>
          <label>
            <span className="label">Empresa</span>
            <select className="field" value={draft.empresa_id || ''} onChange={(e) => setField('empresa_id', e.target.value)}>
              <option value="">Todas</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>{empresa.nome} - {empresa.cnpj}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Status</span>
            <select className="field" value={draft.status_documento || ''} onChange={(e) => setField('status_documento', e.target.value)}>
              <option value="">Todos</option>
              <option value="normal">Normal</option>
              <option value="cancelada">Cancelada</option>
              <option value="substituida">Substituída</option>
            </select>
          </label>

          <label>
            <span className="label">Número / chave</span>
            <input className="field" value={draft.chave || ''} onChange={(e) => setField('chave', e.target.value)} placeholder="Chave exata quando precisar" />
          </label>

          <label>
            <span className="label">Busca inteligente</span>
            <input className="field" value={draft.busca || ''} onChange={(e) => setField('busca', e.target.value)} placeholder="Prestador, CNPJ, nº nota..." />
          </label>

          <label>
            <span className="label">CNPJ prestador</span>
            <input className="field" value={draft.prestador_cnpj || ''} onChange={(e) => setField('prestador_cnpj', e.target.value)} placeholder="Somente números" />
          </label>

          <label>
            <span className="label">CNPJ tomador</span>
            <input className="field" value={draft.tomador_cnpj || ''} onChange={(e) => setField('tomador_cnpj', e.target.value)} placeholder="Somente números" />
          </label>

          <label>
            <span className="label">Data inicial</span>
            <input type="date" className="field" value={draft.data_inicio || ''} onChange={(e) => setField('data_inicio', e.target.value)} />
          </label>

          <label>
            <span className="label">Data final</span>
            <input type="date" className="field" value={draft.data_fim || ''} onChange={(e) => setField('data_fim', e.target.value)} />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 xl:col-span-4">
            <Button className="sm:min-w-40" type="submit" variant="primary">Aplicar filtros</Button>
            <Button type="button" variant="ghost" onClick={clear}><X size={16} /> Limpar</Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
