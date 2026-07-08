import { ChevronDown, Filter, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { useEmpresas } from '../../hooks/useEmpresas';
import { onlyDigits } from '../../lib/format';
import type { NotasFilters } from '../../types/api';

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
  const [draft, setDraft] = useState<NotasFilters>(value);
  const { data: empresas = [] } = useEmpresas();

  const activeCount = useMemo(() => Object.entries(value).filter(([key, val]) => !['limit', 'offset', 'sort'].includes(key) && Boolean(val)).length, [value]);

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

  function apply() {
    const { valor_minimo: _valorMinimo, valor_maximo: _valorMaximo, valor_min: _valorMin, valor_max: _valorMax, ...filtersToApply } = draft;
    onChange({ ...filtersToApply, limit: 500, offset: 0 });
  }

  function clear() {
    const clean: NotasFilters = { limit: 500, offset: 0, sort: 'recentes' };
    setDraft(clean);
    onChange(clean);
  }

  return (
    <section className="glass-card mb-5 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-borderSoft p-4 lg:flex-row lg:items-center lg:justify-between">
        <button className="flex items-center gap-2 text-left" onClick={() => setOpen((state) => !state)}>
          <Filter size={18} className="text-sky-300" />
          <div>
            <h2 className="font-semibold text-white">Filtros</h2>
            <p className="text-sm text-textSoft">Use os mesmos filtros para consultar a tabela e baixar XML/PDF.</p>
          </div>
          <ChevronDown size={18} className={open ? 'rotate-180 transition' : 'transition'} />
        </button>
        <div className="flex flex-wrap gap-2">
          {activeCount ? <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs text-sky-200">{activeCount} filtros ativos</span> : null}
          <Button variant="ghost" onClick={() => setOpen((state) => !state)}>{open ? 'Ocultar filtros' : 'Mostrar filtros'}</Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={apply}>Aplicar filtros</Button>
            <Button variant="ghost" onClick={clear}><X size={16} /> Limpar</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
