import { Download, FileArchive, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNotasDownloadLote, useRelatorioConferenciaDownload } from '../../hooks/useNotasDownload';
import type { NotasFilters } from '../../types/api';
import { Button } from '../ui/Button';

export function NotasDownloadActions({ filters }: { filters: NotasFilters }) {
  const [downloadLabel, setDownloadLabel] = useState<string | null>(null);
  const downloadMutation = useNotasDownloadLote(filters);
  const relatorioMutation = useRelatorioConferenciaDownload(filters);

  function downloadLote(label: string, incluirXml: boolean, incluirPdf: boolean) {
    setDownloadLabel(label);
    downloadMutation.mutate(
      { incluirXml, incluirPdf, preferirPdfOriginal: true },
      { onSettled: () => setDownloadLabel(null) },
    );
  }

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-accent/20 bg-accent/5">
      <div className="grid gap-4 p-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0 lg:pr-4">
          <h2 className="text-base font-bold text-textStrong">Baixar notas em lote</h2>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Button className="w-full whitespace-nowrap" variant="secondary" onClick={() => downloadLote('XML', true, false)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'XML' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Baixar XML
          </Button>
          <Button className="w-full whitespace-nowrap" variant="secondary" onClick={() => downloadLote('PDF', false, true)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'PDF' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Baixar PDF
          </Button>
          <Button className="w-full whitespace-nowrap" variant="primary" onClick={() => downloadLote('Tudo', true, true)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'Tudo' ? <Loader2 className="animate-spin" size={16} /> : <FileArchive size={16} />}
            Baixar tudo
          </Button>
          <Button className="w-full whitespace-nowrap" variant="secondary" onClick={() => relatorioMutation.mutate()} disabled={relatorioMutation.isPending}>
            {relatorioMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Relatório XLSX
          </Button>
        </div>
      </div>
      {downloadMutation.error ? (
        <div className="mx-4 mb-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200 sm:mx-5">
          Não foi possível baixar o lote: {downloadMutation.error.message}
        </div>
      ) : null}
      {relatorioMutation.error ? (
        <div className="mx-4 mb-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200 sm:mx-5">
          Não foi possível gerar o relatório XLSX: {relatorioMutation.error.message}
        </div>
      ) : null}
    </section>
  );
}
