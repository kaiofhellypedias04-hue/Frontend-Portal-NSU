import { Download, FileArchive, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNotasDownloadLote, useRelatorioConferenciaDownload } from '../../hooks/useNotasDownload';
import type { Nota, NotasFilters } from '../../types/api';
import { formatCurrency, formatDate, formatServiceCode } from '../../lib/format';
import { Button } from '../ui/Button';

const EXPORT_COLUMNS: Array<{ label: string; value: (nota: Nota) => string | number | null | undefined }> = [
  { label: 'Competencia', value: (nota) => formatDate(nota.competencia) },
  { label: 'Municipio', value: (nota) => nota.incidencia_iss },
  { label: 'Chave de acesso', value: (nota) => nota.chave },
  { label: 'Data de emissao', value: (nota) => formatDate(nota.data_emissao) },
  { label: 'CNPJ/CPF', value: (nota) => nota.prestador_cnpj || nota.tomador_cnpj },
  { label: 'Razao social', value: (nota) => nota.prestador_nome || nota.tomador_nome },
  { label: 'N documento', value: (nota) => nota.numero_nfse || nota.numero_nota || nota.numero },
  { label: 'Cod. servico', value: (nota) => formatServiceCode(nota.codigo_servico) },
  { label: 'Valor total', value: (nota) => formatCurrency(nota.valor_servico || nota.valor) },
  { label: 'Valor liquido', value: (nota) => formatCurrency(nota.valor_liquido) },
  { label: 'Status nota', value: (nota) => nota.status_nota || nota.status_documento || nota.status },
  { label: 'Prioridade', value: (nota) => nota.prioridade_fila || nota.prioridade || (typeof nota.prioridade_manual === 'string' ? nota.prioridade_manual : null) },
  { label: 'Responsavel', value: (nota) => nota.responsavel },
  { label: 'Observacao interna', value: (nota) => nota.conferencia_observacao },
  { label: 'Incidencia do ISS', value: (nota) => nota.incidencia_iss },
  { label: 'Simples Nacional / XML', value: (nota) => nota.simples_nacional || nota.simples_xml || nota.simples_nacional_xml },
  { label: 'Consulta Simples API', value: (nota) => nota.consulta_simples_api },
  { label: 'Status conferencia', value: (nota) => nota.conferencia_status },
  { label: 'Divergencia', value: (nota) => nota.divergencia_fila_label || nota.divergencia },
  { label: 'SLA', value: (nota) => csvSlaLabel(nota) },
];

function csvSlaLabel(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.label;
  return nota.sla || nota.sla_status || null;
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadCurrentPageCsv(notas: Nota[]) {
  const rows = [
    EXPORT_COLUMNS.map((column) => csvCell(column.label)).join(';'),
    ...notas.map((nota) => EXPORT_COLUMNS.map((column) => csvCell(column.value(nota))).join(';')),
  ];
  const blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'conferencia-pagina-atual.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function NotasDownloadActions({ filters, notasPaginaAtual }: { filters: NotasFilters; notasPaginaAtual?: Nota[] }) {
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
    <section className="mb-5 rounded-xl border border-sky-400/20 bg-sky-500/10 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-white">Baixar notas em lote</h2>
          <p className="text-sm text-textSoft">Gera ZIPs com as notas dos filtros aplicados. Lotes acima de 1000 notas sao baixados em partes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadLote('XML', true, false)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'XML' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Baixar XML
          </Button>
          <Button variant="secondary" onClick={() => downloadLote('PDF', false, true)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'PDF' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Baixar PDF
          </Button>
          <Button variant="primary" onClick={() => downloadLote('Tudo', true, true)} disabled={downloadMutation.isPending}>
            {downloadMutation.isPending && downloadLabel === 'Tudo' ? <Loader2 className="animate-spin" size={16} /> : <FileArchive size={16} />}
            Baixar tudo
          </Button>
          {notasPaginaAtual ? (
            <Button variant="secondary" onClick={() => downloadCurrentPageCsv(notasPaginaAtual)} disabled={notasPaginaAtual.length === 0}>
              <Download size={16} />
              CSV pagina atual
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => relatorioMutation.mutate()} disabled={relatorioMutation.isPending}>
            {relatorioMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Relatorio XLSX
          </Button>
        </div>
      </div>
      {downloadMutation.error ? (
        <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          Nao foi possivel baixar o lote: {downloadMutation.error.message}
        </div>
      ) : null}
      {relatorioMutation.error ? (
        <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          Nao foi possivel gerar o relatorio XLSX: {relatorioMutation.error.message}
        </div>
      ) : null}
    </section>
  );
}
