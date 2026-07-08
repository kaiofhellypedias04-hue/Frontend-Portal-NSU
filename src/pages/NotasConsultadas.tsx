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

export function NotasConsultadas() {
  const [filters, setFilters] = useState<NotasFilters>({ limit: 500, offset: 0 });
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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-textSoft">Consulta continua</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Notas consultadas</h1>
          <p className="mt-2 max-w-3xl text-sm text-textSoft">Esta tela consulta o backend automaticamente. O front nao roda a fila, ele so mostra o que o motor esta produzindo.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Badge value={`${totalNotas} notas consultadas`} tone="info" />
        </div>
      </div>
      <NotasDownloadActions filters={filters} notasPaginaAtual={notas} />
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
