import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from '../components/ui/Toaster';
import { invalidatePortalData } from './queryInvalidation';

export function useCertificados(params?: { empresa_id?: string | number; ativo?: boolean }) {
  return useQuery({
    queryKey: ['certificados', params],
    queryFn: () => api.listarCertificados(params),
    refetchInterval: 20_000,
  });
}

export function useUploadCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ empresaId, formData }: { empresaId: number; formData: FormData }) =>
      api.uploadCertificadoEmpresa(empresaId, formData),
    onSuccess: () => {
      toast.success('Certificado enviado');
      return invalidatePortalData(queryClient);
    },
  });
}

export function useAutocadastrarCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.autocadastrarCertificado(formData),
    onSuccess: () => {
      toast.success('Certificado cadastrado', 'Empresa e certificado registrados a partir do arquivo.');
      return invalidatePortalData(queryClient);
    },
  });
}

export function useTestarSenhaSalva() {
  return useMutation({
    mutationFn: (certificadoId: number) => api.testarSenhaSalva(certificadoId),
  });
}

export function useDesativarCertificado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (certificadoId: number) => api.desativarCertificado(certificadoId),
    onSuccess: () => {
      toast.success('Certificado desativado');
      return invalidatePortalData(queryClient);
    },
  });
}
