import { AlertTriangle, CheckCircle2, Clock, MessageSquareText, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConferenciaDrawer } from '../components/conferencia/ConferenciaDrawer';
import { ConferenciaFilters } from '../components/conferencia/ConferenciaFilters';
import { ConferenciaTable } from '../components/conferencia/ConferenciaTable';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { useConferenciaNotasInfinite } from '../hooks/useConferenciaNotas';
import { dedupeNotas } from '../lib/notaFilters';
import type { DirecaoNota, Nota, NotasFilters, TipoNota } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';

type ConferenciaProps = {
  tipoNotaFixo?: Extract<TipoNota, 'tomada' | 'prestada'>;
  direcaoNotaFixa?: Extract<DirecaoNota, 'recebida' | 'emitida'>;
  titulo?: string;
  descricao?: string;
};

const DEFAULT_FILTERS: NotasFilters = { limit: 500, offset: 0, sort: 'recentes' };

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Clock; tone: string }) {
  return (
    <div className="rounded-2xl border border-borderSoft bg-panel/80 p-4 shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-textSoft">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function notaSlaTone(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return String(nota.sla.tone || '').toLowerCase();
  return String(nota.sla_status || nota.sla || '').toLowerCase();
}

function countBy(notas: Nota[], predicate: (nota: Nota) => boolean) {
  return notas.reduce((total, nota) => total + (predicate(nota) ? 1 : 0), 0);
}

export function Conferencia({ tipoNotaFixo, direcaoNotaFixa, titulo = 'Conferência de Notas', descricao }: ConferenciaProps) {
  const persistenceKey = tipoNotaFixo === 'tomada' ? 'conferencia:tomados' : tipoNotaFixo === 'prestada' ? 'conferencia:prestados' : 'conferencia';
  const [filters, setFilters] = usePersistentState<NotasFilters>(`filters:${persistenceKey}`, DEFAULT_FILTERS);
  useRestoreScroll(persistenceKey);
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const fixedFilters = useMemo<NotasFilters>(() => ({
    ...(tipoNotaFixo ? { tipo_nota: tipoNotaFixo } : {}),
    ...(direcaoNotaFixa ? { direcao_nota: direcaoNotaFixa } : {}),
  }), [direcaoNotaFixa, tipoNotaFixo]);
  const effectiveFilters = useMemo<NotasFilters>(() => ({
    ...filters,
    ...fixedFilters,
    limit: filters.limit ?? DEFAULT_FILTERS.limit,
    offset: filters.offset ?? DEFAULT_FILTERS.offset,
    sort: filters.sort ?? DEFAULT_FILTERS.sort,
  }), [filters, fixedFilters]);

  const { data, isLoading, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useConferenciaNotasInfinite(effectiveFilters);
  const notas = useMemo(() => dedupeNotas(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const lastPage = data?.pages[data.pages.length - 1];
  const totalNotas = lastPage?.total ?? notas.length;
  const defaultDescricao = tipoNotaFixo === 'tomada'
    ? 'Notas de serviços tomados/recebidos pela empresa.'
    : tipoNotaFixo === 'prestada'
      ? 'Notas de serviços prestados/emitidos pela empresa.'
      : 'Tela operacional para filtrar, conferir e acompanhar pendências das NFS-e importadas pelo backend.';
  const emptyDescription = tipoNotaFixo === 'tomada'
    ? 'Nenhuma nota de serviço tomado encontrada para os filtros selecionados.'
    : tipoNotaFixo === 'prestada'
      ? 'Nenhuma nota de serviço prestado encontrada para os filtros selecionados.'
      : undefined;

  const summary = useMemo(() => ({
    total: totalNotas,
    pendentes: countBy(notas, (nota) => (nota.conferencia_status || 'pendente') === 'pendente'),
    ok: countBy(notas, (nota) => nota.conferencia_status === 'ok'),
    corrigir: countBy(notas, (nota) => nota.conferencia_status === 'corrigir'),
    observacao: countBy(notas, (nota) => nota.conferencia_status === 'observacao' || Boolean(nota.conferencia_observacao)),
    slaVencido: countBy(notas, (nota) => ['vencido', 'atrasado', 'danger'].includes(notaSlaTone(nota))),
  }), [notas, totalNotas]);
  const incidenciaOptions = useMemo(() => {
    const values = new Set<string>();
    for (const nota of notas) {
      const value = nota.incidencia_iss?.trim();
      if (value) values.add(value);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [notas]);

  function updateFilters(nextFilters: NotasFilters) {
    setFilters({
      ...nextFilters,
      ...fixedFilters,
      offset: 0,
    });
  }

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Operação fiscal" title={titulo} description={descricao || defaultDescricao} />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Notas nos filtros" value={summary.total} icon={Clock} tone="bg-sky-400/10 text-sky-300" />
        <SummaryCard label="Pendentes carregadas" value={summary.pendentes} icon={Clock} tone="bg-amber-400/10 text-amber-300" />
        <SummaryCard label="OK carregadas" value={summary.ok} icon={CheckCircle2} tone="bg-emerald-400/10 text-emerald-300" />
        <SummaryCard label="Corrigir carregadas" value={summary.corrigir} icon={Wrench} tone="bg-rose-400/10 text-rose-300" />
        <SummaryCard label="Observação carregadas" value={summary.observacao} icon={MessageSquareText} tone="bg-sky-400/10 text-sky-300" />
        <SummaryCard label="SLA vencido carregadas" value={summary.slaVencido} icon={AlertTriangle} tone="bg-orange-400/10 text-orange-300" />
      </div>

      <NotasDownloadActions filters={effectiveFilters} />
      <ConferenciaFilters value={effectiveFilters} onChange={updateFilters} incidenciaOptions={incidenciaOptions} />
      <ConferenciaTable
        notas={notas}
        isLoading={isLoading || (isFetching && notas.length === 0)}
        error={error}
        onOpen={setSelectedNota}
        hasMore={Boolean(hasNextPage || (lastPage?.fetched ?? 0) >= (effectiveFilters.limit ?? 500) || summary.total > notas.length)}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        totalCount={summary.total}
        emptyDescription={emptyDescription}
      />
      <ConferenciaDrawer nota={selectedNota} onClose={() => setSelectedNota(null)} />
    </div>
  );
}
