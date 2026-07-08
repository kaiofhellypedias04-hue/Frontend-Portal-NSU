import { AlertCircle, CheckCircle2, Clock3, Loader2, PlayCircle } from 'lucide-react';
import { LiveStatusBar } from '../components/live/LiveStatusBar';
import { MetricCard } from '../components/ui/Card';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { Badge } from '../components/ui/Badge';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useProcessos } from '../hooks/useProcessos';
import { formatDateTime } from '../lib/format';

export function Fila() {
  const { data: live } = useLiveStatus();
  const { data: processos = [], isLoading } = useProcessos({ limit: 100 });

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.22em] text-textSoft">Motor ADN e fila</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Consultas automaticas</h1>
        <p className="mt-2 max-w-3xl text-sm text-textSoft">
          Ao iniciar, o backend busca NFS-e por NSU no ADN, salva XML, baixa ou gera o PDF DANFSe, importa os dados para banco/storage e continua ate voce desativar.
        </p>
      </div>

      <LiveStatusBar />
      <NotasDownloadActions filters={{ limit: 500, offset: 0 }} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Processos rodando" value={live?.processosRodando ?? 0} hint="XML e PDF sendo processados">
          <PlayCircle className="text-emerald-300" size={22} />
        </MetricCard>
        <MetricCard label="Pendentes" value={live?.processosPendentes ?? 0} hint="Aguardando worker">
          <Clock3 className="text-amber-300" size={22} />
        </MetricCard>
        <MetricCard label="Com erro" value={live?.processosErro ?? 0} hint="Precisam de revisao">
          <AlertCircle className="text-rose-300" size={22} />
        </MetricCard>
        <MetricCard label="Ultimo ciclo" value={<span className="text-lg">{formatDateTime(live?.ultimoCicloFim)}</span>} hint="Ultimo processo finalizado">
          <CheckCircle2 className="text-sky-300" size={22} />
        </MetricCard>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-borderSoft p-4">
          <h2 className="font-semibold text-white">Processos recentes</h2>
          <p className="text-sm text-textSoft">Acompanhe cada execucao criada pelo controle automatico de consultas.</p>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-textSoft">
            <Loader2 className="animate-spin" size={18} /> Carregando fila...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-950/40 text-xs uppercase tracking-[0.14em] text-textSoft">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">Certificado</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft/70">
                {processos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-4 font-semibold text-white">#{p.id}</td>
                    <td className="px-4 py-4 text-slate-200">#{p.empresa_id}</td>
                    <td className="px-4 py-4 text-slate-200">{p.certificado_id ? `#${p.certificado_id}` : '-'}</td>
                    <td className="px-4 py-4 text-textSoft">{p.tipo}</td>
                    <td className="px-4 py-4">
                      <Badge value={p.status} />
                    </td>
                    <td className="px-4 py-4 text-textSoft">{formatDateTime(p.updated_at || p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
