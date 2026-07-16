import { Loader2, PlayCircle, PowerOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDesativarConsultas, useIniciarConsultas } from '../../hooks/useProcessos';

export function StartConsultasButton({ automaticoAtivo, disabled }: { automaticoAtivo?: boolean; disabled?: boolean }) {
  const iniciar = useIniciarConsultas();
  const desativar = useDesativarConsultas();
  const isPending = iniciar.isPending || desativar.isPending;
  const error = iniciar.error || desativar.error;
  const successMessage = iniciar.isSuccess
    ? 'Motor ADN ativado: XML, PDF e importacao continuam ate desativar.'
    : desativar.isSuccess
      ? 'Motor ADN desativado. Processos pendentes e em andamento foram cancelados.'
      : null;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      {automaticoAtivo ? (
        <Button variant="danger" onClick={() => desativar.mutate({ cancelar_pendentes: true, cancelar_rodando: true })} disabled={disabled || isPending}>
          {desativar.isPending ? <Loader2 className="animate-spin" size={16} /> : <PowerOff size={16} />}
          Desativar consultas
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={() => iniciar.mutate({ automatico: true, intervalo_minutos: 15, empresa_ids: [], certificado_ids: [], limite: 100, forcar: false })}
          disabled={disabled || isPending}
        >
          {iniciar.isPending ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />}
          Iniciar consultas ADN
        </Button>
      )}
      {successMessage ? <p className="text-xs text-emerald-300">{successMessage}</p> : null}
      {error ? <p className="max-w-xs text-xs text-rose-300">{error.message}</p> : null}
    </div>
  );
}
