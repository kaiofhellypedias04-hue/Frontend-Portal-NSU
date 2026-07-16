import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { cleanClientOnlyFiltersForApi, filterNotasByPortalFilters } from '../lib/notaFilters';
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

async function fetchAllNotasForSummary(filters?: NotasFilters) {
  const clean = cleanCountFilters(filters);
  const apiFilters = cleanClientOnlyFiltersForApi(clean);
  // `/notas/todas` busca tudo no backend (em lotes internos) e devolve o
  // conjunto completo, ao contrario de `/notas` que e limitado a 500
  // registros por pagina e nunca informa o total (por isso o dashboard
  // ficava travado mostrando "500+"). Como `response.items` ja vem
  // completo, `summary.total` (apos os filtros client-only, ex.: busca
  // livre, nome do prestador) e o numero correto a exibir — o `total`
  // bruto da API não considera esses filtros que só existem no cliente.
  const response = await api.listarTodasNotas(apiFilters);
  const notas = filterNotasByPortalFilters(response.items, clean);

  const summary = buildSummary(notas);
  return {
    ...summary,
    complete: true,
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
