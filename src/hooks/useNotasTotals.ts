import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cleanClientOnlyFiltersForApi, dedupeNotas, filterNotasByPortalFilters } from '../lib/notaFilters';
import type { Nota, NotasFilters } from '../types/api';

function cleanCountFilters(filters?: NotasFilters): NotasFilters {
  const { limit: _limit, offset: _offset, ...rest } = filters || {};
  return rest;
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

async function fetchAllNotasForSummary(filters?: NotasFilters, includeItems = true) {
  const clean = cleanCountFilters(filters);
  const apiFilters = cleanClientOnlyFiltersForApi(clean);
  // `/notas/todas` busca tudo no backend (em lotes internos) e devolve o
  // conjunto completo, ao contrario de `/notas` que e limitado a 500
  // registros por pagina e nunca informa o total (por isso o dashboard
  // ficava travado mostrando "500+"). Como `response.items` ja vem
  // completo, `summary.total` (apos os filtros client-only, ex.: busca
  // livre, nome do prestador) e o numero correto a exibir — o `total`
  // bruto da API não considera esses filtros que só existem no cliente.
  const response = includeItems
    ? await api.listarTodasNotas(apiFilters)
    : await api.contarNotas(apiFilters);
  if (!includeItems) {
    return {
      total: response.total ?? 0,
      pendentes: 0,
      ok: 0,
      corrigir: 0,
      observacao: 0,
      slaVencido: 0,
      items: [] as Nota[],
      complete: true,
    };
  }
  const notas = dedupeNotas(filterNotasByPortalFilters(response.items, clean));

  const summary = buildSummary(notas);
  return {
    ...summary,
    items: notas,
    complete: true,
  };
}

export function useNotasTotals(filters?: NotasFilters, includeItems = false) {
  const clean = cleanCountFilters(filters);

  return useQuery({
    queryKey: ['notas-totals', clean, { includeItems }],
    queryFn: () => fetchAllNotasForSummary(clean, includeItems),
    refetchInterval: includeItems ? 60_000 : 30_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
