import { ChevronDown, Filter, SlidersHorizontal, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { FilterChips, type FilterChip } from '../ui/FilterChips';
import { useEmpresas } from '../../hooks/useEmpresas';
import { formatDate, onlyDigits } from '../../lib/format';
import type { NotasFilters } from '../../types/api';
import { SavedViews } from '../ui/SavedViews';

const CHIP_LABELS: Record<string, string> = {
  status: 'Status',
  tipo: 'Tipo de nota',
  status_simples_nacional: 'Tipo de nota',
  prioridade: 'Prioridade',
  responsavel: 'Responsável',
  conferencia_status: 'Conferência',
  incidencia_iss: 'Incidência do ISS',
  numero: 'Número',
  prestador_nome: 'Prestador',
  prestador_cnpj: 'CNPJ prestador',
  tomador_cnpj: 'CNPJ tomador',
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function ConferenciaFilters({
  value,
  onChange,
  incidenciaOptions = [],
}: {
  value: NotasFilters;
  onChange: (filters: NotasFilters) => void;
  incidenciaOptions?: string[];
}) {
  const [open, setOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draft, setDraft] = useState<NotasFilters>(value);
  const { data: empresas = [] } = useEmpresas();
  useEffect(() => { const toggle = () => setOpen((state) => !state); window.addEventListener('portal:toggle-filters', toggle); return () => window.removeEventListener('portal:toggle-filters', toggle); }, []);

  const chips = useMemo<FilterChip[]>(() => {
    const result: FilterChip[] = [];
    for (const [key, label] of Object.entries(CHIP_LABELS)) {
      const filterValue = value[key as keyof NotasFilters];
      if (filterValue) result.push({ key, label: `${label}: ${filterValue}` });
    }
    if (value.empresa_id) {
      const empresa = empresas.find((item) => String(item.id) === String(value.empresa_id));
      result.push({ key: 'empresa_id', label: `Empresa: ${empresa?.nome || value.empresa_id}` });
    }
    if (value.data_inicio) result.push({ key: 'data_inicio', label: `De: ${formatDate(value.data_inicio)}` });
    if (value.data_fim) result.push({ key: 'data_fim', label: `Até: ${formatDate(value.data_fim)}` });
    return result;
  }, [value, empresas]);

  function removeFilter(key: string) {
    const next: NotasFilters = { ...value, [key]: undefined, offset: 0 };
    if (!next.data_inicio && !next.data_fim) next.filtrar_por_data = undefined;
    setDraft(next);
    onChange(next);
  }

  function setField(key: keyof NotasFilters, fieldValue: string) {
    const valueToSave = key === 'prestador_cnpj' || key === 'tomador_cnpj' ? onlyDigits(fieldValue) : fieldValue;
    setDraft((current) => ({ ...current, [key]: valueToSave || undefined, offset: 0 }));
  }

  function tipoNotaValue() {
    return draft.status_simples_nacional || draft.tipo || '';
  }

  function setTipoNota(fieldValue: string) {
    setDraft((current) => ({
      ...current,
      tipo: fieldValue === 'NFS-e' ? fieldValue : undefined,
      status_simples_nacional: fieldValue && fieldValue !== 'NFS-e' ? fieldValue : undefined,
      offset: 0,
    }));
  }

  function setDataFilter(fieldValue: string) {
    setDraft((current) => ({
      ...current,
      filtrar_por_data: fieldValue || undefined,
      data_inicio: fieldValue ? current.data_inicio : undefined,
      data_fim: fieldValue ? current.data_fim : undefined,
      offset: 0,
    }));
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { valor_minimo: _valorMinimo, valor_maximo: _valorMaximo, valor_min: _valorMin, valor_max: _valorMax, ...filtersToApply } = draft;
    onChange({ ...filtersToApply, limit: 500, offset: 0 });
  }

  function clear() {
    const clean: NotasFilters = { limit: 500, offset: 0, sort: 'recentes' };
    setDraft(clean);
    onChange(clean);
  }

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-borderSoft bg-panel shadow-card">
      <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <button className="flex min-h-11 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => setOpen((state) => !state)} aria-expanded={open}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Filter size={19} /></span>
          <div className="min-w-0"><h2 className="font-bold text-textStrong">Filtrar notas</h2><p className="text-sm text-textSoft">Encontre rapidamente o que precisa.</p></div>
          <ChevronDown size={18} className={open ? 'ml-1 rotate-180 text-textSoft transition' : 'ml-1 text-textSoft transition'} />
        </button>
        <div className="min-w-0"><SavedViews storageKey="views:conferencia" value={value} onApply={(saved) => { setDraft(saved); onChange(saved); }} /></div>
      </div>
      <FilterChips chips={chips} onRemove={removeFilter} />

      {open ? (
        <form className="border-t border-borderSoft" onSubmit={apply}>
          <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Field label="Status">
              <select className="field" value={draft.status || ''} onChange={(e) => setField('status', e.target.value)}>
                <option value="">Todos</option>
                <option value="normal">Normal</option>
                <option value="cancelada">Cancelada</option>
                <option value="substituida">Substituída</option>
                <option value="pendente">Pendente</option>
                <option value="erro">Erro</option>
              </select>
            </Field>

            <Field label="Empresa">
              <select className="field" value={draft.empresa_id || ''} onChange={(e) => setField('empresa_id', e.target.value)}>
                <option value="">Todas</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>{empresa.nome} - {empresa.cnpj}</option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de nota">
              <select className="field" value={tipoNotaValue()} onChange={(e) => setTipoNota(e.target.value)}>
                <option value="">Todas</option>
                <option value="NFS-e">NFS-e</option>
                <option value="mei">MEI</option>
                <option value="nao_optante">Não Optante</option>
                <option value="optante_sn">Optante S.N</option>
              </select>
            </Field>

            <Field label="Prioridade">
              <select className="field" value={draft.prioridade || ''} onChange={(e) => setField('prioridade', e.target.value)}>
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </Field>

            <Field label="Responsável">
              <input className="field" value={draft.responsavel || ''} onChange={(e) => setField('responsavel', e.target.value)} placeholder="Nome ou equipe" />
            </Field>

            <Field label="Conferência">
              <select className="field" value={draft.conferencia_status || ''} onChange={(e) => setField('conferencia_status', e.target.value)}>
                <option value="">Todas</option>
                <option value="pendente">Pendente</option>
                <option value="ok">OK</option>
                <option value="corrigir">Corrigir</option>
                <option value="observacao">Observação</option>
              </select>
            </Field>
          </div>

          <div className="border-t border-borderSoft/70 bg-panelInset/40 px-4 py-3 sm:px-5">
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-textBody transition hover:bg-panel2 hover:text-accent" onClick={() => setAdvancedOpen((state) => !state)} aria-expanded={advancedOpen}>
              <SlidersHorizontal size={17} />
              {advancedOpen ? 'Ocultar filtros avançados' : 'Mais filtros'}
              <ChevronDown size={16} className={advancedOpen ? 'rotate-180 transition' : 'transition'} />
            </button>

            {advancedOpen ? (
              <div className="mt-3 grid gap-4 border-t border-borderSoft/70 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <Field label="Incidência do ISS">
              <input
                className="field"
                list="incidencia-iss-options"
                value={draft.incidencia_iss || ''}
                onChange={(e) => setField('incidencia_iss', e.target.value)}
                placeholder="Digite ou selecione"
              />
              <datalist id="incidencia-iss-options">
                {incidenciaOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </Field>

            <Field label="Filtrar por data">
              <select className="field" value={draft.filtrar_por_data || ''} onChange={(e) => setDataFilter(e.target.value)}>
                <option value="">Selecione</option>
                <option value="entrada">Entrada</option>
                <option value="emissao">Emissão</option>
                <option value="competencia">Competência</option>
              </select>
            </Field>

            <Field label="Data inicial">
              <input type="date" className="field" value={draft.data_inicio || ''} onChange={(e) => setField('data_inicio', e.target.value)} disabled={!draft.filtrar_por_data} />
            </Field>

            <Field label="Data final">
              <input type="date" className="field" value={draft.data_fim || ''} onChange={(e) => setField('data_fim', e.target.value)} disabled={!draft.filtrar_por_data} />
            </Field>

            <Field label="Número da nota">
              <input className="field" value={draft.numero || ''} onChange={(e) => setField('numero', e.target.value)} placeholder="Buscar número" />
            </Field>

            <Field label="Nome do prestador">
              <input className="field" value={draft.prestador_nome || ''} onChange={(e) => setField('prestador_nome', e.target.value)} placeholder="Razão social" />
            </Field>

            <Field label="CNPJ prestador">
              <input className="field" value={draft.prestador_cnpj || ''} onChange={(e) => setField('prestador_cnpj', e.target.value)} placeholder="Somente números" />
            </Field>

            <Field label="CNPJ tomador">
              <input className="field" value={draft.tomador_cnpj || ''} onChange={(e) => setField('tomador_cnpj', e.target.value)} placeholder="Somente números" />
            </Field>

              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-borderSoft bg-panel px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <Button className="sm:min-w-44" type="submit" variant="primary">Aplicar filtros</Button>
            <Button type="button" variant="ghost" onClick={clear}><X size={16} /> Limpar</Button>
            <span className="text-xs text-textSoft sm:ml-auto">Pressione Enter para aplicar</span>
          </div>
        </form>
      ) : null}
    </section>
  );
}
