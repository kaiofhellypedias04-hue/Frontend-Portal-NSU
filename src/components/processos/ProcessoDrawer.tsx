import { Download, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { NotaDrawer } from '../notas/NotaDrawer';
import { api } from '../../lib/api';
import { formatCurrency, formatDateTime, formatServiceCode } from '../../lib/format';
import type { Nota, Processo, ProcessoNotasFilters } from '../../types/api';

type Tab = 'resumo' | 'jobs' | 'logs' | 'arquivos' | 'notas';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-borderSoft bg-slate-950/30 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-textSoft">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-100">{value || '-'}</p>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? 'bg-sky-500 text-white' : 'bg-panel2 text-textSoft hover:text-white'}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ProcessoDrawer({ processo, onClose }: { processo: Processo | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('resumo');
  const [arquivoTipo, setArquivoTipo] = useState('');
  const [notaFilters, setNotaFilters] = useState<ProcessoNotasFilters>({});
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const open = Boolean(processo);
  const processoId = processo?.id;

  const detalheQuery = useQuery({
    queryKey: ['processo-detalhe', processoId],
    queryFn: () => api.obterProcesso(processoId!),
    enabled: open && Boolean(processoId),
    placeholderData: (previousData) => previousData,
  });
  const jobsQuery = useQuery({
    queryKey: ['processo-jobs', processoId],
    queryFn: () => api.listarJobsProcesso(processoId!),
    enabled: open && tab === 'jobs' && Boolean(processoId),
  });
  const summaryQuery = useQuery({
    queryKey: ['processo-summary', processoId],
    queryFn: () => api.getProcessoSummary(processoId!),
    enabled: open && tab === 'resumo' && Boolean(processoId),
    retry: false,
  });
  const logsQuery = useQuery({
    queryKey: ['processo-logs', processoId],
    queryFn: () => api.listarLogsProcesso(processoId!, 100),
    enabled: open && tab === 'logs' && Boolean(processoId),
  });
  const arquivosQuery = useQuery({
    queryKey: ['processo-arquivos', processoId, arquivoTipo],
    queryFn: () => api.getProcessoArquivos(processoId!, arquivoTipo ? { tipo: arquivoTipo } : undefined),
    enabled: open && tab === 'arquivos' && Boolean(processoId),
    retry: false,
  });
  const notasQuery = useQuery({
    queryKey: ['processo-notas', processoId, notaFilters],
    queryFn: () => api.getProcessoNotas(processoId!, notaFilters),
    enabled: open && tab === 'notas' && Boolean(processoId),
    retry: false,
  });

  const current = detalheQuery.data || processo;

  return (
    <Drawer open={open} title={`Processo #${current?.id || ''}`} onClose={onClose}>
      {current ? (
        <div className="space-y-5">
          {detalheQuery.error ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">Não foi possível atualizar o processo agora. Mostrando dados da lista.</div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <TabButton active={tab === 'resumo'} label="Resumo" onClick={() => setTab('resumo')} />
            <TabButton active={tab === 'jobs'} label="Jobs" onClick={() => setTab('jobs')} />
            <TabButton active={tab === 'logs'} label="Logs" onClick={() => setTab('logs')} />
            <TabButton active={tab === 'arquivos'} label="Arquivos" onClick={() => setTab('arquivos')} />
            <TabButton active={tab === 'notas'} label="Notas" onClick={() => setTab('notas')} />
          </div>

          {tab === 'resumo' ? (
            <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
              <h3 className="mb-3 text-base font-semibold text-white">Resumo</h3>
              {summaryQuery.isLoading ? <Loading label="Carregando resumo operacional..." /> : null}
              {summaryQuery.error ? <Fallback text="Não foi possível carregar o resumo consolidado agora. Mostrando dados básicos do processo." /> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Total de notas" value={summaryQuery.data?.total_notas ?? summaryQuery.data?.total} />
                <Row label="Corretas" value={summaryQuery.data?.corretas} />
                <Row label="Divergentes" value={summaryQuery.data?.divergentes} />
                <Row label="Pendentes" value={summaryQuery.data?.pendentes} />
                <Row label="Canceladas" value={summaryQuery.data?.canceladas} />
                <Row label="Substituidas" value={summaryQuery.data?.substituidas} />
                <Row label="Total XML" value={summaryQuery.data?.total_xml} />
                <Row label="Total PDF" value={summaryQuery.data?.total_pdf} />
                <Row label="Valor total serviços" value={formatCurrency(summaryQuery.data?.valor_total_servicos)} />
                <Row label="Valor total ISS" value={formatCurrency(summaryQuery.data?.valor_total_iss)} />
                <Row label="Empresa" value={`#${current.empresa_id}`} />
                <Row label="Certificado" value={current.certificado_id ? `#${current.certificado_id}` : '-'} />
                <Row label="Tipo" value={current.tipo} />
                <Row label="Status" value={current.status} />
                <Row label="NSU inicial" value={summaryQuery.data?.nsu_inicio ?? current.nsu_inicio} />
                <Row label="NSU final" value={summaryQuery.data?.nsu_final ?? current.nsu_final} />
                <Row label="Inicio" value={formatDateTime(current.started_at || current.created_at)} />
                <Row label="Fim" value={formatDateTime(current.finished_at)} />
                <div className="sm:col-span-2">
                  <Row label="Erro" value={current.erro_resumo} />
                </div>
              </div>
            </section>
          ) : null}

          {tab === 'jobs' ? (
            <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
              <h3 className="mb-3 text-base font-semibold text-white">Jobs</h3>
              {jobsQuery.isLoading ? <Loading label="Carregando jobs..." /> : null}
              {jobsQuery.error ? <Fallback text="Jobs do processo ainda nao disponiveis pela API." /> : null}
              {jobsQuery.data?.length ? (
                <div className="space-y-2">
                  {jobsQuery.data.map((job) => (
                    <div key={job.id} className="rounded-xl border border-borderSoft bg-slate-950/30 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge value={job.status || 'Sem status'} />
                        <span className="text-sm font-semibold text-white">Job #{job.id}</span>
                        <span className="text-xs text-textSoft">{job.tipo || '-'}</span>
                      </div>
                      {job.erro ? <p className="mt-2 text-sm text-rose-200">{job.erro}</p> : null}
                      <p className="mt-1 text-xs text-textSoft">{formatDateTime(job.created_at || job.criado_em)}</p>
                    </div>
                  ))}
                </div>
              ) : !jobsQuery.isLoading && !jobsQuery.error ? <Fallback text="Nenhum job vinculado a este processo." /> : null}
            </section>
          ) : null}

          {tab === 'logs' ? (
            <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
              <h3 className="mb-3 text-base font-semibold text-white">Logs</h3>
              {logsQuery.isLoading ? <Loading label="Carregando logs..." /> : null}
              {logsQuery.error ? <Fallback text="Logs do processo ainda nao disponiveis pela API." /> : null}
              {logsQuery.data?.length ? (
                <div className="space-y-2">
                  {logsQuery.data.map((log) => (
                    <div key={log.id} className="rounded-xl border border-borderSoft bg-slate-950/30 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge value={log.level} />
                        <span className="text-xs text-textSoft">{formatDateTime(log.created_at || log.criado_em)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-100">{log.mensagem}</p>
                    </div>
                  ))}
                </div>
              ) : !logsQuery.isLoading && !logsQuery.error ? <Fallback text="Nenhum log encontrado para este processo." /> : null}
            </section>
          ) : null}

          {tab === 'arquivos' ? (
            <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-base font-semibold text-white">Arquivos</h3>
                <label className="w-full sm:w-56">
                  <span className="label">Tipo</span>
                  <select className="field" value={arquivoTipo} onChange={(event) => setArquivoTipo(event.target.value)}>
                    <option value="">Todos</option>
                    <option value="XML">XML</option>
                    <option value="PDF">PDF</option>
                    <option value="XLSX">XLSX</option>
                    <option value="CSV">CSV</option>
                    <option value="ZIP">ZIP</option>
                    <option value="relatorio">Relatorio</option>
                    <option value="outros">Outros</option>
                  </select>
                </label>
              </div>
              {arquivosQuery.isLoading ? <Loading label="Carregando arquivos..." /> : null}
              {arquivosQuery.error ? <Fallback text="Não foi possível carregar os arquivos do processo agora." /> : null}
              {!arquivosQuery.isLoading && !arquivosQuery.error && !arquivosQuery.data?.length ? <Fallback text="Nenhum arquivo encontrado para este processo." /> : null}
              {arquivosQuery.data?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-textSoft">
                      <tr>
                        <th className="px-3 py-2">Nome</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2">Tamanho</th>
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2 text-right">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderSoft/70">
                      {arquivosQuery.data.map((arquivo) => (
                        <tr key={arquivo.id}>
                          <td className="px-3 py-2 text-slate-100"><FileText size={15} className="mr-2 inline text-sky-300" />{arquivo.filename || arquivo.nome || arquivo.tipo}</td>
                          <td className="px-3 py-2"><Badge value={arquivo.tipo} /></td>
                          <td className="px-3 py-2 text-textSoft">{formatBytes(arquivo.tamanho_bytes ?? arquivo.size_bytes)}</td>
                          <td className="px-3 py-2 text-textSoft">{formatDateTime(arquivo.created_at || arquivo.criado_em)}</td>
                          <td className="px-3 py-2 text-right">
                            <a href={api.arquivoDownloadUrl(arquivo.id)} download className="inline-flex">
                              <Button variant="secondary" className="px-3 py-2"><Download size={15} /> Baixar</Button>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ) : null}

          {tab === 'notas' ? (
            <section className="rounded-2xl border border-borderSoft bg-slate-950/20 p-4">
              <h3 className="mb-3 text-base font-semibold text-white">Notas</h3>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Status" value={notaFilters.status} onChange={(value) => setNotaFilters((current) => ({ ...current, status: value || undefined }))} />
                <Field label="Conferencia" value={notaFilters.conferencia_status} onChange={(value) => setNotaFilters((current) => ({ ...current, conferencia_status: value || undefined }))} />
                <Field label="Tipo nota" value={notaFilters.tipo_nota} onChange={(value) => setNotaFilters((current) => ({ ...current, tipo_nota: value || undefined }))} />
                <Field label="Busca" value={notaFilters.busca} onChange={(value) => setNotaFilters((current) => ({ ...current, busca: value || undefined }))} />
                <Field label="Valor minimo" value={notaFilters.valor_min} onChange={(value) => setNotaFilters((current) => ({ ...current, valor_min: value || undefined }))} />
                <Field label="Valor maximo" value={notaFilters.valor_max} onChange={(value) => setNotaFilters((current) => ({ ...current, valor_max: value || undefined }))} />
                <label className="flex items-end gap-2 pb-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={notaFilters.somente_divergentes === true}
                    onChange={(event) => setNotaFilters((current) => ({ ...current, somente_divergentes: event.target.checked || undefined }))}
                  />
                  Somente divergentes
                </label>
              </div>
              {notasQuery.isLoading ? <Loading label="Carregando notas..." /> : null}
              {notasQuery.error ? <Fallback text="Não foi possível carregar as notas do processo agora." /> : null}
              {!notasQuery.isLoading && !notasQuery.error && !notasQuery.data?.length ? <Fallback text="Nenhuma nota encontrada para este processo." /> : null}
              {notasQuery.data?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.14em] text-textSoft">
                      <tr>
                        <th className="px-3 py-2">Nota</th>
                        <th className="px-3 py-2">Empresa</th>
                        <th className="px-3 py-2">Prestador</th>
                        <th className="px-3 py-2">Cód. serviço</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Conferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderSoft/70">
                      {notasQuery.data.map((nota) => (
                        <tr key={nota.id} className="cursor-pointer hover:bg-slate-800/30" onClick={() => setSelectedNota(nota)}>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-white">NFS-e {nota.numero_nfse || nota.numero_nota || nota.id}</p>
                            <p className="max-w-[220px] truncate text-xs text-textSoft">{nota.chave}</p>
                          </td>
                          <td className="px-3 py-2 text-slate-200">{nota.empresa_nome || `#${nota.empresa_id}`}</td>
                          <td className="px-3 py-2 text-slate-200">{nota.prestador_nome || '-'}</td>
                          <td className="px-3 py-2 text-slate-200">{formatServiceCode(nota.codigo_servico)}</td>
                          <td className="px-3 py-2 text-slate-200">{formatCurrency(nota.valor_servico ?? nota.valor)}</td>
                          <td className="px-3 py-2"><Badge value={nota.status_nota || nota.status_documento || 'Sem status'} /></td>
                          <td className="px-3 py-2"><Badge value={nota.conferencia_status || 'pendente'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ) : null}
          <NotaDrawer nota={selectedNota} onClose={() => setSelectedNota(null)} />
        </div>
      ) : null}
    </Drawer>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-textSoft">
      <Loader2 className="animate-spin" size={16} /> {label}
    </div>
  );
}

function Fallback({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-borderSoft p-4 text-sm text-textSoft">{text}</div>;
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function formatBytes(value?: number | null) {
  if (!value) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
