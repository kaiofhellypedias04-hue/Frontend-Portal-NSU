import { FormEvent, useMemo, useState } from 'react';
import { Loader2, PlayCircle, PowerOff, RotateCcw, Settings2 } from 'lucide-react';
import { LiveStatusBar } from '../components/live/LiveStatusBar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCertificados } from '../hooks/useCertificados';
import { useEmpresas } from '../hooks/useEmpresas';
import { useLiveStatus } from '../hooks/useLiveStatus';
import { useDesativarConsultas, useIniciarConsultas } from '../hooks/useProcessos';
import type { ConsultaIniciarPayload } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

function toggleId(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function numericValue(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function MotorAdn() {
  const { data: live } = useLiveStatus();
  const { data: empresas = [], isLoading: loadingEmpresas } = useEmpresas(true);
  const { data: certificados = [], isLoading: loadingCertificados } = useCertificados({ ativo: true });
  const iniciar = useIniciarConsultas();
  const desativar = useDesativarConsultas();

  const [empresaIds, setEmpresaIds] = useState<number[]>([]);
  const [certificadoIds, setCertificadoIds] = useState<number[]>([]);
  const [intervaloMinutos, setIntervaloMinutos] = useState('15');
  const [limite, setLimite] = useState('100');
  const [nsuInicio, setNsuInicio] = useState('');
  const [forcar, setForcar] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);

  const certificadosFiltrados = useMemo(() => {
    if (empresaIds.length === 0) return certificados;
    return certificados.filter((certificado) => empresaIds.includes(certificado.empresa_id));
  }, [certificados, empresaIds]);

  function buildPayload(): ConsultaIniciarPayload {
    return {
      automatico: true,
      intervalo_minutos: numericValue(intervaloMinutos) || 15,
      empresa_ids: empresaIds,
      certificado_ids: certificadoIds,
      nsu_inicio: numericValue(nsuInicio),
      limite: numericValue(limite),
      forcar,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    iniciar.mutate(buildPayload());
  }

  function clearFilters() {
    setEmpresaIds([]);
    setCertificadoIds([]);
    setIntervaloMinutos('15');
    setLimite('100');
    setNsuInicio('');
    setForcar(false);
  }

  const isPending = iniciar.isPending || desativar.isPending;

  return (
    <div>
      <PageHeader eyebrow="Automação" title="Motor ADN" description="Configure e inicie consultas automáticas por NSU com segurança." />

      <LiveStatusBar />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Settings2 size={18} /> Filtros de início
              </h2>
              <p className="mt-1 text-sm text-textSoft">Sem selecionar empresa/certificado, o backend inicia tudo que estiver elegível.</p>
            </div>
            <Badge value={live?.automaticoAtivo ? 'automático ativo' : 'automático parado'} tone={live?.automaticoAtivo ? 'success' : 'warning'} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label>
                <span className="label">Intervalo automático (min)</span>
                <input className="field" type="number" min={1} value={intervaloMinutos} onChange={(event) => setIntervaloMinutos(event.target.value)} />
              </label>
              <label>
                <span className="label">Limite por certificado</span>
                <input className="field" type="number" min={1} value={limite} onChange={(event) => setLimite(event.target.value)} />
              </label>
              <label>
                <span className="label">NSU inicial (nova partida)</span>
                <input className="field" type="number" min={0} value={nsuInicio} onChange={(event) => setNsuInicio(event.target.value)} placeholder="Continuar do atual" />
              </label>
              <label>
                <span className="label">Modo</span>
                <input className="field" value="automático" readOnly />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-borderSoft bg-slate-950/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Empresas</h3>
                  <span className="text-xs text-textSoft">{empresaIds.length || 'todas'}</span>
                </div>
                {loadingEmpresas ? (
                  <p className="text-sm text-textSoft">Carregando empresas...</p>
                ) : (
                  <div className="max-h-60 space-y-2 overflow-auto pr-1">
                    {empresas.map((empresa) => (
                      <label key={empresa.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-800/40">
                        <input type="checkbox" checked={empresaIds.includes(empresa.id)} onChange={() => setEmpresaIds((current) => toggleId(current, empresa.id))} />
                        <span className="min-w-0 flex-1 truncate">{empresa.nome}</span>
                        <span className="text-xs text-textSoft">#{empresa.id}</span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-borderSoft bg-slate-950/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Certificados</h3>
                  <span className="text-xs text-textSoft">{certificadoIds.length || 'todos elegíveis'}</span>
                </div>
                {loadingCertificados ? (
                  <p className="text-sm text-textSoft">Carregando certificados...</p>
                ) : (
                  <div className="max-h-60 space-y-2 overflow-auto pr-1">
                    {certificadosFiltrados.map((certificado) => {
                      const senhaOk = certificado.senha_configurada || certificado.possui_senha;
                      return (
                        <label key={certificado.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-800/40">
                          <input type="checkbox" checked={certificadoIds.includes(certificado.id)} onChange={() => setCertificadoIds((current) => toggleId(current, certificado.id))} />
                          <span className="min-w-0 flex-1 truncate">{certificado.nome}</span>
                          <Badge value={senhaOk ? 'senha ok' : 'sem senha'} tone={senhaOk ? 'success' : 'warning'} />
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-3 rounded-xl border border-borderSoft bg-slate-950/30 p-3 text-sm text-slate-200">
                <input type="checkbox" checked={forcar} onChange={(event) => setForcar(event.target.checked)} />
                Forçar reprocessamento
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" type="submit" disabled={isPending}>
                {iniciar.isPending ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />}
                Iniciar com filtros
              </Button>
              <Button type="button" variant="danger" onClick={() => setConfirmStop(true)} disabled={isPending || (!live?.automaticoAtivo && !live?.consultando)}>
                {desativar.isPending ? <Loader2 className="animate-spin" size={16} /> : <PowerOff size={16} />}
                Desativar
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilters} disabled={isPending}>
                <RotateCcw size={16} /> Limpar filtros
              </Button>
            </div>
          </form>

          {iniciar.isSuccess ? <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{iniciar.data.mensagem}</p> : null}
          {desativar.isSuccess ? <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{desativar.data.mensagem}</p> : null}
          {iniciar.isError ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{iniciar.error.message}</p> : null}
          {desativar.isError ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{desativar.error.message}</p> : null}
        </Card>

        <Card>
          <details>
            <summary className="cursor-pointer rounded-xl font-bold text-textStrong focus-visible:ring-2 focus-visible:ring-accent">Detalhes técnicos da consulta</summary>
            <p className="mt-2 text-sm text-textSoft">Prévia dos dados enviados para o backend.</p>
            <pre className="mt-4 max-h-[460px] overflow-auto rounded-xl bg-slate-950/50 p-4 text-xs text-slate-300">{JSON.stringify(buildPayload(), null, 2)}</pre>
          </details>
        </Card>
      </div>
      <ConfirmDialog open={confirmStop} title="Desativar consultas?" description="Consultas pendentes e em execução serão canceladas. Os dados já processados serão mantidos." confirmLabel="Desativar consultas" onClose={() => setConfirmStop(false)} onConfirm={() => { setConfirmStop(false); desativar.mutate({ cancelar_pendentes: true, cancelar_rodando: true }); }} />
    </div>
  );
}
