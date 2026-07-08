import { Activity, Clock3, DatabaseZap, Radio } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useLiveStatus } from '../../hooks/useLiveStatus';
import { formatDateTime } from '../../lib/format';
import { StartConsultasButton } from './StartConsultasButton';

function formatSeconds(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return 'aguardando dados';
  if (seconds <= 0) return 'agora';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

export function LiveStatusBar() {
  const { data, isLoading, isError, error } = useLiveStatus();
  const label = data?.consultando ? 'Consultando ADN agora' : data?.automaticoAtivo ? 'Motor ADN ativo' : 'Motor ADN parado';
  const tone = isError ? 'danger' : data?.consultando || data?.automaticoAtivo ? 'success' : data?.workerEnabled ? 'info' : 'warning';
  const statusMessage = isError ? error.message : data?.mensagem;

  return (
    <section className="glass-card mb-5 flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Badge value={isError ? 'Monitoramento indisponivel' : label} tone={tone} />
        <span className="inline-flex items-center gap-2 text-sm text-textSoft">
          <Radio size={16} className={data?.consultando ? 'text-emerald-300' : data?.filaAtiva ? 'text-amber-300' : 'text-slate-500'} />
          {data?.consultando ? 'Buscando NSU, XML e PDF' : data?.automaticoAtivo ? 'Aguardando certificados elegiveis' : data?.filaAtiva ? 'Fila com pendencias' : 'Fila aguardando'}
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-textSoft">
          <Clock3 size={16} />
          Ciclo ADN: {data?.intervaloCicloMinutos || 15} min
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3 text-sm text-textSoft">
          <span className="inline-flex items-center gap-2">
            <DatabaseZap size={16} />
            Certificados ativos: <strong className="text-white">{isLoading ? '...' : data?.certificadosAtivos || 0}</strong>
          </span>
          <span className="inline-flex items-center gap-2">
            <Activity size={16} />
            {data?.consultando ? 'Fluxo real ativo' : 'Proximo ciclo'}: <strong className="text-white">{formatSeconds(data?.proximoCicloEmSegundos)}</strong>
          </span>
          <span>{isLoading ? 'Carregando status...' : statusMessage}</span>
          <span>Ultima nota: {formatDateTime(data?.ultimaNotaAtualizadaEm)}</span>
        </div>
        <StartConsultasButton automaticoAtivo={data?.automaticoAtivo} disabled={isLoading} />
      </div>
    </section>
  );
}
