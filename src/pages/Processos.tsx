import { Loader2, StopCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProcessoDrawer } from '../components/processos/ProcessoDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useCancelarProcesso, useProcessos } from '../hooks/useProcessos';
import { api } from '../lib/api';
import { formatDateTime } from '../lib/format';
import type { EmpresasResumoOperacionalFilters, Processo } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { usePersistentState, useRestoreScroll } from '../hooks/usePersistentState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function Processos() {
  const { data: processos = [], isLoading } = useProcessos({ limit: 100 });
  const cancelar = useCancelarProcesso();
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [processToCancel, setProcessToCancel] = useState<number | null>(null);
  const [resumoFilters, setResumoFilters] = usePersistentState<EmpresasResumoOperacionalFilters>('filters:processos', {});
  useRestoreScroll('processos');
  const resumoEmpresasQuery = useQuery({
    queryKey: ['empresas-resumo-operacional', resumoFilters],
    queryFn: () => api.getEmpresasResumoOperacional(resumoFilters),
    retry: false,
  });

  const podeCancelar = (p: Processo) => ['pendente', 'rodando'].includes(p.status);

  return (
    <div>
      <PageHeader eyebrow="Histórico" title="Processos" description="Acompanhe execuções, erros e cancelamentos do backend." />

      <Card className="mb-5 p-4">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="font-semibold text-white">Resumo por empresa</h2>
            <p className="text-sm text-textSoft">Visão operacional para identificar empresas corretas, divergentes e pendentes.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label><span className="label">Data inicial</span><input type="date" className="field" value={resumoFilters.data_inicio || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, data_inicio: event.target.value || undefined }))} /></label>
            <label><span className="label">Data final</span><input type="date" className="field" value={resumoFilters.data_fim || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, data_fim: event.target.value || undefined }))} /></label>
            <label><span className="label">Competência inicial</span><input className="field" value={resumoFilters.competencia_inicio || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, competencia_inicio: event.target.value || undefined }))} placeholder="AAAA-MM" /></label>
            <label><span className="label">Competência final</span><input className="field" value={resumoFilters.competencia_fim || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, competencia_fim: event.target.value || undefined }))} placeholder="AAAA-MM" /></label>
            <label><span className="label">Status</span><input className="field" value={resumoFilters.status || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, status: event.target.value || undefined }))} placeholder="Todos" /></label>
            <label><span className="label">Conferência</span><input className="field" value={resumoFilters.conferencia_status || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, conferencia_status: event.target.value || undefined }))} placeholder="Todas" /></label>
          </div>
        </div>
        {resumoEmpresasQuery.isLoading ? (
          <div className="flex items-center gap-2 text-textSoft"><Loader2 className="animate-spin" size={18} /> Carregando resumo por empresa...</div>
        ) : resumoEmpresasQuery.error ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Resumo operacional por empresa ainda não disponível neste ambiente.</div>
        ) : !resumoEmpresasQuery.data?.length ? (
          <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Nenhuma empresa encontrada para os filtros aplicados.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {resumoEmpresasQuery.data.map((item, index) => (
              <div key={String(item.empresa_id ?? item.id ?? index)} className="rounded-xl border border-borderSoft bg-slate-950/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.empresa_nome || item.empresa || item.nome || '-'}</p>
                    <p className="mt-1 text-xs text-textSoft">{item.cnpj || '-'}</p>
                  </div>
                  <Badge value={item.ultimo_status || 'Sem status'} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-textSoft">
                  <span>Total notas: {item.total_notas ?? 0}</span>
                  <span>Corretas: {item.corretas ?? 0}</span>
                  <span>Divergentes: {item.divergentes ?? 0}</span>
                  <span>Pendentes: {item.pendentes ?? 0}</span>
                  <span className="col-span-2">Última execução: {formatDateTime(item.ultima_execucao)}</span>
                  <span className="col-span-2">Último NSU: {item.ultimo_nsu ?? '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {isLoading ? (
        <TableSkeleton title="Carregando processos..." rows={6} />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-3 p-4 md:hidden">
            {processos.map((p) => (
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-2xl border border-borderSoft bg-panel p-4 transition hover:bg-slate-800/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
                onClick={() => setSelectedProcesso(p)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProcesso(p);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">#{p.id}</p>
                    <p className="mt-0.5 text-xs text-textSoft">Empresa #{p.empresa_id}{p.certificado_id ? ` · Certificado #${p.certificado_id}` : ''}</p>
                  </div>
                  <Badge value={p.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-textSoft">
                  <span>Início: {formatDateTime(p.started_at || p.created_at)}</span>
                  <span>Fim: {formatDateTime(p.finished_at)}</span>
                </div>
                {p.erro_resumo ? <p className="mt-2 line-clamp-2 text-xs text-rose-200">{p.erro_resumo}</p> : null}
                {podeCancelar(p) ? (
                  <Button
                    variant="danger"
                    className="mt-3 w-full"
                    onClick={(event) => { event.stopPropagation(); setProcessToCancel(p.id); }}
                    disabled={cancelar.isPending}
                  >
                    <StopCircle size={16} /> Cancelar
                  </Button>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-950/40 text-xs uppercase tracking-[0.14em] text-textSoft">
                <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Certificado</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Início</th><th className="px-4 py-3">Fim</th><th className="px-4 py-3">Erro</th><th className="px-4 py-3 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-borderSoft/70">
                {processos.map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-slate-800/30" onClick={() => setSelectedProcesso(p)}>
                    <td className="px-4 py-4 font-semibold text-white">#{p.id}</td>
                    <td className="px-4 py-4 text-slate-200">#{p.empresa_id}</td>
                    <td className="px-4 py-4 text-slate-200">{p.certificado_id ? `#${p.certificado_id}` : '-'}</td>
                    <td className="px-4 py-4"><Badge value={p.status} /></td>
                    <td className="px-4 py-4 text-textSoft">{formatDateTime(p.started_at || p.created_at)}</td>
                    <td className="px-4 py-4 text-textSoft">{formatDateTime(p.finished_at)}</td>
                    <td className="max-w-[260px] truncate px-4 py-4 text-rose-200">{p.erro_resumo || '-'}</td>
                    <td className="px-4 py-4 text-right">
                      {podeCancelar(p) ? (
                        <Button variant="danger" onClick={(event) => { event.stopPropagation(); setProcessToCancel(p.id); }} disabled={cancelar.isPending}>
                          <StopCircle size={16} /> Cancelar
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <ProcessoDrawer processo={selectedProcesso} onClose={() => setSelectedProcesso(null)} />
      <ConfirmDialog open={processToCancel !== null} title="Cancelar processo?" description={`O processo #${processToCancel ?? ''} será interrompido e não continuará o processamento.`} confirmLabel="Cancelar processo" onClose={() => setProcessToCancel(null)} onConfirm={() => { if (processToCancel !== null) cancelar.mutate(processToCancel); setProcessToCancel(null); }} />
    </div>
  );
}
