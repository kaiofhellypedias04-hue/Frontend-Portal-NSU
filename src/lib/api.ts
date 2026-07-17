import type {
  Arquivo,
  ArquivoDownloadResponse,
  CertificadoAutocadastroResponse,
  Certificado,
  CertificadoSenhaPayload,
  CertificadoTesteResponse,
  ConsultaDesativarPayload,
  ConsultaIniciarPayload,
  ConsultaStatus,
  ConferenciaNotasResponse,
  ConferenciaPayload,
  EmpresaResumoOperacional,
  EmpresasResumoOperacionalFilters,
  Empresa,
  HealthStatus,
  LogProcesso,
  LogsFilters,
  Nota,
  NotaArquivo,
  NotaConferenciaPayload,
  NotaEvento,
  NotaTributoComparativo,
  NotasDownloadLoteOptions,
  NotasDownloadLoteResponse,
  NotasFilters,
  ProcessoArquivo,
  ProcessoNota,
  ProcessoNotasFilters,
  ProcessoSummary,
  Processo,
  ProcessoJob,
  RelatorioConferenciaFilters,
  TributoComparativoItem,
  StorageListItem,
  StorageTestResponse,
} from '../types/api';
import { formatServiceCode } from './format';
import { operatorHeaders } from './operator';

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const STATUS_REFRESH_MS = Number(import.meta.env.VITE_STATUS_REFRESH_MS || 5000);
const REQUEST_TIMEOUT_MS = 15_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;
const NOTAS_PAGE_SIZE = 500;
const DOWNLOAD_CHUNK_SIZE = 1000;

if (import.meta.env.DEV) {
  console.info('[API] Base URL:', API_BASE_URL || '(VITE_API_BASE_URL nao configurada)');
}

export class ApiError extends Error {
  status?: number;
  code: 'offline' | 'timeout' | 'http' | 'parse';
  detail?: unknown;

  constructor(message: string, code: ApiError['code'], status?: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | null | undefined>) {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL nao configurada. Defina a URL do backend no .env do frontend.', 'offline', 0);
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function friendlyHttpMessage(status: number, detail?: unknown) {
  const text = typeof detail === 'string' ? detail.toLowerCase() : JSON.stringify(detail || {}).toLowerCase();
  if (text.includes('senha')) return 'Não foi possível validar a senha do certificado. Confira a senha e tente novamente.';
  if (text.includes('cnpj')) return 'Não foi possível identificar um CNPJ no certificado. Envie um certificado válido da empresa.';
  if (text.includes('certificado') || text.includes('pfx') || text.includes('p12')) return 'O certificado enviado não parece válido. Confira o arquivo .pfx ou .p12 e tente novamente.';
  if (text.includes('cors')) return 'O navegador bloqueou a chamada ao backend por CORS. Verifique a configuração de origens permitidas na API.';
  if (text.includes('upload')) return 'Falha no upload do certificado. Tente novamente.';
  if (status === 404) return 'Endpoint não encontrado no backend. Confira se a API local está atualizada.';
  if (status === 422) return 'Os dados enviados não foram aceitos pelo backend. Revise os campos e tente novamente.';
  if (status >= 500) return 'O backend encontrou um erro interno. Tente novamente e confira os logs da API.';
  if (typeof detail === 'string' && detail.trim()) return detail;
  return `A API respondeu com erro ${status}.`;
}

async function request<T>(path: string, options?: RequestInit & { params?: Record<string, unknown> }): Promise<T> {
  const { params, headers, ...rest } = options || {};
  const url = buildUrl(path, params as Record<string, string | number | boolean | null | undefined>);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...operatorHeaders(),
        ...(headers || {}),
      },
    });
  } catch (error) {
    console.error('Falha na chamada HTTP', { url, error });
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tempo limite ao conectar no backend. Verifique se a API esta respondendo.', 'timeout', undefined, error);
    }
    throw new ApiError('Falha ao conectar na API. Verifique VITE_API_BASE_URL e possível bloqueio de CORS ou API indisponível.', 'offline', 0, error);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      const payload = await response.json();
      detail = payload.detail || payload.message || payload;
    } catch {
      detail = undefined;
    }
    console.error('Erro HTTP na API', { url, status: response.status, detail });
    throw new ApiError(friendlyHttpMessage(response.status, detail), 'http', response.status, detail);
  }

  if (response.status === 204) return undefined as T;

  try {
    return response.json() as Promise<T>;
  } catch (error) {
    throw new ApiError('A API retornou uma resposta invalida.', 'parse', response.status, error);
  }
}

