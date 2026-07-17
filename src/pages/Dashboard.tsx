import { useMemo, useState } from 'react';
import { LiveStatusBar } from '../components/live/LiveStatusBar';
import { CycleSummary } from '../components/live/CycleSummary';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { NotasFilterPanel } from '../components/notas/NotasFilterPanel';
import { NotasTable } from '../components/notas/NotasTable';
import { NotaDrawer } from '../components/notas/NotaDrawer';
import { useNotasInfinite } from '../hooks/useNotas';
import { useNotasTotals } from '../hooks/useNotasTotals';
import { dedupeNotas } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';
import { QuickTasks } from '../components/dashboard/QuickTasks';

export function Dashboard() {
  const [filters, setFilters] = usePersistentState<NotasFilters>('filters:dashboard', { limit: 500, offset: 0 });
  useRestoreScroll('dashboard');
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const [isLoadingAllNotas, setIsLoadingAllNotas] = useState(false);
  const { data, isLoading, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotasInfinite(filters, 10_000);
  const { data: totals } = useNotasTotals(filters);
  const notas = useMemo(() => dedupeNotas(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const lastPage = data?.pages[data.pages.length - 1];
  const pageSize = filters.limit ?? 500;
  const canLoadMore = Boolean(hasNextPage || (lastPage?.fetched ?? 0) >= pageSize);
  const totalNotas = Math.max(totals?.total ?? 0, lastPage?.total ?? 0, notas.length);

  async function loadAllNotas() {
    if (!canLoadMore) return;
    setIsLoadingAllNotas(true);
    try {
      let loaded = notas.length;
      let canContinue: boolean = canLoadMore;

      while (canContinue) {
        const result = await fetchNextPage();
        const pages = result.data?.pages ?? [];
        const nextLoaded = dedupeNotas(pages.flatMap((page) => page.items)).length;
        if (nextLoaded <= loaded) break;
        loaded = nextLoaded;
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
