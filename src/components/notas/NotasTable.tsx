import { ChevronRight, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { InfiniteScrollSentinel } from '../ui/InfiniteScrollSentinel';
import { ResizableDataTable, type ResizableDataColumn } from '../ui/ResizableDataTable';
import { formatCurrency, formatDate, formatServiceCode, timeAgo } from '../../lib/format';
import type { Nota } from '../../types/api';
import { NotaMobileCard } from './NotaMobileCard';

type ColumnAlign = 'left' | 'center' | 'right';

type NotaColumn = ResizableDataColumn<Nota> & {
  align?: ColumnAlign;
};

function compactTimeAgo(value?: string | null) {
  if (!value) return '-';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return timeAgo(value);

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  return formatDate(value);
}


function slaLabel(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.label;
  return nota.sla || nota.sla_status || 'Sem prazo';
}

function operationalBadgeTone(value?: string | null, dangerWhen?: boolean | null) {
  // Quando o chamador informa explicitamente se e "perigo" ou nao (ex.: a
  // coluna Divergencia manda divergencia_fila_final), isso e a fonte da
  // verdade e decide sozinho — sem essa checagem antes do texto, "Sem
  // divergência" caia no `text.includes('diverg')` (que tambem e verdade
  // para "divergência" dentro de "Sem divergência") e ficava vermelho.
  if (dangerWhen === true) return 'danger' as const;
  if (dangerWhen === false) return 'success' as const;
  const text = String(value || '').toLowerCase();
  if (text.includes('sem diverg') || text.includes('nao diverg') || text.includes('não diverg')) return 'success' as const;
  if (text.includes('diverg') || text.includes('alta') || text.includes('danger')) return 'danger' as const;
  if (text.includes('warn') || text.includes('media') || text.includes('pendente')) return 'warning' as const;
  if (text.includes('ok') || text.includes('corret') || text.includes('baixa')) return 'success' as const;
  return 'muted' as const;
}

// Tamanho unico usado em toda a tabela (mesmo dos badges) para as celulas
// nao terem uma mistura de text-sm (herdado da tabela) com text-[11px]
// (badges), o que fazia o texto parecer com tamanhos/formatos diferentes
// entre colunas na mesma linha.
const CELL_TEXT_SIZE = 'text-[11px]';

const NOTAS_COLUMNS: NotaColumn[] = [
  {
    key: 'numero',
    label: 'Nota',
    width: 126,
    minWidth: 42,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => (
      <div className="truncate font-bold text-white" title={nota.numero_nfse || '-'}>{nota.numero_nfse || '-'}</div>
    ),
  },
  {
    key: 'empresa',
    label: 'Empresa',
    width: 230,
    minWidth: 34,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => {
      const empresa = nota.tomador_nome || nota.empresa_nome || '-';
      return (
        <>
          <div className="truncate font-medium text-slate-100" title={empresa}>{empresa}</div>
          <div className="truncate text-textSoft">{nota.tomador_cnpj || '-'}</div>
        </>
      );
    },
  },
  {
    key: 'prestador',
    label: 'Prestador',
    width: 230,
    minWidth: 34,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => {
      const prestador = nota.prestador_nome || '-';
      return (
        <>
          <div className="truncate font-medium text-slate-100" title={prestador}>{prestador}</div>
          <div className="truncate text-textSoft">{nota.prestador_cnpj || '-'}</div>
        </>
      );
    },
  },
  {
    key: 'codigo_servico',
    label: 'Cod. servico',
    width: 112,
    minWidth: 42,
    align: 'center',
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <span title={formatServiceCode(nota.codigo_servico)}>{formatServiceCode(nota.codigo_servico)}</span>,
  },
  { key: 'competencia', label: 'Comp.', width: 94, minWidth: 42, align: 'center', cellClassName: CELL_TEXT_SIZE, render: (nota) => formatDate(nota.competencia) },
  { key: 'emissao', label: 'Emiss.', width: 94, minWidth: 42, align: 'center', cellClassName: CELL_TEXT_SIZE, render: (nota) => formatDate(nota.data_emissao) },
  { key: 'valor', label: 'Valor', width: 110, minWidth: 48, align: 'right', cellClassName: CELL_TEXT_SIZE, render: (nota) => <span className="font-semibold text-slate-100">{formatCurrency(nota.valor_servico)}</span> },
  {
    key: 'status',
    label: 'Status',
    width: 104,
    minWidth: 42,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <Badge value={nota.status_rotulo || nota.status_documento || 'Sem status'} className="max-w-full truncate px-2 text-[11px]" />,
  },
  {
    key: 'divergencia_operacional',
    label: 'Divergência',
    width: 130,
    minWidth: 44,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <Badge value={nota.divergencia_fila_label || nota.divergencia || 'Sem divergência'} tone={operationalBadgeTone(nota.divergencia_fila_label, nota.divergencia_fila_final)} className="max-w-full truncate px-2 text-[11px]" />,
  },
  {
    key: 'prioridade_operacional',
    label: 'Prioridade',
    width: 105,
    minWidth: 42,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <Badge value={nota.prioridade_fila || nota.prioridade || 'baixa'} tone={operationalBadgeTone(nota.prioridade_fila || nota.prioridade)} className="max-w-full truncate px-2 text-[11px]" />,
  },
  {
    key: 'responsavel_operacional',
    label: 'Responsável',
    width: 130,
    minWidth: 44,
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <span title={nota.responsavel || 'Não atribuído'}>{nota.responsavel || 'Não atribuído'}</span>,
  },
  {
    key: 'sla_operacional',
    label: 'SLA',
    width: 78,
    minWidth: 36,
    align: 'center',
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => <Badge value={slaLabel(nota)} tone={operationalBadgeTone(typeof nota.sla === 'object' ? nota.sla?.tone : nota.sla_status)} className="max-w-full truncate px-2 text-[11px]" />,
  },
  {
    key: 'atualizacao',
    label: 'Atual.',
    width: 72,
    minWidth: 36,
    align: 'center',
    cellClassName: CELL_TEXT_SIZE,
    render: (nota) => {
      const atualizadoEm = nota.importado_em || nota.updated_at || nota.created_at;
      return <span title={timeAgo(atualizadoEm)}>{compactTimeAgo(atualizadoEm)}</span>;
    },
  },
];

export function NotasTable({
  notas,
  isLoading,
  error,
  onOpen,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onLoadAll,
  isLoadingAll,
  totalCount,
}: {
  notas: Nota[];
  isLoading?: boolean;
  error?: Error | null;
  onOpen: (nota: Nota) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onLoadAll?: () => void;
  isLoadingAll?: boolean;
  totalCount?: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [loadMenuOpen, setLoadMenuOpen] = useState(false);
  const canLoadAll = Boolean(hasMore || (typeof totalCount === 'number' && totalCount > notas.length));
  const totalLabel = hasMore && (!totalCount || totalCount <= notas.length || totalCount <= 500)
    ? `${notas.length}+ notas no total`
    : `${totalCount ?? notas.length} notas no total`;
  const loadedLabel = hasMore || (typeof totalCount === 'number' && totalCount !== notas.length) ? `${notas.length} carregadas` : null;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const updateScrollHint = () => {
      setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
    };

    updateScrollHint();
    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(element);
    element.addEventListener('scroll', updateScrollHint);

    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', updateScrollHint);
    };
  }, [notas.length]);

  if (isLoading && notas.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center gap-2 p-10 text-textSoft">
        <Loader2 className="animate-spin" size={18} /> Buscando notas consultadas...
      </div>
    );
  }

  if (error && notas.length === 0) {
    return <EmptyState title="Nao foi possivel carregar as notas" description={error.message} />;
  }

  if (notas.length === 0) {
    return <EmptyState title="Nenhuma nota encontrada" description="Quando o backend consultar notas, elas aparecem aqui automaticamente. Ajuste os filtros se necessario." />;
  }

  return (
    <section className="glass-card min-w-0 overflow-hidden">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-borderSoft p-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-white">Notas consultadas</h2>
          <p className="truncate text-sm text-textSoft">Ultimas importadas primeiro. Use o scroll horizontal para ver todas as colunas.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge value={totalLabel} tone="info" />
          {loadedLabel ? (
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/20"
                onClick={() => setLoadMenuOpen((open) => !open)}
              >
                {isLoadingAll ? <Loader2 className="mr-1 animate-spin" size={12} /> : null}
                {loadedLabel}
              </button>
              {loadMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-borderSoft bg-slate-950 p-2 shadow-2xl">
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canLoadAll || isLoadingAll}
                    onClick={() => {
                      onLoadAll?.();
                      setLoadMenuOpen(false);
                    }}
                  >
                    {isLoadingAll ? 'Carregando total...' : `Carregar total${totalCount && totalCount > notas.length ? ` (${totalCount})` : ''}`}
                  </button>
                  <p className="px-3 pb-1 text-xs text-textSoft">Busca todas as notas dos filtros atuais sem precisar ir ate o final.</p>
                </div>
              ) : null}
            </div>
          ) : null}
          {isLoading ? <Loader2 className="animate-spin text-sky-300" size={18} /> : null}
        </div>
      </div>
      {error ? (
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-200">
          Nao consegui atualizar as notas agora. A tabela abaixo pode estar mostrando o ultimo resultado em cache: {error.message}
        </div>
      ) : null}

      <div className="grid gap-3 p-4 md:hidden">
        {notas.map((nota) => <NotaMobileCard key={nota.id} nota={nota} onOpen={onOpen} />)}
      </div>

      <div className="relative hidden min-w-0 p-4 pt-3 md:block">
        <div ref={scrollRef} className="min-w-0">
          <ResizableDataTable
            columns={NOTAS_COLUMNS}
            rows={notas}
            getRowKey={(nota) => nota.id}
            onRowClick={onOpen}
            density="compact"
            tableClassName="text-xs"
            storageKey="dashboard-notas-columns"
          />
        </div>
        {canScrollRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-panel via-panel/80 to-transparent pr-2 text-sky-200">
            <ChevronRight size={18} />
          </div>
        ) : null}
      </div>
      <InfiniteScrollSentinel hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={onLoadMore} />
    </section>
  );
}
