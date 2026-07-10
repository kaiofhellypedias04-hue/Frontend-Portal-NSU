export type Empresa = {
  id: number;
  nome: string;
  cnpj: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  ambiente: 'producao' | 'homologacao' | 'restrita' | string;
  ativo: boolean;
  criado_em?: string | null;
  atualizado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type StorageListItem = {
  name?: string;
  filename?: string;
  key?: string;
  path?: string;
  size?: number;
  size_bytes?: number;
  updated_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type StorageTestResponse = {
  ok?: boolean;
  status?: string;
  message?: string;
  detail?: unknown;
  [key: string]: unknown;
};

export type Certificado = {
  id: number;
  empresa_id: number;
  nome: string;
  storage_key?: string;
  thumbprint?: string | null;
  subject_cn?: string | null;
  valido_de?: string | null;
  valido_ate?: string | null;
  ativo: boolean;
  senha_configurada?: boolean;
  possui_senha?: boolean;
  possui_storage_key?: boolean;
  criado_em?: string | null;
  atualizado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CertificadoSenhaPayload = {
  senha: string;
  testar_antes?: boolean;
};

export type CertificadoTesteResponse = {
  ok: boolean;
  erro?: string | null;
  cnpj_detectado?: string | null;
  valido_ate?: string | null;
  detail?: unknown;
};

export type ProcessoStatus = 'pendente' | 'rodando' | 'finalizado' | 'erro' | 'cancelado' | string;

export type Processo = {
  id: number;
  empresa_id: number;
  certificado_id?: number | null;
  tipo: string;
  status: ProcessoStatus;
  nsu_inicio?: number | null;
  nsu_final?: number | null;
  limite?: number | null;
  pausa?: number | null;
  gerar_pdf_espelho: boolean;
  baixar_pdf_oficial: boolean;
  erro_resumo?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProcessoSummary = {
  processo_id?: number | null;
  total_notas?: number | null;
  total?: number | null;
  corretas?: number | null;
  divergentes?: number | null;
  pendentes?: number | null;
  canceladas?: number | null;
  substituidas?: number | null;
  total_xml?: number | null;
  total_pdf?: number | null;
  valor_total_servicos?: string | number | null;
  valor_total_iss?: string | number | null;
  nsu_inicio?: number | null;
  nsu_final?: number | null;
  [key: string]: unknown;
};

export type ProcessoJob = {
  id: number;
  processo_id?: number | null;
  status?: string | null;
  tipo?: string | null;
  payload?: Record<string, unknown> | null;
  erro?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};


export type SlaOperacional = {
  label: string;
  tone: 'ok' | 'warn' | 'danger' | 'neutral' | string;
  hours: number | null;
  warn_hours: number | null;
  danger_hours: number | null;
};

export type TipoNota = 'tomada' | 'prestada' | 'indefinida' | 'inconsistente';
export type DirecaoNota = 'recebida' | 'emitida' | 'indefinida' | 'inconsistente';

export type Nota = {
  id: number;
  empresa_id: number;
  empresa_nome?: string | null;
  processo_id?: number | null;
  chave: string;
  numero_nota?: string | number | null;
  numero_nfse?: string | null;
  tipo?: string | null;
  tipo_nota?: TipoNota | string | null;
  direcao_nota?: DirecaoNota | string | null;
  data_emissao?: string | null;
  entrada?: string | null;
  competencia?: string | null;
  prestador_cnpj?: string | null;
  prestador_nome?: string | null;
  prestador?: string | null;
  tomador_cnpj?: string | null;
  tomador_nome?: string | null;
  tomador?: string | null;
  municipio?: string | null;
  municipio_prestacao?: string | null;
  codigo_servico?: string | null;
  cnae?: string | null;
  valor_servico?: string | number | null;
  valor_liquido?: string | number | null;
  valor_liquido_correto?: string | number | null;
  status_nota?: string | null;
  status_nota_pdf?: string | null;
  simples_nacional_xml?: string | null;
  simples_xml?: string | null;
  simples_nacional?: string | null;
  consulta_simples_api?: string | null;
  status_simples_nacional?: string | null;
  incidencia_iss?: string | null;
  status_fila?: string | null;
  status_fila_final?: string | null;
  divergencia_fila_final?: boolean | null;
  divergencia_fila_label?: string | null;
  prioridade_fila?: string | null;
  entrada_fila?: string | null;
  status?: string | null;
  divergencia?: string | null;
  prioridade?: string | null;
  responsavel?: string | null;
  conferencia_por?: string | null;
  conferencia_status?: 'pendente' | 'ok' | 'corrigir' | 'observacao' | string | null;
  observacao?: string | null;
  observacao_interna?: string | null;
  conferencia_observacao?: string | null;
  conferencia_atualizado_em?: string | null;
  prioridade_manual?: string | boolean | null;
  alertas_fiscais?: string | string[] | null;
  sla?: SlaOperacional | string | null;
  sla_status?: string | null;
  status_documento?: string | null;
  status_rotulo?: string | null;
  numero?: string | number | null;
  cnpj_prestador?: string | null;
  cnpj_tomador?: string | null;
  valor?: string | number | null;
  storage_key?: string | null;
  xml_storage_key?: string | null;
  pdf_oficial_storage_key?: string | null;
  pdf_espelho_storage_key?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
  importado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ConferenciaNotasResponse = {
  items: Nota[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type Arquivo = {
  id: number;
  empresa_id?: number | null;
  nota_id?: number | null;
  processo_id?: number | null;
  tipo: string;
  filename?: string | null;
  nome?: string | null;
  storage_backend?: string | null;
  storage_bucket?: string | null;
  storage_key?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  tamanho_bytes?: number | null;
  checksum?: string | null;
  criado_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NotaArquivo = Arquivo;
export type ProcessoArquivo = Arquivo;
export type ProcessoNota = Nota;

export type NotaEvento = {
  id?: number | string;
  nota_id?: number | null;
  tipo?: string | null;
  codigo?: string | null;
  descricao?: string | null;
  data?: string | null;
  protocolo?: string | null;
  status?: string | null;
  chave_afetada?: string | null;
  criado_em?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type NotaTributoComparativo = {
  tributo?: string | null;
  informado_nf?: string | number | null;
  informado_na_nf?: string | number | null;
  calculado_sistema?: string | number | null;
  calculado?: string | number | null;
  diferenca?: string | number | null;
  status?: string | null;
  observacao?: string | null;
  [key: string]: unknown;
};

export type TributoComparativoItem = NotaTributoComparativo;

export type LogProcesso = {
  id: number;
  processo_id: number;
  empresa_id: number;
  level: string;
  mensagem: string;
  contexto_json?: Record<string, unknown> | null;
  criado_em?: string | null;
  created_at?: string | null;
};

export type LogsFilters = {
  processo_id?: string | number;
  empresa_id?: string | number;
  limit?: number;
  offset?: number;
};

export type HealthStatus = {
  status: string;
  [key: string]: unknown;
};

export type ConsultaStatus = {
  consultando: boolean;
  automatico_ativo: boolean;
  mensagem: string;
  worker: {
    enabled: boolean;
    dry_run: boolean;
    sleep: number;
  };
  totais: {
    pendentes: number;
    rodando: number;
    finalizados: number;
    erros: number;
    cancelados: number;
  };
  processos_rodando: Processo[];
  processos_pendentes: Processo[];
};

export type ConsultaIniciarPayload = {
  automatico?: boolean;
  intervalo_minutos?: number;
  empresa_ids?: number[];
  certificado_ids?: number[];
  forcar?: boolean;
  nsu_inicio?: number | null;
  limite?: number;
  pausa?: number;
  gerar_pdf_espelho?: boolean;
  baixar_pdf_oficial?: boolean;
  resetar_fila?: boolean;
};

export type ConsultaDesativarPayload = {
  cancelar_pendentes: boolean;
  cancelar_rodando: boolean;
};

export type CertificadoAutocadastroResponse = {
  empresa?: Empresa | null;
  certificado?: Certificado | null;
  processo?: Processo | null;
  consulta_status?: ConsultaStatus | null;
};

export type NotasFilters = {
  empresa_id?: string;
  certificado_id?: string;
  processo_id?: string;
  status_documento?: string;
  status?: string;
  numero?: string;
  tipo?: string;
  tipo_nota?: TipoNota | string;
  direcao_nota?: DirecaoNota | string;
  prioridade?: string;
  responsavel?: string;
  conferencia?: string;
  conferencia_status?: string;
  incidencia_iss?: string;
  filtrar_por_data?: 'entrada' | 'competencia' | 'atualizacao' | 'sla' | string;
  prestador_cnpj?: string;
  prestador_nome?: string;
  tomador_cnpj?: string;
  chave?: string;
  data_inicio?: string;
  data_fim?: string;
  data_inicial?: string;
  data_final?: string;
  competencia_inicio?: string;
  competencia_fim?: string;
  valor_minimo?: string;
  valor_maximo?: string;
  valor_min?: string;
  valor_max?: string;
  somente_divergentes?: boolean | string;
  status_nota_pdf?: string;
  simples_nacional_xml?: string;
  consulta_simples_api?: string;
  status_simples_nacional?: string;
  divergencia?: string;
  sla?: string;
  sla_status?: string;
  busca?: string;
  sort?: 'recentes' | 'emissao';
  limit?: number;
  offset?: number;
};

export type NotaConferenciaPayload = {
  conferencia_status: 'pendente' | 'ok' | 'corrigir' | 'observacao' | string;
  observacao?: string | null;
  observacao_interna?: string | null;
  conferencia_observacao?: string | null;
  prioridade?: string | null;
  prioridade_manual?: string | boolean | null;
  responsavel?: string | null;
  valor_liquido_correto?: string | number | null;
  alertas_fiscais?: string | string[] | null;
  operator_name?: string;
  operator_id?: string;
  device_id?: string;
};

export type ConferenciaPayload = NotaConferenciaPayload;

export type ProcessoNotasFilters = {
  status?: string;
  conferencia?: string;
  conferencia_status?: string;
  tipo_nota?: TipoNota | string;
  direcao_nota?: DirecaoNota | string;
  busca?: string;
  somente_divergentes?: boolean | string;
  valor_min?: string;
  valor_max?: string;
  valor_minimo?: string;
  valor_maximo?: string;
};

export type RelatorioConferenciaFilters = {
  empresa_id?: string | number;
  certificado_id?: string | number;
  processo_id?: string | number;
  data_inicio?: string;
  data_fim?: string;
  data_inicial?: string;
  data_final?: string;
  competencia_inicio?: string;
  competencia_fim?: string;
  status?: string;
  status_documento?: string;
  conferencia?: string;
  conferencia_status?: string;
  tipo?: string;
  tipo_nota?: TipoNota | string;
  direcao_nota?: DirecaoNota | string;
  busca?: string;
  prioridade?: string;
  responsavel?: string;
  somente_divergentes?: boolean | string;
  valor_min?: string;
  valor_max?: string;
  valor_minimo?: string;
  valor_maximo?: string;
};

export type EmpresasResumoOperacionalFilters = {
  data_inicio?: string;
  data_fim?: string;
  competencia_inicio?: string;
  competencia_fim?: string;
  status?: string;
  conferencia?: string;
  conferencia_status?: string;
};

export type EmpresaResumoOperacional = {
  empresa_id?: number | null;
  id?: number | null;
  empresa?: string | null;
  empresa_nome?: string | null;
  nome?: string | null;
  cnpj?: string | null;
  total_notas?: number | null;
  corretas?: number | null;
  divergentes?: number | null;
  pendentes?: number | null;
  ultima_execucao?: string | null;
  ultimo_status?: string | null;
  ultimo_nsu?: number | null;
  [key: string]: unknown;
};

export type NotasDownloadLoteOptions = {
  incluirXml: boolean;
  incluirPdf: boolean;
  preferirPdfOriginal?: boolean;
};

export type NotasDownloadLoteResponse = {
  blob: Blob;
  filename: string;
};

export type ArquivoDownloadResponse = {
  blob: Blob;
  filename: string;
  contentType: string;
};
