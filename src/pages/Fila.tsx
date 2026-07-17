import { AlertCircle, CheckCircle2, Clock3, PlayCircle } from 'lucide-react';
import { LiveStatusBar } from '../components/live/LiveStatusBar';
import { MetricCard } from '../components/ui/Card';
import { NotasDownloadActions } from '../components/notas/NotasDownloadActions';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useProcessos } from '../hooks/useProcessos';
import { formatDateTime } from '../lib/format';
import { PageHeader } from '../components/ui/PageHeader';

export function Fila() {
  const { data: live } = useLiveStatus();
  const { data: processos = [], isLoading } = useProcessos({ limit: 100 });

  return (
    <div>
      <PageHeader eyebrow="Motor ADN e fila" title="Consultas automáticas" description="Acompanhe as consultas, importações e documentos processados automaticamente pelo backend." />

      <LiveStatusBar />
      <NotasDownloadActions filters={{ limit: 500, offset: 0 }} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Processos rodando" value={live?.processosRodando ?? 0} hint="XML e PDF sendo processados">
          <PlayCircle className="text-emerald-300" size={22} />
        </MetricCard>
        <MetricCard label="Pendentes" value={live?.processosPendentes ?? 0} hint="Aguardando worker">
          <Clock3 className="text-amber-300" size={22} />
        </MetricCard>
        <MetricCard label="Com erro" value={live?.processosErro ?? 0} hint="Precisam de revisão">
          <AlertCircle className="text-rose-300" size={22} />
        </MetricCard>
        <MetricCard label="Último ciclo" value={<span className="text-lg">{formatDateTime(live?.ultimoCicloFim)}</span>} hint="Último processo finalizado">
          <CheckCircle2 className="text-sky-300" size={22} />
        </MetricCard>
      </div>

      {isLoading ? (
        <TableSkeleton title="Carregando fila..." rows={6} />
      ) : (
        <section className="glass-card overflow-hidden">
          <div className="border-b border-borderSoft p-4">
            <h2 className="font-semibold text-white">Processos recentes</h2>
            <p className="text-sm text-textSoft">Acompanhe cada execução criada pelo controle automático de consultas.</p>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {processos.map((p) => (
              <article key={p.id} className="rounded-2xl border border-borderSoft bg-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">#{p.id}</p>
                    <p className="mt-0.5 text-xs text-textSoft">Empresa #{p.empresa_id}{p.certificado_id ? ` · Certificado #${p.certificado_id}` : ''}</p>
                  </div>
                  <Badge value={p.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-textSoft">
                  <span>{p.tipo}</span>
                  <span>{formatDateTime(p.updated_at || p.created_at)}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
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
        </section>
      )}
    </div>
  );
}