function parseDownloadFilename(contentDisposition: string | null) {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, '').trim());

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1]?.trim() || null;
}

async function requestBlob(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | null | undefined>; fallbackFilename?: string },
): Promise<NotasDownloadLoteResponse> {
  const { params, fallbackFilename = 'notas_nfse.zip', ...rest } = options || {};
  const url = buildUrl(path, params);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(rest.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/zip',
        ...operatorHeaders(),
        ...(rest.headers || {}),
      },
    });
  } catch (error) {
    console.error('Falha na chamada HTTP', { url, error });
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tempo limite ao gerar o ZIP. Tente reduzir os filtros ou confira os logs da API.', 'timeout', undefined, error);
    }
    throw new ApiError('Falha ao conectar na API para baixar o ZIP. Verifique VITE_API_BASE_URL e possível bloqueio de CORS ou API indisponível.', 'offline', 0, error);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        detail = payload.detail || payload.message || payload;
      } else {
        detail = await response.text();
      }
    } catch {
      detail = undefined;
    }
    console.error('Erro HTTP na API', { url, status: response.status, detail });
    throw new ApiError(friendlyHttpMessage(response.status, detail), 'http', response.status, detail);
  }

  const blob = await response.blob();
  const filename = parseDownloadFilename(response.headers.get('content-disposition')) || fallbackFilename;
  return { blob, filename };
}

