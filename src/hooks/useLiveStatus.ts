import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, STATUS_REFRESH_MS } from '../lib/api';

const CICLO_MINUTOS = 15;
const CICLO_MS = CICLO_MINUTOS * 60 * 1000;

function nextCycleFromLastFinished(finishedAt?: string | null) {
  if (!finishedAt) return null;
  const finished = new Date(finishedAt).getTime();
  if (Number.isNaN(finished)) return null;
  const next = finished + CICLO_MS;
  const remaining = Math.max(0, next - Date.now());
  return Math.ceil(remaining / 1000);
}

export function useLiveStatus() {
  const queryClient = useQueryClient();
  const previousCounters = useRef<string | null>(null);
  const query = useQuery({
    queryKey: ['live-status'],
    queryFn: async () => {
      const [status, certificados, processos, notas] = await Promise.all([
        api.consultasStatus(),
        api.listarCertificados({ ativo: true }),
        api.listarProcessos({ limit: 100, offset: 0 }),
        api.listarNotas({ limit: 100, offset: 0 }),
      ]);

      const finalizados = processos.filter((p) => p.status === 'finalizado');
      const ultimoFinalizado = finalizados
        .slice()
        .sort((a, b) => new Date(b.finished_at || b.updated_at || b.created_at || '').getTime() - new Date(a.finished_at || a.updated_at || a.created_at || '').getTime())[0];
      const empresaAtualId = status.processos_rodando[0]?.empresa_id || status.processos_pendentes[0]?.empresa_id || null;
      const lastNotaDate = notas
        .map((n) => n.importado_em || n.updated_at || n.created_at)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      return {
        consultando: status.consultando,
        automaticoAtivo: status.automatico_ativo,
        mensagem: status.mensagem,
        workerEnabled: status.worker.enabled,
        workerDryRun: status.worker.dry_run,
        monitoramentoAtivo: status.worker.enabled || status.automatico_ativo,
        filaAtiva: status.consultando || status.automatico_ativo || status.totais.pendentes > 0,
        intervaloCicloMinutos: CICLO_MINUTOS,
        certificadosAtivos: certificados.length,
        processosRodando: status.totais.rodando,
        processosPendentes: status.totais.pendentes,
        processosErro: status.totais.erros,
        processosFinalizados: status.totais.finalizados,
        processosCancelados: status.totais.cancelados,
        notasRecentes: notas.length,
        ultimoCicloFim: ultimoFinalizado?.finished_at || ultimoFinalizado?.updated_at || null,
        proximoCicloEmSegundos: status.consultando ? 0 : nextCycleFromLastFinished(ultimoFinalizado?.finished_at || ultimoFinalizado?.updated_at),
        empresaAtualId,
        ultimaNotaAtualizadaEm: lastNotaDate || null,
        processosRodandoLista: status.processos_rodando,
        processosPendentesLista: status.processos_pendentes,
        fonte: 'consultas-status',
      };
    },
    refetchInterval: STATUS_REFRESH_MS,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!query.data) return;
    const counters = [
      query.data.processosPendentes,
      query.data.processosRodando,
      query.data.processosFinalizados,
      query.data.processosErro,
      query.data.processosCancelados,
      query.data.notasRecentes,
      query.data.ultimoCicloFim,
      query.data.ultimaNotaAtualizadaEm,
    ].join(':');
    if (previousCounters.current !== null && previousCounters.current !== counters) {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      queryClient.invalidateQueries({ queryKey: ['certificados'] });
      if (import.meta.env.DEV) {
        console.debug('[live-status] mudanca detectada; notas/processos/certificados invalidados', {
          anterior: previousCounters.current,
          atual: counters,
        });
      }
    }
    previousCounters.current = counters;
  }, [
    query.data?.processosPendentes,
    query.data?.processosRodando,
    query.data?.processosFinalizados,
    query.data?.processosErro,
    query.data?.processosCancelados,
    query.data?.notasRecentes,
    query.data?.ultimoCicloFim,
    query.data?.ultimaNotaAtualizadaEm,
    queryClient,
  ]);

  return query;
}
