import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { NotasDownloadLoteOptions, NotasFilters, RelatorioConferenciaFilters } from '../types/api';

function saveBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useNotasDownloadLote(filters?: NotasFilters) {
  return useMutation({
    mutationFn: (options: NotasDownloadLoteOptions) => api.downloadNotasLote(filters, options),
    onSuccess: (downloads) => {
      downloads.forEach(({ blob, filename }, index) => {
        window.setTimeout(() => saveBlob(blob, filename), index * 400);
      });
    },
  });
}

export function useRelatorioConferenciaDownload(filters?: RelatorioConferenciaFilters | NotasFilters) {
  return useMutation({
    mutationFn: () => api.exportRelatorioConferencia(filters),
    onSuccess: ({ blob, filename }) => saveBlob(blob, filename || 'relatorio_conferencia.xlsx'),
  });
}
