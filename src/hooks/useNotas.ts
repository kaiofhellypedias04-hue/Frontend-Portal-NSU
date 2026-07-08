import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Nota, NotasFilters } from '../types/api';
import { filterNotasBySmartSearch } from '../lib/smartSearch';
import { dedupeNotas, notaUniqueKey } from '../lib/notaFilters';

function noteTimestamp(nota: Nota) {
  const timestamp = new Date(nota.importado_em || nota.updated_at || nota.created_at || '').getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function useNotas(filters?: NotasFilters, refetchInterval = 10_000) {
  return useQuery({
    queryKey: ['notas', filters],
    queryFn: async () => {
      const notas = await api.listarNotas({ sort: 'recentes', ...filters });
      const result = dedupeNotas(notas)
        .filter((nota) => filterNotasBySmartSearch([nota], filters?.busca).length > 0)
        .sort((a, b) => noteTimestamp(b) - noteTimestamp(a) || b.id - a.id);
      return result;
    },
    refetchInterval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useNotasInfinite(filters?: NotasFilters, refetchInterval = 10_000) {
  const pageSize = filters?.limit ?? 500;

  return useInfiniteQuery({
    queryKey: ['notas-infinite', { ...filters, limit: pageSize, offset: undefined }],
    initialPageParam: filters?.offset ?? 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.listarNotasConferencia({ sort: 'recentes', ...filters, limit: pageSize, offset: pageParam });
      const items = dedupeNotas(filterNotasBySmartSearch(response.items, filters?.busca)).sort((a, b) => noteTimestamp(b) - noteTimestamp(a) || b.id - a.id);

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
    refetchInterval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}
