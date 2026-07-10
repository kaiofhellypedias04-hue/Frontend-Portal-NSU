import { AlertTriangle, CheckCircle2, Eye, Loader2, Maximize2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { InfiniteScrollSentinel } from '../ui/InfiniteScrollSentinel';
import { ResizableDataTable, type ResizableDataColumn } from '../ui/ResizableDataTable';
import { formatCnpj, formatCurrency, formatDate, formatDateTime, formatServiceCode } from '../../lib/format';
import type { Nota } from '../../types/api';
import { badgeTone, conferenciaLabel, displayValue, notaNumero, notaValor, tipoNotaLabel } from './conferenciaUtils';

type ColumnAlign = 'left' | 'center' | 'right';

type ConferenciaColumn = ResizableDataColumn<Nota> & {
  align?: ColumnAlign;
};

function getSlaLabel(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.label;
  return nota.sla || nota.sla_status || 'Sem prazo';
}

function getSlaTone(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.tone;
  return nota.sla_status || null;
}

function CompactBadge({ value }: { value?: string | null }) {
  return <Badge value={displayValue(value)} tone={badgeTone(value)} className="max-w-full truncate px-2 py-0.5 text-[11px]" />;
}

function CellText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`truncate ${className}`}>{children}</div>;
}

function isConferenciaOk(nota: Nota) {
  return String(nota.conferencia_status || '').toLowerCase() === 'ok';
}

function isConferenciaPendente(nota: Nota) {
  return String(nota.conferencia_status || 'pendente').toLowerCase() === 'pendente';
}

function isConferenciaObservacao(nota: Nota) {
  return String(nota.conferencia_status || '').toLowerCase() === 'observacao';
}

function createConferenciaColumns(): ConferenciaColumn[] {
  return [
  {
    key: 'numero',
    label: 'N. da nota',
    width: 150,
    minWidth: 44,
    render: (nota) => (
      <div className="truncate font-bold text-white">{notaNumero(nota)}</div>
    ),
  },
  { key: 'tipo_nota', label: 'Tipo', width: 105, render: (nota) => <CompactBadge value={tipoNotaLabel(nota.tipo_nota)} /> },
  { key: 'competencia', label: 'Competencia', width: 125, minWidth: 44, align: 'center', render: (nota) => formatDate(nota.competencia) },
  { key: 'data_emissao', label: 'Data de emissao', width: 135, minWidth: 44, align: 'center', render: (nota) => formatDate(nota.data_emissao) },
  {
    key: 'tomador',
    label: 'Tomador',
    width: 260,
    minWidth: 36,
    render: (nota) => (
      <>
        <CellText className="font-medium text-slate-100">{displayValue(nota.tomador_nome || 'Nao informado no XML')}</CellText>
        <div className="truncate text-xs text-textSoft">{formatCnpj(nota.tomador_cnpj)}</div>
      </>
    ),
  },
  {
    key: 'prestador',
    label: 'Prestador',
    width: 240,
    minWidth: 36,
    render: (nota) => (
      <>
        <CellText className="font-medium text-slate-100">{displayValue(nota.prestador_nome)}</CellText>
        <div className="truncate text-xs text-textSoft">{formatCnpj(nota.prestador_cnpj)}</div>
      </>
    ),
  },
  { key: 'codigo_servico', label: 'Cod. servico', width: 115, minWidth: 44, align: 'center', render: (nota) => formatServiceCode(nota.codigo_servico) },
  { key: 'valor', label: 'Valor', width: 120, minWidth: 50, align: 'right', render: (nota) => <span className="font-semibold text-slate-100">{formatCurrency(notaValor(nota))}</span> },
  { key: 'status_nota', label: 'Status nota', width: 135, minWidth: 44, render: (nota) => <CompactBadge value={nota.status_nota || nota.status_rotulo || nota.status_documento} /> },
  { key: 'simples_xml', label: 'Simples Nacional / XML', width: 230, minWidth: 44, render: (nota) => <CompactBadge value={nota.simples_nacional || nota.simples_xml || nota.simples_nacional_xml} /> },
  { key: 'status_simples', label: 'Status Simples Nacional', width: 240, minWidth: 44, render: (nota) => <CompactBadge value={nota.status_simples_nacional} /> },
  { key: 'incidencia_iss', label: 'Incidencia do ISS', width: 155, minWidth: 44, render: (nota) => <CompactBadge value={nota.incidencia_iss} /> },
  { key: 'status', label: 'Status', width: 120, minWidth: 44, render: (nota) => <CompactBadge value={nota.status_fila_final || nota.status_fila || nota.status || nota.status_documento} /> },
  { key: 'divergencia', label: 'Divergencia', width: 135, minWidth: 44, render: (nota) => <Badge value={nota.divergencia_fila_label || nota.divergencia || 'Sem divergência'} tone={nota.divergencia_fila_final ? 'danger' : 'success'} className="max-w-full truncate px-2 py-0.5 text-[11px]" /> },
  { key: 'prioridade', label: 'Prioridade', width: 125, minWidth: 44, render: (nota) => <CompactBadge value={nota.prioridade_fila || nota.prioridade || (typeof nota.prioridade_manual === 'string' ? nota.prioridade_manual : null)} /> },
  { key: 'responsavel', label: 'Responsavel', width: 145, minWidth: 44, render: (nota) => displayValue(nota.responsavel) },
  { key: 'conferencia', label: 'Conferencia', width: 135, minWidth: 44, render: (nota) => <CompactBadge value={conferenciaLabel(nota.conferencia_status)} /> },
  { key: 'entrada', label: 'Entrada', width: 155, minWidth: 50, align: 'center', render: (nota) => formatDateTime(nota.entrada_fila || nota.entrada || nota.importado_em || nota.created_at) },
  { key: 'sla', label: 'SLA', width: 110, minWidth: 40, render: (nota) => <Badge value={getSlaLabel(nota)} tone={badgeTone(getSlaTone(nota))} className="max-w-full truncate px-2 py-0.5 text-[11px]" /> },
  ];
}

