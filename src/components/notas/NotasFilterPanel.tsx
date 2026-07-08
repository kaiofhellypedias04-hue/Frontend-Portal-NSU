import { ChevronDown, Filter, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import type { NotasFilters } from '../../types/api';
import { useEmpresas } from '../../hooks/useEmpresas';

export function NotasFilterPanel({ value, onChange }: { value: NotasFilters; onChange: (filters: NotasFilters) => void }) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState<NotasFilters>(value);
  const { data: empresas = [] } = useEmpresas();

  const activeCount = useMemo(() => Object.values(value).filter(Boolean).length, [value]);

  function setField(key: keyof NotasFilters, fieldValue: string) {
    setDraft((current) => ({ ...current, [key]: fieldValue || undefined, offset: 0 }));
  }

  function apply() {
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
          <Filter size={18} className="text-sky-300" />
          <div>
            <h2 className="font-semibold text-white">Filtros</h2>
            <p className="text-sm text-textSoft">Refine as notas sem travar o monitoramento ao vivo.</p>
          </div>
          <ChevronDown size={18} className={open ? 'rotate-180 transition' : 'transition'} />
        </button>
        <div className="flex flex-wrap gap-2">
          {activeCount > 2 ? <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs text-sky-200">{activeCount - 2} filtros ativos</span> : null}
          <Button variant="ghost" onClick={() => setOpen((state) => !state)}>{open ? 'Ocultar filtros' : 'Mostrar filtros'}</Button>
        </div>
      </div>
      {activeCount > 2 ? (
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          Filtros ativos podem ocultar notas recem-importadas. Limpe os filtros para ver tudo em ordem de importacao.
        </div>
      ) : null}

      {open ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
            <Button variant="primary" onClick={apply}>Aplicar filtros</Button>
            <Button variant="ghost" onClick={clear}><X size={16} /> Limpar</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
