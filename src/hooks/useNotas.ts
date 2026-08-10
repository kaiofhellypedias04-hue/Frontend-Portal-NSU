import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Nota, NotasFilters } from '../types/api';
import { filterNotasBySmartSearch } from '../lib/smartSearch';
import { dedupeNotas, notaUniqueKey } from '../lib/notaFilters';

export function noteTimestamp(nota: Nota, sort: NotasFilters['sort']) {
  const value = sort === 'emissao'
    ? nota.data_emissao || nota.importado_em || nota.updated_at || nota.created_at
    : nota.importado_em || nota.updated_at || nota.created_at;
  const timestamp = new Date(value || '').getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortNotas(notas: Nota[], sort: NotasFilters['sort'] = 'recentes') {
  return [...notas].sort((a, b) => noteTimestamp(b, sort) - noteTimestamp(a, sort) || b.id - a.id);
}

export function useNotas(filters?: NotasFilters, refetchInterval = 5_000) {
  return useQuery({
    queryKey: ['notas', filters],
    queryFn: async () => {
      const sort = filters?.sort ?? 'recentes';
      const notas = await api.listarNotas({ ...filters, sort });
      const result = sortNotas(
        dedupeNotas(notas).filter((nota) => filterNotasBySmartSearch([nota], filters?.busca).length > 0),
        sort,
      );
      return result;
    },
    refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useNotasInfinite(filters?: NotasFilters, refetchInterval = 5_000) {
  // Um primeiro lote menor deixa a tela interativa rapidamente. As demais
  // notas continuam sendo carregadas pela rolagem infinita ou por "carregar tudo".
  const pageSize = Math.min(filters?.limit ?? 100, 100);

  return useInfiniteQuery({
    queryKey: ['notas-infinite', { ...filters, limit: pageSize, offset: undefined }],
    initialPageParam: filters?.offset ?? 0,
    queryFn: async ({ pageParam }) => {
      const sort = filters?.sort ?? 'recentes';
      const response = await api.listarNotasConferencia({ ...filters, sort, limit: pageSize, offset: pageParam });
      const items = sortNotas(dedupeNotas(filterNotasBySmartSearch(response.items, filters?.busca)), sort);

      return {
        items,
        fetched: response.items.length,
        total: response.total,
        offset: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length > 1 && lastPage.items.length > 0) {
        const previousKeys = new Set(allPages.slice(0, -1).flatMap((page) => page.items.map(notaUniqueKey)));
        if (lastPage.items.every((nota) => previousKeys.has(notaUniqueKey(nota)))) return undefined;
      }
      const nextOffset = lastPage.offset + pageSize;
      if (lastPage.fetched >= pageSize) {
        return nextOffset;
      }
      if (typeof lastPage.total === 'number' && lastPage.total > nextOffset) {
        return nextOffset;
      }
      return undefined;
    },
    // Atualiza automaticamente apenas enquanto existe a primeira pagina.
    // Depois que o usuario carrega mais, um refetch da infinite query repetiria
    // todas as paginas acumuladas e faria o custo crescer sem limite.
    refetchInterval: (query) => ((query.state.data?.pages.length ?? 0) <= 1 ? refetchInterval : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
    placeholderData: (previousData) => previousData,
  });
}
