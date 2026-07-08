import { Loader2, StopCircle } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProcessoDrawer } from '../components/processos/ProcessoDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCancelarProcesso, useProcessos } from '../hooks/useProcessos';
import { api } from '../lib/api';
import { formatDateTime } from '../lib/format';
import type { EmpresasResumoOperacionalFilters, Processo } from '../types/api';

export function Processos() {
  const { data: processos = [], isLoading } = useProcessos({ limit: 100 });
  const cancelar = useCancelarProcesso();
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [resumoFilters, setResumoFilters] = useState<EmpresasResumoOperacionalFilters>({});
  const resumoEmpresasQuery = useQuery({
    queryKey: ['empresas-resumo-operacional', resumoFilters],
    queryFn: () => api.getEmpresasResumoOperacional(resumoFilters),
    retry: false,
  });

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.22em] text-textSoft">Histórico</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Processos</h1>
        <p className="mt-2 max-w-3xl text-sm text-textSoft">Acompanhe execuções, erros e cancelamentos do backend.</p>
      </div>

      <Card className="mb-5 p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-semibold text-white">Resumo por empresa</h2>
            <p className="text-sm text-textSoft">Visao operacional para identificar empresas corretas, divergentes e pendentes.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <input type="date" className="field" value={resumoFilters.data_inicio || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, data_inicio: event.target.value || undefined }))} />
            <input type="date" className="field" value={resumoFilters.data_fim || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, data_fim: event.target.value || undefined }))} />
            <input className="field" value={resumoFilters.competencia_inicio || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, competencia_inicio: event.target.value || undefined }))} placeholder="Comp. inicio" />
            <input className="field" value={resumoFilters.competencia_fim || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, competencia_fim: event.target.value || undefined }))} placeholder="Comp. fim" />
            <input className="field" value={resumoFilters.status || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, status: event.target.value || undefined }))} placeholder="Status" />
            <input className="field" value={resumoFilters.conferencia_status || ''} onChange={(event) => setResumoFilters((current) => ({ ...current, conferencia_status: event.target.value || undefined }))} placeholder="Conferencia" />
          </div>
        </div>
        {resumoEmpresasQuery.isLoading ? (
          <div className="flex items-center gap-2 text-textSoft"><Loader2 className="animate-spin" size={18} /> Carregando resumo por empresa...</div>
        ) : resumoEmpresasQuery.error ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Resumo operacional por empresa ainda nao disponivel neste ambiente.</div>
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
                  <span className="col-span-2">Ultima execucao: {formatDateTime(item.ultima_execucao)}</span>
                  <span className="col-span-2">Ultimo NSU: {item.ultimo_nsu ?? '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-textSoft"><Loader2 className="animate-spin" size={18} /> Carregando processos...</div>
        ) : (
          <div className="overflow-x-auto">
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
                      {['pendente', 'rodando'].includes(p.status) ? (
                        <Button variant="danger" onClick={(event) => { event.stopPropagation(); cancelar.mutate(p.id); }} disabled={cancelar.isPending}>
                          <StopCircle size={16} /> Cancelar
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <ProcessoDrawer processo={selectedProcesso} onClose={() => setSelectedProcesso(null)} />
    </div>
  );
}
