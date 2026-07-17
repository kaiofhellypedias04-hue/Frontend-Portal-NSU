import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, Workflow } from 'lucide-react';
import { MetricCard } from '../ui/Card';
import { useLiveStatus } from '../../hooks/useLiveStatus';
import { formatDateTime } from '../../lib/format';

export function CycleSummary() {
  const { data, isLoading } = useLiveStatus();

  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard label="Motor ADN" value={isLoading ? '...' : data?.automaticoAtivo ? 'Ativo' : 'Parado'} hint={data?.mensagem || 'Busca NSU, salva XML, baixa PDF e importa notas'}>
        <Workflow className={data?.automaticoAtivo ? 'text-emerald-300' : 'text-sky-300'} size={22} />
      </MetricCard>
      <MetricCard label="Certificados ativos" value={isLoading ? '...' : data?.certificadosAtivos || 0} hint="Entram automaticamente no monitoramento">
        <ShieldCheck className="text-emerald-300" size={22} />
      </MetricCard>
      <MetricCard label="Rodando" value={isLoading ? '...' : data?.processosRodando || 0} hint="Buscando XML/PDF agora">
        <Clock className="text-amber-300" size={22} />
      </MetricCard>
      <MetricCard label="Erros recentes" value={isLoading ? '...' : data?.processosErro || 0} hint="Verifique a página de processos">
        <AlertTriangle className="text-rose-300" size={22} />
      </MetricCard>
      <MetricCard label="Último ciclo" value={<span className="text-lg">{formatDateTime(data?.ultimoCicloFim)}</span>} hint="Data do último processo finalizado">
        <CheckCircle2 className="text-emerald-300" size={22} />
      </MetricCard>
    </div>
  );
}
