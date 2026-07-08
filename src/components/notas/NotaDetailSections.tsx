import { Download, ExternalLink, FileCode2, FileText, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { formatCnpj, formatCurrency, formatDate, formatDateTime, formatServiceCode } from '../../lib/format';
import { useSalvarConferenciaNota } from '../../hooks/useConferenciaNotas';
import { useOperatorContext } from '../../hooks/useOperator';
import type { Arquivo, Nota, NotaTributoComparativo } from '../../types/api';

function displayValue(value?: string | number | null) {
  return value === null || value === undefined || value === '' ? '-' : value;
}


function slaLabel(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.label;
  return nota.sla || nota.sla_status || 'Sem prazo';
}

function prioridadeManualValue(value?: string | boolean | null) {
  if (typeof value === 'string') return value;
  return null;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-borderSoft bg-slate-950/30 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-textSoft">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-100">{displayValue(value)}</p>
    </div>
  );
}

function fileKind(arquivo: Arquivo): 'xml' | 'pdf' | 'outro' {
  const source = `${arquivo.tipo || ''} ${arquivo.filename || ''} ${arquivo.content_type || ''}`.toLowerCase();
  if (source.includes('xml')) return 'xml';
  if (source.includes('pdf')) return 'pdf';
  return 'outro';
}

