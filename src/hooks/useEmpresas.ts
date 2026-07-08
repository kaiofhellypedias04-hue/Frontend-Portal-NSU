import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useEmpresas(ativo?: boolean) {
  return useQuery({
    queryKey: ['empresas', ativo],
    queryFn: () => api.listarEmpresas(ativo),
  });
}
