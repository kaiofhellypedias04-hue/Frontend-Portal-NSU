import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { invalidatePortalData } from './queryInvalidation';
import type { ConsultaDesativarPayload, ConsultaIniciarPayload } from '../types/api';

export function useProcessos(params?: { empresa_id?: string | number; status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['processos', params],
    queryFn: () => api.listarProcessos({ limit: 100, offset: 0, ...params }),
    refetchInterval: 10_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCancelarProcesso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (processoId: number) => api.cancelarProcesso(processoId),
    onSuccess: () => invalidatePortalData(queryClient),
  });
}

export function useIniciarConsultas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: ConsultaIniciarPayload) => api.iniciarConsultas(payload),
    onSuccess: () => invalidatePortalData(queryClient),
  });
}

export function useDesativarConsultas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: ConsultaDesativarPayload) => api.desativarConsultas(payload),
    onSuccess: () => invalidatePortalData(queryClient),
  });
}
