import type { QueryClient } from '@tanstack/react-query';

export function invalidatePortalData(queryClient: QueryClient) {
  const keys = [
    ['notas'],
    ['notas-infinite'],
    ['notas-totals'],
    ['conferencia-notas'],
    ['conferencia-notas-infinite'],
    ['processos'],
    ['processo-summary'],
    ['processo-jobs'],
    ['processo-logs'],
    ['processo-arquivos'],
    ['processo-notas'],
    ['certificados'],
    ['empresas'],
    ['empresas-resumo-operacional'],
    ['live-status'],
  ];

  keys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
}