export function ConferenciaTable({
  notas,
  isLoading,
  error,
  onOpen,
  hasMore,
  isLoadingMore,
  onLoadMore,
  totalCount,
  emptyDescription,
}: {
  notas: Nota[];
  isLoading?: boolean;
  error?: Error | null;
  onOpen: (nota: Nota) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  emptyDescription?: string;
}) {
  const [maximized, setMaximized] = useState(false);
  const columns = useMemo(() => createConferenciaColumns(), []);
  const tableColumns = useMemo<ConferenciaColumn[]>(() => [
    {
      key: 'conferencia_indicador',
      label: '',
      width: 36,
      minWidth: 30,
      maxWidth: 48,
      align: 'center',
      render: (nota) => {
        if (isConferenciaOk(nota)) {
          return <CheckCircle2 aria-label="Nota conferida" className="mx-auto text-emerald-300" size={18} />;
        }
        if (isConferenciaPendente(nota)) {
          return <AlertTriangle aria-label="Nota pendente de conferencia" className="mx-auto text-amber-300" size={18} />;
        }
        if (isConferenciaObservacao(nota)) {
          return <Eye aria-label="Nota em observacao" className="mx-auto text-sky-300" size={18} />;
        }
        return null;
      },
    },
    ...columns,
  ], [columns]);

  useEffect(() => {
    if (!maximized) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMaximized(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [maximized]);

  if (isLoading && notas.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center gap-2 p-10 text-textSoft">
        <Loader2 className="animate-spin" size={18} /> Buscando notas para conferencia...
      </div>
    );
  }

  if (error && notas.length === 0) {
    return <EmptyState title="Nao foi possivel carregar a conferencia" description={error.message} />;
  }

  if (notas.length === 0) {
    return <EmptyState title="Nenhuma nota encontrada" description={emptyDescription || 'Ajuste os filtros ou aguarde novas notas importadas pelo backend.'} />;
  }

  function renderTable() {
    return (
      <ResizableDataTable
        columns={tableColumns}
        rows={notas}
        getRowKey={(nota) => nota.id}
        onRowClick={onOpen}
        density="compact"
        tableClassName="text-xs"
        storageKey="conferencia-notas-columns"
      />
    );
  }

  return (
    <>
      <section className="glass-card min-w-0 overflow-hidden">
        <div className="flex min-w-0 flex-col gap-2 border-b border-borderSoft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-semibold text-white">Tabela operacional</h2>
            <p className="text-sm text-textSoft">
              {typeof totalCount === 'number' && totalCount !== notas.length
                ? `${totalCount} notas nos filtros; ${notas.length} carregadas na tabela.`
                : 'Use o scroll horizontal para ver todas as colunas. O scroll fica apenas dentro da tabela.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-borderSoft bg-panel2 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-400/60 hover:bg-slate-800"
              onClick={() => setMaximized(true)}
            >
              <Maximize2 size={14} /> Maximizar tabela
            </button>
            {isLoading ? <Loader2 className="animate-spin text-sky-300" size={18} /> : null}
          </div>
        </div>
        {error ? (
          <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
            Nao consegui atualizar agora. A tabela pode estar mostrando o ultimo resultado em cache: {error.message}
          </div>
        ) : null}

        <div className="w-full min-w-0 p-4 pt-3">
          {renderTable()}
        </div>
        <InfiniteScrollSentinel hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={onLoadMore} label="Carregando mais notas para conferencia..." />
      </section>

      {maximized ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-3 backdrop-blur-sm">
          <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-borderSoft bg-surface shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-borderSoft p-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-white">Tabela operacional</h2>
                <p className="text-xs text-textSoft">Visualizacao maximizada sem zoom, com scroll horizontal dentro da tabela.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-borderSoft bg-panel2 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-400/60 hover:bg-slate-800"
                onClick={() => setMaximized(false)}
              >
                <X size={14} /> Fechar
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {renderTable()}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
