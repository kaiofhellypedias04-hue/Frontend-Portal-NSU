import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { onlyDigits } from '../lib/format';
import { cleanClientOnlyFiltersForApi, dedupeNotas, filterNotasByPortalFilters, notaUniqueKey } from '../lib/notaFilters';
import { invalidatePortalData } from './queryInvalidation';
import type { ConferenciaPayload, NotasFilters } from '../types/api';

function cleanFilters(filters?: NotasFilters): NotasFilters {
  return {
    ...filters,
    prestador_cnpj: filters?.prestador_cnpj ? onlyDigits(filters.prestador_cnpj) : undefined,
    tomador_cnpj: filters?.tomador_cnpj ? onlyDigits(filters.tomador_cnpj) : undefined,
    data_inicio: filters?.data_inicio || filters?.data_inicial || undefined,
    data_fim: filters?.data_fim || filters?.data_final || undefined,
    limit: filters?.limit ?? 500,
    offset: filters?.offset ?? 0,
  };
}

export function useConferenciaNotas(filters?: NotasFilters) {
  const clean = cleanFilters(filters);
  const apiFilters = cleanClientOnlyFiltersForApi(clean);
  return useQuery({
    queryKey: ['conferencia-notas', clean],
    queryFn: async () => {
      const response = await api.listarNotasConferencia(apiFilters);
      return {
        ...response,
        items: dedupeNotas(filterNotasByPortalFilters(response.items, clean)),
      };
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useConferenciaNotasInfinite(filters?: NotasFilters) {
  const pageSize = filters?.limit ?? 500;
  const clean = cleanFilters({ ...filters, limit: pageSize });
  const apiFilters = cleanClientOnlyFiltersForApi(clean);

  return useInfiniteQuery({
    queryKey: ['conferencia-notas-infinite', { ...clean, offset: undefined }],
    initialPageParam: clean.offset ?? 0,
    queryFn: async ({ pageParam }) => {
      const response = await api.listarNotasConferencia({ ...apiFilters, limit: pageSize, offset: pageParam });
      return {
        items: dedupeNotas(filterNotasByPortalFilters(response.items, clean)),
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
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalvarConferenciaNota() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notaId, payload }: { notaId: number; payload: ConferenciaPayload }) => api.salvarConferenciaNota(notaId, payload),
    onSuccess: async (_nota, variables) => {
      invalidatePortalData(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['nota-detalhe', variables.notaId] });
    },
  });
}