function formatBytes(value?: number | null) {
  if (!value) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentCard({ kind, arquivo }: { kind: 'xml' | 'pdf' | 'outro'; arquivo?: Arquivo }) {
  const Icon = kind === 'xml' ? FileCode2 : FileText;
  const label = kind === 'outro' ? arquivo?.tipo || 'Arquivo' : kind.toUpperCase();
  const available = Boolean(arquivo?.id);
  const href = available ? api.arquivoDownloadUrl(arquivo!.id) : undefined;

  return (
    <div className="rounded-xl border border-borderSoft bg-slate-950/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-300">
            <Icon size={19} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white">{label}</p>
            <p className="truncate text-xs text-textSoft">{arquivo?.filename || arquivo?.nome || (available ? 'Arquivo disponivel' : 'Nao disponivel')}</p>
            <p className="mt-1 text-xs text-textSoft">Tamanho: {formatBytes(arquivo?.tamanho_bytes ?? arquivo?.size_bytes)}</p>
          </div>
        </div>
        <Badge value={available ? 'Disponivel' : 'Indisponivel'} tone={available ? 'success' : 'warning'} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {href ? (
          <>
            <a href={href} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="px-3">
                <ExternalLink size={15} /> Ver
              </Button>
            </a>
            <a href={href} download>
              <Button variant="secondary" className="px-3">
                <Download size={15} /> Baixar
              </Button>
            </a>
          </>
        ) : (
          <span className="text-sm text-textSoft">Arquivo ainda nao vinculado a esta nota.</span>
        )}
      </div>
    </div>
  );
}

function tributoValue(...values: unknown[]): string | number {
  const value = values.find((item) => item !== null && item !== undefined && item !== '');
  return typeof value === 'string' || typeof value === 'number' ? value : 0;
}

function normalizeTributo(item: NotaTributoComparativo) {
  return {
    tributo: item.tributo || '-',
    informado: tributoValue(item.informado_nf, item.informado_na_nf, item.valor_informado_nf, item.valor_informado, item.informado, item.valor_nf),
    calculado: tributoValue(item.calculado_sistema, item.calculado, item.valor_calculado_sistema, item.valor_calculado),
    diferenca: tributoValue(item.diferenca),
    status: item.status || '-',
    observacao: item.observacao || '-',
  };
}

export function NotaDetailSections({ nota }: { nota: Nota }) {
  const [status, setStatus] = useState(nota.conferencia_status || 'pendente');
  const [observacao, setObservacao] = useState(nota.observacao || nota.conferencia_observacao || '');
  const [observacaoInterna, setObservacaoInterna] = useState(nota.observacao_interna || nota.conferencia_observacao || '');
  const [prioridade, setPrioridade] = useState(nota.prioridade_fila || nota.prioridade || prioridadeManualValue(nota.prioridade_manual) || '');
  const [prioridadeManual, setPrioridadeManual] = useState(Boolean(nota.prioridade_manual));
  const [responsavel, setResponsavel] = useState(nota.responsavel || '');
  const [valorLiquidoCorreto, setValorLiquidoCorreto] = useState(nota.valor_liquido_correto === null || nota.valor_liquido_correto === undefined ? '' : String(nota.valor_liquido_correto));
  const [alertasFiscais, setAlertasFiscais] = useState(Array.isArray(nota.alertas_fiscais) ? nota.alertas_fiscais.join('\n') : nota.alertas_fiscais || '');
  const salvar = useSalvarConferenciaNota();
  const { operator } = useOperatorContext();

  const arquivosQuery = useQuery({
    queryKey: ['nota-arquivos', nota.id],
    queryFn: () => api.getNotaArquivos(nota.id),
  });
  const eventosQuery = useQuery({
    queryKey: ['nota-eventos', nota.id],
    queryFn: () => api.listarEventosNota(nota.id),
    retry: false,
  });
  const tributosQuery = useQuery({
    queryKey: ['nota-tributos-comparativo', nota.id],
    queryFn: () => api.getNotaTributosComparativo(nota.id),
    retry: false,
  });

  const arquivos = arquivosQuery.data || [];
  const xml = useMemo(() => arquivos.find((arquivo) => fileKind(arquivo) === 'xml'), [arquivos]);
  const pdf = useMemo(() => arquivos.find((arquivo) => fileKind(arquivo) === 'pdf'), [arquivos]);
  const outros = useMemo(() => arquivos.filter((arquivo) => fileKind(arquivo) === 'outro'), [arquivos]);

  useEffect(() => {
    setStatus(nota.conferencia_status || 'pendente');
    setObservacao(nota.observacao || nota.conferencia_observacao || '');
    setObservacaoInterna(nota.observacao_interna || nota.conferencia_observacao || '');
    setPrioridade(nota.prioridade_fila || nota.prioridade || prioridadeManualValue(nota.prioridade_manual) || '');
    setPrioridadeManual(Boolean(nota.prioridade_manual));
    setResponsavel(nota.responsavel || operator?.operator_name || '');
    setValorLiquidoCorreto(nota.valor_liquido_correto === null || nota.valor_liquido_correto === undefined ? '' : String(nota.valor_liquido_correto));
    setAlertasFiscais(Array.isArray(nota.alertas_fiscais) ? nota.alertas_fiscais.join('\n') : nota.alertas_fiscais || '');
  }, [nota.id, nota.conferencia_status, nota.conferencia_observacao, nota.observacao, nota.observacao_interna, nota.prioridade_fila, nota.prioridade, nota.prioridade_manual, nota.responsavel, nota.valor_liquido_correto, nota.alertas_fiscais, operator?.operator_name]);

  function save() {
    salvar.mutate({
      notaId: nota.id,
      payload: {
        conferencia_status: status,
        observacao: observacao.trim() || null,
        observacao_interna: observacaoInterna.trim() || null,
        conferencia_observacao: observacao.trim() || null,
        prioridade: prioridade || null,
        prioridade_manual: prioridadeManual ? prioridade || null : null,
        responsavel: responsavel.trim() || operator?.operator_name || null,
        valor_liquido_correto: valorLiquidoCorreto.trim() || null,
        alertas_fiscais: alertasFiscais.trim() || null,
        operator_name: operator?.operator_name,
        operator_id: operator?.operator_id,
        device_id: operator?.device_id,
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge value={nota.status_nota || nota.status_rotulo || nota.status_documento || 'Sem status'} />
        <Badge value={nota.conferencia_status || 'pendente'} />
        <Badge value={nota.prioridade_fila || nota.prioridade || 'Prioridade nao informada'} />
      </div>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Resumo da nota</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="Numero" value={nota.numero_nfse || nota.numero_nota || nota.numero} />
          <Row label="Tipo" value={nota.tipo} />
          <Row label="Competencia" value={formatDate(nota.competencia)} />
          <Row label="Emissao" value={formatDate(nota.data_emissao)} />
          <Row label="Empresa" value={nota.empresa_nome ?? '-'} />
          <Row label="Prestador" value={nota.prestador_nome} />
          <Row label="CNPJ prestador" value={formatCnpj(nota.prestador_cnpj)} />
          <Row label="Tomador" value={nota.tomador_nome} />
          <Row label="CNPJ tomador" value={formatCnpj(nota.tomador_cnpj)} />
          <Row label="Municipio" value={nota.municipio || nota.municipio_prestacao || nota.incidencia_iss} />
          <Row label="Codigo de servico" value={formatServiceCode(nota.codigo_servico)} />
          <Row label="CNAE" value={nota.cnae} />
          <Row label="Valor servico" value={formatCurrency(nota.valor_servico ?? nota.valor)} />
          <Row label="Valor liquido" value={formatCurrency(nota.valor_liquido)} />
          <Row label="Status" value={nota.status_nota || nota.status_rotulo || nota.status_documento || nota.status} />
          <Row label="Status conferencia" value={nota.conferencia_status || 'pendente'} />
          <div className="sm:col-span-2">
            <Row label="Chave" value={nota.chave} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Operacional</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="Simples Nacional / XML" value={nota.simples_nacional || nota.simples_xml || nota.simples_nacional_xml || 'Não informado'} />
          <Row label="Consulta Simples API" value={nota.consulta_simples_api || 'Pendente'} />
          <Row label="Status Simples Nacional" value={nota.status_simples_nacional || 'Pendente'} />
          <Row label="Incidência do ISS" value={nota.incidencia_iss || 'Não informado'} />
          <Row label="Status da fila" value={nota.status_fila_final || nota.status_fila || nota.status || nota.status_documento} />
          <Row label="Divergência" value={nota.divergencia_fila_label || nota.divergencia || 'Sem divergência'} />
          <Row label="Prioridade" value={nota.prioridade_fila || nota.prioridade || prioridadeManualValue(nota.prioridade_manual) || 'baixa'} />
          <Row label="Responsável" value={nota.responsavel || 'Não atribuído'} />
          <Row label="Entrada na fila" value={formatDateTime(nota.entrada_fila || nota.entrada || nota.importado_em || nota.created_at)} />
          <Row label="SLA" value={slaLabel(nota)} />
        </div>
      </section>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Analise interna</h3>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Status da fila" value={nota.status_fila_final || nota.status_fila || nota.status || nota.status_documento} />
            <Row label="Prioridade atual" value={nota.prioridade_fila || nota.prioridade || prioridadeManualValue(nota.prioridade_manual)} />
            <Row label="Responsavel atual" value={nota.responsavel || operator?.operator_name} />
            <Row label="Ultima conferencia" value={formatDateTime(nota.conferencia_atualizado_em)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Status da conferencia</span>
              <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="pendente">Pendente</option>
                <option value="ok">OK</option>
                <option value="corrigir">Corrigir</option>
                <option value="observacao">Observacao</option>
              </select>
            </label>
            <label>
              <span className="label">Prioridade</span>
              <select className="field" value={prioridade} onChange={(event) => setPrioridade(event.target.value)}>
                <option value="">Sem prioridade</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baixa">Baixa</option>
              </select>
            </label>
            <label>
              <span className="label">Responsavel</span>
              <input className="field" value={responsavel} onChange={(event) => setResponsavel(event.target.value)} placeholder="Nome ou equipe" />
            </label>
            <label>
              <span className="label">Valor liquido correto</span>
              <input className="field" inputMode="decimal" value={valorLiquidoCorreto} onChange={(event) => setValorLiquidoCorreto(event.target.value)} placeholder="0,00" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={prioridadeManual} onChange={(event) => setPrioridadeManual(event.target.checked)} />
            Prioridade definida manualmente
          </label>
          <label>
            <span className="label">Observacao</span>
            <textarea className="field min-h-28 resize-y" value={observacao} onChange={(event) => setObservacao(event.target.value)} />
          </label>
          <label>
            <span className="label">Observacao interna</span>
            <textarea className="field min-h-28 resize-y" value={observacaoInterna} onChange={(event) => setObservacaoInterna(event.target.value)} />
          </label>
          <label>
            <span className="label">Alertas fiscais</span>
            <textarea className="field min-h-24 resize-y" value={alertasFiscais} onChange={(event) => setAlertasFiscais(event.target.value)} placeholder="Um alerta por linha, se aplicavel" />
          </label>
          {salvar.isError ? <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">Nao foi possivel salvar: {salvar.error.message}</div> : null}
          {salvar.isSuccess ? <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">Analise salva.</div> : null}
          <div className="flex justify-end">
            <Button variant="primary" onClick={save} disabled={salvar.isPending}>
              {salvar.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar analise
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Documentos da nota</h3>
        {arquivosQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-textSoft"><Loader2 className="animate-spin" size={16} /> Carregando arquivos...</div>
        ) : arquivosQuery.error ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Nao foi possivel consultar os arquivos da nota agora.</div>
        ) : (
          <>
            {!arquivos.length ? (
              <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Nenhum documento disponivel para esta nota.</div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentCard kind="xml" arquivo={xml} />
              <DocumentCard kind="pdf" arquivo={pdf} />
              {outros.map((arquivo) => <DocumentCard key={arquivo.id} kind="outro" arquivo={arquivo} />)}
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Eventos da nota</h3>
        {eventosQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-textSoft"><Loader2 className="animate-spin" size={16} /> Carregando eventos...</div>
        ) : eventosQuery.error ? (
          <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Nao foi possivel carregar os eventos desta nota agora.</div>
        ) : !eventosQuery.data?.length ? (
          <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Nenhum evento disponivel para esta nota.</div>
        ) : (
          <div className="space-y-2">
            {eventosQuery.data.map((evento, index) => (
              <div key={String(evento.id ?? index)} className="rounded-xl border border-borderSoft bg-slate-950/30 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge value={evento.tipo || 'Evento'} />
                  <Badge value={evento.status || 'Sem status'} />
                </div>
                <p className="mt-2 text-sm text-slate-100">{evento.descricao || '-'}</p>
                <p className="mt-1 text-xs text-textSoft">Codigo: {displayValue(evento.codigo)} | Protocolo: {displayValue(evento.protocolo)} | Data: {formatDateTime(evento.data || evento.created_at || evento.criado_em)} | Chave afetada: {displayValue(evento.chave_afetada)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
        <h3 className="mb-3 text-base font-semibold text-white">Comparativo de tributos</h3>
        {tributosQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-textSoft"><Loader2 className="animate-spin" size={16} /> Carregando comparativo...</div>
        ) : tributosQuery.error ? (
          <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Nao foi possivel carregar o comparativo de tributos agora.</div>
        ) : !tributosQuery.data?.length ? (
          <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">Comparativo de tributos ainda nao disponivel para esta nota.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-textSoft">
                <tr>
                  <th className="px-3 py-2">Tributo</th>
                  <th className="px-3 py-2">Informado na NF</th>
                  <th className="px-3 py-2">Calculado pelo sistema</th>
                  <th className="px-3 py-2">Diferenca</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Observacao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft/70">
                {tributosQuery.data.map((item, index) => {
                  const row = normalizeTributo(item);
                  return (
                    <tr key={`${row.tributo}-${index}`}>
                      <td className="px-3 py-2 font-semibold text-white">{row.tributo}</td>
                      <td className="px-3 py-2 text-slate-200">{formatCurrency(row.informado)}</td>
                      <td className="px-3 py-2 text-slate-200">{formatCurrency(row.calculado)}</td>
                      <td className="px-3 py-2 text-slate-200">{formatCurrency(row.diferenca)}</td>
                      <td className="px-3 py-2"><Badge value={row.status} /></td>
                      <td className="px-3 py-2 text-textSoft">{row.observacao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
