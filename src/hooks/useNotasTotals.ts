import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cleanClientOnlyFiltersForApi, filterNotasByPortalFilters } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';

const COUNT_PAGE_SIZE = 500;
const COUNT_MAX_PAGES = 200;

function cleanCountFilters(filters?: NotasFilters): NotasFilters {
  const { limit: _limit, offset: _offset, ...rest } = filters || {};
  return {
    ...rest,
    limit: COUNT_PAGE_SIZE,
    offset: 0,
  };
}

function slaTone(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return String(nota.sla.tone || '').toLowerCase();
  return String(nota.sla_status || nota.sla || '').toLowerCase();
}

function buildSummary(notas: Nota[]) {
  return {
    total: notas.length,
    pendentes: notas.reduce((count, nota) => count + ((nota.conferencia_status || 'pendente') === 'pendente' ? 1 : 0), 0),
    ok: notas.reduce((count, nota) => count + (nota.conferencia_status === 'ok' ? 1 : 0), 0),
    corrigir: notas.reduce((count, nota) => count + (nota.conferencia_status === 'corrigir' ? 1 : 0), 0),
    observacao: notas.reduce((count, nota) => count + (nota.conferencia_status === 'observacao' || Boolean(nota.conferencia_observacao) ? 1 : 0), 0),
    slaVencido: notas.reduce((count, nota) => {
      const sla = slaTone(nota);
      return count + (['vencido', 'atrasado'].includes(sla) ? 1 : 0);
    }, 0),
  };
}

async function fetchAllNotasForSummary(filters?: NotasFilters) {
  const clean = cleanCountFilters(filters);
  const apiFilters = cleanClientOnlyFiltersForApi(clean);
  const notas: Nota[] = [];
  const seenNotaIds = new Set<number>();
  let offset = 0;
  let totalFromApi: number | undefined;

  for (let page = 0; page < COUNT_MAX_PAGES; page += 1) {
    const response = await api.listarNotasConferencia({ ...apiFilters, limit: COUNT_PAGE_SIZE, offset });
    const rawNewItems = response.items.filter((nota) => !seenNotaIds.has(nota.id));
    rawNewItems.forEach((nota) => seenNotaIds.add(nota.id));
    const matchedItems = filterNotasByPortalFilters(rawNewItems, clean);
    notas.push(...matchedItems);

    if (typeof response.total === 'number') {
      totalFromApi = response.total;
      if (offset + response.items.length >= response.total) break;
    }

    if (response.items.length < COUNT_PAGE_SIZE) break;
    if (rawNewItems.length === 0) break;
    offset += COUNT_PAGE_SIZE;
  }

  const summary = buildSummary(notas);
  return {
    ...summary,
    total: totalFromApi === undefined ? summary.total : summary.total,
    complete: totalFromApi !== undefined || notas.length < COUNT_PAGE_SIZE * COUNT_MAX_PAGES,
  };
}

export function useNotasTotals(filters?: NotasFilters) {
  const clean = cleanCountFilters(filters);

  return useQuery({
    queryKey: ['notas-totals', clean],
    queryFn: () => fetchAllNotasForSummary(clean),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
