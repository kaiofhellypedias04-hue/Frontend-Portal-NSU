import { useMemo, useState } from 'react';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { NotasFilterPanel } from '../components/notas/NotasFilterPanel';
import { NotasTable } from '../components/notas/NotasTable';
import { NotaDrawer } from '../components/notas/NotaDrawer';
import { Badge } from '../components/ui/Badge';
import { sortNotas, useNotasInfinite } from '../hooks/useNotas';
import { useNotasTotals } from '../hooks/useNotasTotals';
import { dedupeNotas } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export function NotasConsultadas() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = usePersistentState<NotasFilters>('filters:notas:v4', { limit: 100, offset: 0, sort: 'recentes', busca: searchParams.get('busca') || undefined });
  useRestoreScroll('notas');
  useEffect(() => { const busca = searchParams.get('busca'); if (busca) setFilters((current) => ({ ...current, busca, offset: 0 })); }, [searchParams, setFilters]);
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const [isLoadingAllNotas, setIsLoadingAllNotas] = useState(false);
  const { data, isLoading, isFetching, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotasInfinite(filters, 5_000);
  const { data: totals } = useNotasTotals(filters, false);
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
      <PageHeader eyebrow="Consulta contínua" title="Notas consultadas" description="Consulte, filtre e acompanhe as notas produzidas automaticamente pelo motor." actions={<Badge value={typeof totalNotas === 'number' ? `${totalNotas} notas consultadas` : 'Calculando total...'} tone="info" />} />
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
