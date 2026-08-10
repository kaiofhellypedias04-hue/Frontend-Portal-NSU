import { useMemo, useState } from 'react';
import { LiveStatusBar } from '../components/live/LiveStatusBar';
import { CycleSummary } from '../components/live/CycleSummary';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { NotasFilterPanel } from '../components/notas/NotasFilterPanel';
import { NotasTable } from '../components/notas/NotasTable';
import { NotaDrawer } from '../components/notas/NotaDrawer';
import { sortNotas, useNotasInfinite } from '../hooks/useNotas';
import { useNotasTotals } from '../hooks/useNotasTotals';
import { dedupeNotas } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';
import { QuickTasks } from '../components/dashboard/QuickTasks';

export function Dashboard() {
  const [filters, setFilters] = usePersistentState<NotasFilters>('filters:dashboard:v4', { limit: 100, offset: 0, sort: 'recentes' });
  useRestoreScroll('dashboard');
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const [isLoadingAllNotas, setIsLoadingAllNotas] = useState(false);
  const { data, isLoading, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotasInfinite(filters, 2_000);
  // O selo do painel representa todo o acervo baixado, independentemente dos
  // filtros aplicados somente a tabela.
  const { data: totals } = useNotasTotals(undefined, false);
  const notas = useMemo(
    () => sortNotas(dedupeNotas(data?.pages.flatMap((page) => page.items) ?? []), filters.sort ?? 'recentes'),
    [data, filters.sort],
  );
  const canLoadMore = Boolean(hasNextPage && (typeof totals?.total !== 'number' || notas.length < totals.total));
  const totalNotas = totals?.total;

  async function loadAllNotas() {
    if (!canLoadMore) return;
    setIsLoadingAllNotas(true);
    try {
      let canContinue: boolean = canLoadMore;

      while (canContinue) {
        const result = await fetchNextPage();
        canContinue = Boolean(result.hasNextPage);
      }
    } finally {
      setIsLoadingAllNotas(false);
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Visão geral" title="Painel principal" description="Acompanhe a operação fiscal, o motor de consultas e as notas mais recentes em um só lugar." />
      <QuickTasks />
      <LiveStatusBar />
      <CycleSummary />
      <NotasDownloadActions filters={filters} />
      <NotasFilterPanel value={filters} onChange={setFilters} />
      <NotasTable
        notas={notas}
        isLoading={isLoading || (isFetching && notas.length === 0)}
        error={error}
        onOpen={setSelectedNota}
        hasMore={canLoadMore}
        isLoadingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onLoadAll={loadAllNotas}
        isLoadingAll={isLoadingAllNotas}
        totalCount={totalNotas}
      />
      <NotaDrawer nota={selectedNota} onClose={() => setSelectedNota(null)} />
    </div>
  );
}
