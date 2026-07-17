import { useMemo, useState } from 'react';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { NotasFilterPanel } from '../components/notas/NotasFilterPanel';
import { NotasTable } from '../components/notas/NotasTable';
import { NotaDrawer } from '../components/notas/NotaDrawer';
import { Badge } from '../components/ui/Badge';
import { useNotasInfinite } from '../hooks/useNotas';
import { useNotasTotals } from '../hooks/useNotasTotals';
import { dedupeNotas } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export function NotasConsultadas() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = usePersistentState<NotasFilters>('filters:notas', { limit: 500, offset: 0, busca: searchParams.get('busca') || undefined });
  useRestoreScroll('notas');
  useEffect(() => { const busca = searchParams.get('busca'); if (busca) setFilters((current) => ({ ...current, busca, offset: 0 })); }, [searchParams, setFilters]);
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
      <PageHeader eyebrow="Consulta contínua" title="Notas consultadas" description="Consulte, filtre e acompanhe as notas produzidas automaticamente pelo motor." actions={<Badge value={`${totalNotas} notas consultadas`} tone="info" />} />
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