async function requestArquivoBlob(path: string, fallbackFilename = 'arquivo'): Promise<ArquivoDownloadResponse> {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/pdf, application/xml, text/xml, */*',
        ...operatorHeaders(),
      },
    });
  } catch (error) {
    console.error('Falha na chamada HTTP', { url, error });
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Tempo limite ao abrir o arquivo. Tente novamente.', 'timeout', undefined, error);
    }
    throw new ApiError('Falha ao conectar na API para abrir o arquivo. Verifique VITE_API_BASE_URL e possível bloqueio de CORS ou API indisponível.', 'offline', 0, error);
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.text();
    } catch {
      detail = undefined;
    }
    console.error('Erro HTTP na API', { url, status: response.status, detail });
    throw new ApiError(friendlyHttpMessage(response.status, detail), 'http', response.status, detail);
  }

  const blob = await response.blob();
  const filename = parseDownloadFilename(response.headers.get('content-disposition')) || fallbackFilename;
  const contentType = response.headers.get('content-type') || blob.type || 'application/octet-stream';
  return { blob, filename, contentType };
}

function buildNotasDownloadFiltros(filters?: NotasFilters) {
  return {
    empresa_id: filters?.empresa_id || null,
    certificado_id: filters?.certificado_id || null,
    status: filters?.status_documento || filters?.status || null,
    numero: filters?.numero || null,
    chave: filters?.chave || null,
    cnpj_prestador: filters?.prestador_cnpj || null,
    cnpj_tomador: filters?.tomador_cnpj || null,
    data_inicial: filters?.data_inicio || filters?.data_inicial || null,
    data_final: filters?.data_fim || filters?.data_final || null,
    tipo_nota: filters?.tipo_nota || null,
    direcao_nota: filters?.direcao_nota || null,
    busca: filters?.busca || null,
  };
}

function buildNotasDownloadParams(filters: NotasFilters | undefined, options: NotasDownloadLoteOptions) {
  return {
    ...buildNotasListParams(filters),
    limit: undefined,
    offset: undefined,
    incluir_xml: options.incluirXml,
    incluir_pdf: options.incluirPdf,
    preferir_pdf_original: options.preferirPdfOriginal ?? true,
  };
}

function chunkIds(ids: number[], chunkSize: number) {
  const chunks: number[][] = [];
  for (let index = 0; index < ids.length; index += chunkSize) {
    chunks.push(ids.slice(index, index + chunkSize));
  }
  return chunks;
}

function isDownloadLimitError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return message.includes('limite') && message.includes('1000') && message.includes('zip');
}

function buildPartFilename(filename: string, index: number, total: number) {
  if (total <= 1) return filename;
  const part = `parte-${String(index + 1).padStart(2, '0')}-de-${String(total).padStart(2, '0')}`;
  return filename.toLowerCase().endsWith('.zip') ? filename.replace(/\.zip$/i, `-${part}.zip`) : `${filename}-${part}.zip`;
}

async function listarTodosNotaIds(filters?: NotasFilters) {
  const ids: number[] = [];
  let offset = 0;

  while (true) {
    const notasResponse = await request<Nota[] | { items?: Nota[] }>('/notas', {
      params: buildNotasListParams({ ...filters, limit: NOTAS_PAGE_SIZE, offset }),
    });
    const notas = extractItems(notasResponse);
    ids.push(...notas.map((nota) => nota.id));
    if (notas.length < NOTAS_PAGE_SIZE) break;
    offset += NOTAS_PAGE_SIZE;
  }

  return ids;
}

async function downloadNotasLotePorIds(notaIds: number[], options: NotasDownloadLoteOptions, filters?: NotasFilters) {
  return requestBlob('/notas/download-lote', {
    method: 'POST',
    body: JSON.stringify({
      filtros: buildNotasDownloadFiltros(filters),
      nota_ids: notaIds,
      incluir_xml: options.incluirXml,
      incluir_pdf: options.incluirPdf,
      preferir_pdf_original: options.preferirPdfOriginal ?? true,
    }),
  });
}

async function downloadNotasLoteComFallback(filters: NotasFilters | undefined, options: NotasDownloadLoteOptions) {
  try {
    return [
      await requestBlob('/notas/download-lote', {
        method: 'GET',
        params: buildNotasDownloadParams(filters, options),
      }),
    ];
  } catch (error) {
    if (!isDownloadLimitError(error)) throw error;
  }

  const ids = await listarTodosNotaIds(filters);
  if (ids.length === 0) {
    throw new ApiError('Nenhuma nota encontrada para os filtros aplicados.', 'http', 404);
  }

  const chunks = chunkIds(ids, DOWNLOAD_CHUNK_SIZE);
  const downloads: NotasDownloadLoteResponse[] = [];
  for (const [index, chunk] of chunks.entries()) {
    const download = await downloadNotasLotePorIds(chunk, options, filters);
    downloads.push({
      ...download,
      filename: buildPartFilename(download.filename, index, chunks.length),
    });
  }
  return downloads;
}

function buildNotasListParams(filters?: NotasFilters) {
  return {
    sort: filters?.sort || 'recentes',
    limit: filters?.limit ?? 500,
    offset: filters?.offset ?? 0,
    empresa_id: filters?.empresa_id || undefined,
    certificado_id: filters?.certificado_id || undefined,
    processo_id: filters?.processo_id || undefined,
    status_documento: filters?.status_documento || filters?.status || undefined,
    status: filters?.status || filters?.status_documento || undefined,
    numero: filters?.numero || undefined,
    tipo: filters?.tipo || undefined,
    tipo_nota: filters?.tipo_nota || undefined,
    direcao_nota: filters?.direcao_nota || undefined,
    prioridade: filters?.prioridade || undefined,
    responsavel: filters?.responsavel || undefined,
    conferencia: filters?.conferencia || filters?.conferencia_status || undefined,
    conferencia_status: filters?.conferencia_status || filters?.conferencia || undefined,
    incidencia_iss: filters?.incidencia_iss || undefined,
    filtrar_por_data: filters?.filtrar_por_data || undefined,
    chave: filters?.chave || undefined,
    prestador_cnpj: filters?.prestador_cnpj || undefined,
    cnpj_prestador: filters?.prestador_cnpj || undefined,
    prestador_nome: filters?.prestador_nome || undefined,
    tomador_cnpj: filters?.tomador_cnpj || undefined,
    cnpj_tomador: filters?.tomador_cnpj || undefined,
    data_inicio: filters?.data_inicio || filters?.data_inicial || undefined,
    data_inicial: filters?.data_inicial || filters?.data_inicio || undefined,
    data_fim: filters?.data_fim || filters?.data_final || undefined,
    data_final: filters?.data_final || filters?.data_fim || undefined,
    competencia_inicio: filters?.competencia_inicio || undefined,
    competencia_fim: filters?.competencia_fim || undefined,
    valor_minimo: filters?.valor_minimo || undefined,
    valor_maximo: filters?.valor_maximo || undefined,
    valor_min: filters?.valor_min || filters?.valor_minimo || undefined,
    valor_max: filters?.valor_max || filters?.valor_maximo || undefined,
    somente_divergentes: filters?.somente_divergentes || undefined,
    status_nota_pdf: filters?.status_nota_pdf || undefined,
    simples_nacional_xml: filters?.simples_nacional_xml || undefined,
    consulta_simples_api: filters?.consulta_simples_api || undefined,
    status_simples_nacional: filters?.status_simples_nacional || undefined,
    divergencia: filters?.divergencia || undefined,
    sla: filters?.sla || filters?.sla_status || undefined,
    sla_status: filters?.sla_status || filters?.sla || undefined,
    busca: filters?.busca || undefined,
  };
}

function buildProcessoNotasParams(filters?: ProcessoNotasFilters) {
  return {
    status: filters?.status || undefined,
    conferencia: filters?.conferencia || filters?.conferencia_status || undefined,
    conferencia_status: filters?.conferencia_status || filters?.conferencia || undefined,
    tipo_nota: filters?.tipo_nota || undefined,
    direcao_nota: filters?.direcao_nota || undefined,
    busca: filters?.busca || undefined,
    somente_divergentes: filters?.somente_divergentes || undefined,
    valor_min: filters?.valor_min || filters?.valor_minimo || undefined,
    valor_max: filters?.valor_max || filters?.valor_maximo || undefined,
    valor_minimo: filters?.valor_minimo || filters?.valor_min || undefined,
    valor_maximo: filters?.valor_maximo || filters?.valor_max || undefined,
  };
}

function buildRelatorioConferenciaPayload(filters?: RelatorioConferenciaFilters | NotasFilters) {
  return {
    empresa_id: filters?.empresa_id || undefined,
    certificado_id: filters?.certificado_id || undefined,
    processo_id: filters?.processo_id || undefined,
    data_inicio: filters?.data_inicio || filters?.data_inicial || undefined,
    data_fim: filters?.data_fim || filters?.data_final || undefined,
    competencia_inicio: filters?.competencia_inicio || undefined,
    competencia_fim: filters?.competencia_fim || undefined,
    status: filters?.status || filters?.status_documento || undefined,
    conferencia_status: filters?.conferencia_status || filters?.conferencia || undefined,
    tipo: filters?.tipo || undefined,
    tipo_nota: filters?.tipo_nota || undefined,
    direcao_nota: filters?.direcao_nota || undefined,
    busca: filters?.busca || undefined,
    prioridade: filters?.prioridade || undefined,
    responsavel: filters?.responsavel || undefined,
    somente_divergentes: filters?.somente_divergentes || undefined,
    valor_min: filters?.valor_min || filters?.valor_minimo || undefined,
    valor_max: filters?.valor_max || filters?.valor_maximo || undefined,
  };
}

function normalizeDates<T extends { created_at?: string | null; updated_at?: string | null; criado_em?: string | null; atualizado_em?: string | null }>(item: T): T {
  return {
    ...item,
    created_at: item.created_at ?? item.criado_em ?? null,
    updated_at: item.updated_at ?? item.atualizado_em ?? null,
    criado_em: item.criado_em ?? item.created_at ?? null,
    atualizado_em: item.atualizado_em ?? item.updated_at ?? null,
  };
}

function normalizeEmpresa(empresa: Empresa): Empresa {
  const normalized = normalizeDates(empresa);
  return {
    ...normalized,
    nome: normalized.nome || normalized.razao_social || normalized.nome_fantasia || 'Empresa sem nome',
    ambiente: normalized.ambiente || 'producao',
  };
}

function normalizeCertificado(certificado: Certificado): Certificado {
  return normalizeDates(certificado);
}

function normalizeProcesso(processo: Processo): Processo {
  return normalizeDates(processo);
}


function normalizeSla(value: Nota['sla'], slaStatus?: string | null) {
  if (value && typeof value === 'object') return value;
  const label = typeof value === 'string' && value ? value : slaStatus || 'Sem prazo';
  const tone = slaStatus && ['ok', 'warn', 'danger', 'neutral'].includes(slaStatus) ? slaStatus : 'neutral';
  return { label, tone, hours: null, warn_hours: null, danger_hours: null };
}

function normalizePrioridade(value?: string | boolean | null) {
  if (typeof value === 'boolean') return value ? 'manual' : null;
  return value || null;
}

function normalizeNota(nota: Nota): Nota {
  const normalized = normalizeDates(nota);
  const numero = normalized.numero_nfse ?? normalized.numero_nota ?? normalized.numero ?? null;
  const status = normalized.status ?? normalized.status_documento ?? normalized.status_nota ?? null;
  const simplesXml = normalized.simples_xml ?? normalized.simples_nacional ?? normalized.simples_nacional_xml ?? null;
  const statusFila = normalized.status_fila_final ?? normalized.status_fila ?? normalized.status ?? normalized.divergencia ?? null;
  const divergenciaLabel = normalized.divergencia_fila_label ?? normalized.divergencia ?? (normalized.divergencia_fila_final ? 'Com divergência' : null);
  const prioridadeManual = normalizePrioridade(normalized.prioridade_manual);
  const prioridadeFila = normalized.prioridade_fila ?? normalized.prioridade ?? prioridadeManual ?? null;
  const entradaFila = normalized.entrada_fila ?? normalized.importado_em ?? normalized.updated_at ?? normalized.created_at ?? null;
  const sla = normalizeSla(normalized.sla, normalized.sla_status);
  return {
    ...normalized,
    importado_em: normalized.importado_em ?? normalized.updated_at ?? normalized.created_at ?? null,
    chave: normalized.chave || String(normalized.id),
    numero_nota: numero,
    numero_nfse: numero === null || numero === undefined ? null : String(numero),
    prestador_cnpj: normalized.prestador_cnpj ?? normalized.cnpj_prestador ?? null,
    tomador_cnpj: normalized.tomador_cnpj ?? normalized.cnpj_tomador ?? null,
    cnpj_prestador: normalized.cnpj_prestador ?? normalized.prestador_cnpj ?? null,
    cnpj_tomador: normalized.cnpj_tomador ?? normalized.tomador_cnpj ?? null,
    prestador_nome: normalized.prestador_nome ?? normalized.prestador ?? null,
    tomador_nome: normalized.tomador_nome ?? normalized.tomador ?? null,
    codigo_servico: formatServiceCode(normalized.codigo_servico),
    valor_servico: normalized.valor_servico ?? normalized.valor ?? null,
    status,
    status_nota: normalized.status_nota ?? normalized.status_rotulo ?? normalized.status_documento ?? status,
    status_documento: normalized.status_documento ?? status,
    empresa_nome: normalized.empresa_nome ?? null,
    tipo: normalized.tipo ?? 'NFS-e',
    entrada: normalized.entrada ?? normalized.importado_em ?? normalized.created_at ?? null,
    conferencia_status: normalized.conferencia_status ?? 'pendente',
    simples_xml: simplesXml,
    simples_nacional: normalized.simples_nacional ?? simplesXml,
    simples_nacional_xml: normalized.simples_nacional_xml ?? simplesXml,
    status_fila: normalized.status_fila ?? statusFila,
    status_fila_final: normalized.status_fila_final ?? statusFila,
    divergencia_fila_final: normalized.divergencia_fila_final ?? (String(statusFila || '').toLowerCase() === 'divergente'),
    divergencia_fila_label: divergenciaLabel ?? 'Sem divergência',
    prioridade_manual: prioridadeManual,
    prioridade_fila: prioridadeFila ?? 'baixa',
    prioridade: normalized.prioridade ?? prioridadeFila ?? 'baixa',
    entrada_fila: entradaFila,
    sla,
    sla_status: normalized.sla_status ?? (typeof sla === 'object' ? sla.tone : null),
    xml_storage_key: normalized.xml_storage_key ?? normalized.storage_key ?? null,
  };
}

function normalizeNotasResponse(response: Nota[] | ConferenciaNotasResponse): ConferenciaNotasResponse {
  if (Array.isArray(response)) {
    return {
      items: response.map(normalizeNota),
    };
  }
  const items = Array.isArray(response.items) ? response.items.map(normalizeNota) : [];
  return {
    ...response,
    items,
    total: response.total,
  };
}


function extractItems<T>(response: T[] | { items?: T[]; data?: T[]; results?: T[] } | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function normalizeArquivo(arquivo: Arquivo): Arquivo {
  const normalized = normalizeDates(arquivo);
  return {
    ...normalized,
    filename: normalized.filename ?? normalized.nome ?? null,
    nome: normalized.nome ?? normalized.filename ?? null,
    tamanho_bytes: normalized.tamanho_bytes ?? normalized.size_bytes ?? null,
    size_bytes: normalized.size_bytes ?? normalized.tamanho_bytes ?? null,
  };
}

function normalizeEmpresaResumo(item: EmpresaResumoOperacional): EmpresaResumoOperacional {
  return {
    ...item,
    empresa_id: item.empresa_id ?? item.id ?? null,
    empresa: item.empresa ?? item.empresa_nome ?? item.nome ?? null,
    empresa_nome: item.empresa_nome ?? item.empresa ?? item.nome ?? null,
  };
}

function normalizeConsultaStatus(status: ConsultaStatus): ConsultaStatus {
  return {
    consultando: Boolean(status.consultando),
    automatico_ativo: Boolean(status.automatico_ativo),
    mensagem: status.mensagem || 'Status recebido do backend.',
    worker: {
      enabled: Boolean(status.worker?.enabled),
      dry_run: Boolean(status.worker?.dry_run),
      sleep: Number(status.worker?.sleep || 0),
    },
    totais: {
      pendentes: Number(status.totais?.pendentes || 0),
      rodando: Number(status.totais?.rodando || 0),
      finalizados: Number(status.totais?.finalizados || 0),
      erros: Number(status.totais?.erros || 0),
      cancelados: Number(status.totais?.cancelados || 0),
    },
    processos_rodando: (status.processos_rodando || []).map(normalizeProcesso),
    processos_pendentes: (status.processos_pendentes || []).map(normalizeProcesso),
  };
}

export const api = {
  health: () => request<HealthStatus>('/health'),
  dbHealth: () => request<HealthStatus>('/db/health'),
  storageHealth: () => request<HealthStatus>('/storage/health'),
  storageList: () => request<StorageListItem[]>('/storage/list'),
  storageTestWrite: () => request<StorageTestResponse>('/storage/test-write', { method: 'POST' }),
  storageTestRead: () => request<StorageTestResponse>('/storage/test-read'),

  consultasStatus: async () => normalizeConsultaStatus(await request<ConsultaStatus>('/consultas/status')),
  iniciarConsultas: (payload?: ConsultaIniciarPayload) =>
    request<ConsultaStatus>('/consultas/iniciar', { method: 'POST', body: JSON.stringify(payload || {}) }).then(normalizeConsultaStatus),
  desativarConsultas: (payload?: ConsultaDesativarPayload) =>
    request<ConsultaStatus>('/consultas/desativar', {
      method: 'POST',
      body: JSON.stringify(payload || { cancelar_pendentes: true, cancelar_rodando: false }),
    }).then(normalizeConsultaStatus),

  listarEmpresas: (ativo?: boolean) => request<Empresa[] | { items?: Empresa[] }>('/empresas', { params: { ativo } }).then((response) => extractItems(response).map(normalizeEmpresa)),
  getEmpresasResumoOperacional: (filters?: EmpresasResumoOperacionalFilters) =>
    request<EmpresaResumoOperacional[] | { items?: EmpresaResumoOperacional[] }>('/empresas/resumo-operacional', { params: filters }).then((response) => extractItems(response).map(normalizeEmpresaResumo)),

  listarCertificados: (params?: { empresa_id?: string | number; ativo?: boolean }) =>
    request<Certificado[] | { items?: Certificado[] }>('/certificados', { params }).then((response) => extractItems(response).map(normalizeCertificado)),
  obterCertificado: (certificadoId: number) => request<Certificado>(`/certificados/${certificadoId}`).then(normalizeCertificado),
  listarCertificadosEmpresa: (empresaId: number, ativo?: boolean) =>
    request<Certificado[] | { items?: Certificado[] }>(`/empresas/${empresaId}/certificados`, { params: { ativo } }).then((response) => extractItems(response).map(normalizeCertificado)),
  uploadCertificadoEmpresa: (empresaId: number, formData: FormData) =>
    request<Certificado>(`/empresas/${empresaId}/certificados`, { method: 'POST', body: formData }).then(normalizeCertificado),
  atualizarCertificado: (certificadoId: number, formData: FormData) =>
    request<Certificado>(`/certificados/${certificadoId}`, { method: 'PATCH', body: formData }).then(normalizeCertificado),
  autocadastrarCertificado: async (formData: FormData) => {
    const response = await request<CertificadoAutocadastroResponse>('/certificados/autocadastrar', { method: 'POST', body: formData });
    return {
      ...response,
      empresa: response.empresa ? normalizeEmpresa(response.empresa) : null,
      certificado: response.certificado ? normalizeCertificado(response.certificado) : null,
      processo: response.processo ? normalizeProcesso(response.processo) : null,
      consulta_status: response.consulta_status ? normalizeConsultaStatus(response.consulta_status) : null,
    };
  },
  testarCertificado: (certificadoId: number, senha: string) =>
    request<CertificadoTesteResponse>(`/certificados/${certificadoId}/testar`, {
      method: 'POST',
      body: JSON.stringify({ senha }),
    }),
  salvarSenhaCertificado: (certificadoId: number, payload: CertificadoSenhaPayload) =>
    request<CertificadoTesteResponse | { ok?: boolean; message?: string }>(`/certificados/${certificadoId}/senha`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  statusSenhaCertificado: (certificadoId: number) =>
    request<{ possui_senha?: boolean; senha_configurada?: boolean; [key: string]: unknown }>(`/certificados/${certificadoId}/senha/status`),
  removerSenhaCertificado: (certificadoId: number) =>
    request<{ ok?: boolean; message?: string }>(`/certificados/${certificadoId}/senha`, { method: 'DELETE' }),
  testarSenhaSalva: (certificadoId: number) =>
    request<CertificadoTesteResponse>(`/certificados/${certificadoId}/testar-senha-salva`, { method: 'POST' }),
  desativarCertificado: (certificadoId: number) =>
    request<Certificado>(`/certificados/${certificadoId}`, { method: 'DELETE' }).then(normalizeCertificado),

  listarProcessos: (params?: { empresa_id?: string | number; status?: string; limit?: number; offset?: number }) =>
    request<Processo[] | { items?: Processo[] }>('/processos', { params }).then((response) => extractItems(response).map(normalizeProcesso)),
  obterProcesso: (processoId: number) => request<Processo>(`/processos/${processoId}`).then(normalizeProcesso),
  criarProcesso: (payload: {
    empresa_id: number;
    certificado_id: number;
    tipo: 'consulta_nfse';
    nsu_inicio?: number | null;
    limite: number;
    pausa: number;
    gerar_pdf_espelho: boolean;
    baixar_pdf_oficial: boolean;
  }) => request<Processo>('/processos', { method: 'POST', body: JSON.stringify(payload) }).then(normalizeProcesso),
  cancelarProcesso: (processoId: number) =>
    request<{ status: string; message: string; processo: Processo }>(`/processos/${processoId}/cancelar`, { method: 'POST' }),
  listarJobsProcesso: (processoId: number) =>
    request<ProcessoJob[] | { items?: ProcessoJob[] }>(`/processos/${processoId}/jobs`).then((response) => extractItems(response).map(normalizeDates)),
  listarLogsProcesso: (processoId: number, limit = 80) =>
    request<LogProcesso[] | { items?: LogProcesso[] }>(`/processos/${processoId}/logs`, { params: { limit } }).then((response) => extractItems(response).map(normalizeDates)),
  listarLogs: (filters?: LogsFilters) =>
    request<LogProcesso[] | { items?: LogProcesso[] }>('/logs', { params: { limit: 100, offset: 0, ...filters } }).then((response) => extractItems(response).map(normalizeDates)),
  getProcessoSummary: (processoId: string | number) => request<ProcessoSummary>(`/processos/${processoId}/summary`),

  listarNotas: (filters?: NotasFilters) =>
    request<Nota[] | { items?: Nota[] }>('/notas', { params: buildNotasListParams(filters) }).then((response) => extractItems(response).map(normalizeNota)),
  listarNotasConferencia: (filters?: NotasFilters) =>
    request<Nota[] | ConferenciaNotasResponse>('/notas', { params: buildNotasListParams(filters) }).then(normalizeNotasResponse),
  // `/notas` e paginado (limit<=500) e nunca devolve `total`. `/notas/todas`
  // busca tudo no backend (em lotes internos) e devolve {items, total} real,
  // usado quando precisamos do total exato (ex.: contadores do dashboard).
  listarTodasNotas: (filters?: NotasFilters) => {
    const { limit: _limit, offset: _offset, ...params } = buildNotasListParams(filters);
    return request<ConferenciaNotasResponse>('/notas/todas', { params }).then(normalizeNotasResponse);
  },
  salvarConferenciaNota: (notaId: number, payload: ConferenciaPayload) =>
    request<Nota>(`/notas/${notaId}/conferencia`, { method: 'PATCH', body: JSON.stringify(payload) }).then(normalizeNota),
  updateNotaConferencia: (notaId: string | number, payload: NotaConferenciaPayload) =>
    request<Nota>(`/notas/${notaId}/conferencia`, { method: 'PATCH', body: JSON.stringify(payload) }).then(normalizeNota),
  exportRelatorioConferencia: (filters?: RelatorioConferenciaFilters | NotasFilters) =>
    requestBlob('/relatorios/conferencia', {
      method: 'POST',
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      body: JSON.stringify(buildRelatorioConferenciaPayload(filters)),
      fallbackFilename: filters?.tipo_nota === 'tomada'
        ? 'conferencia_servicos_tomados.xlsx'
        : filters?.tipo_nota === 'prestada'
          ? 'conferencia_servicos_prestados.xlsx'
          : 'relatorio_conferencia.xlsx',
    }),
  downloadNotasLote: (filters: NotasFilters | undefined, options: NotasDownloadLoteOptions) =>
    downloadNotasLoteComFallback(filters, options),
  obterNota: (notaId: number) => request<Nota>(`/notas/${notaId}`).then(normalizeNota),
  obterNotaPorChave: (chave: string, empresaId?: number) =>
    request<Nota>(`/notas/chave/${encodeURIComponent(chave)}`, { params: { empresa_id: empresaId } }).then(normalizeNota),
  getNotaArquivos: (notaId: string | number) => request<NotaArquivo[] | { items?: NotaArquivo[] }>(`/notas/${notaId}/arquivos`).then((response) => extractItems(response).map(normalizeArquivo)),
  listarArquivosNota: (notaId: number) => request<Arquivo[] | { items?: Arquivo[] }>(`/notas/${notaId}/arquivos`).then((response) => extractItems(response).map(normalizeArquivo)),
  listarEventosNota: (notaId: number) => request<NotaEvento[] | { items?: NotaEvento[] }>(`/notas/${notaId}/eventos`).then((response) => extractItems(response).map(normalizeDates)),
  getNotaTributosComparativo: (notaId: string | number) => request<TributoComparativoItem[] | { items?: TributoComparativoItem[] }>(`/notas/${notaId}/tributos-comparativo`).then(extractItems),
  listarTributosComparativoNota: (notaId: number) => request<NotaTributoComparativo[] | { items?: NotaTributoComparativo[] }>(`/notas/${notaId}/tributos-comparativo`).then(extractItems),
  arquivoDownloadUrl: (arquivoId: number) => buildUrl(`/arquivos/${arquivoId}/download`),
  baixarArquivo: (arquivoId: number, fallbackFilename?: string) => requestArquivoBlob(`/arquivos/${arquivoId}/download`, fallbackFilename),
  getProcessoArquivos: (processoId: string | number, filters?: { tipo?: string }) =>
    request<ProcessoArquivo[] | { items?: ProcessoArquivo[] }>(`/processos/${processoId}/arquivos`, { params: filters }).then((response) => extractItems(response).map(normalizeArquivo)),
  listarArquivosProcesso: (processoId: number, filters?: { tipo?: string }) =>
    request<Arquivo[] | { items?: Arquivo[] }>(`/processos/${processoId}/arquivos`, { params: filters }).then((response) => extractItems(response).map(normalizeArquivo)),
  getProcessoNotas: (processoId: string | number, filters?: ProcessoNotasFilters) =>
    request<ProcessoNota[] | { items?: ProcessoNota[] }>(`/processos/${processoId}/notas`, { params: buildProcessoNotasParams(filters) }).then((response) => extractItems(response).map(normalizeNota)),
  listarNotasProcesso: (processoId: number, filters?: ProcessoNotasFilters) =>
    request<Nota[] | { items?: Nota[] }>(`/processos/${processoId}/notas`, { params: buildProcessoNotasParams(filters) }).then((response) => extractItems(response).map(normalizeNota)),
};

export const getNotaArquivos = api.getNotaArquivos;
export const getProcessoArquivos = api.getProcessoArquivos;
export const getProcessoNotas = api.getProcessoNotas;
export const getProcessoSummary = api.getProcessoSummary;
export const getNotaTributosComparativo = api.getNotaTributosComparativo;
export const updateNotaConferencia = api.updateNotaConferencia;
export const exportRelatorioConferencia = api.exportRelatorioConferencia;
export const getEmpresasResumoOperacional = api.getEmpresasResumoOperacional;
