# Pendencias de Backend do Portal NFS-e

## Alta prioridade

### `GET /notas/{id}/eventos`
- Tela: detalhe da nota.
- Formato esperado: lista com `tipo`, `codigo`, `descricao`, `data`, `protocolo`, `status`.
- Prioridade: alta para auditoria e rastreabilidade.

### `GET /notas/{id}/tributos-comparativo`
- Tela: detalhe da nota.
- Formato esperado: lista com `tributo`, `informado_nf`, `calculado_sistema`, `diferenca`, `status`.
- Prioridade: alta para conferencia fiscal.
- Observacao: o frontend nao calcula tributos; apenas exibe dados reais da API.

### Exportacao detalhada server-side
- Tela: Conferencia / Notas.
- Endpoint sugerido: `GET /notas/exportacao-detalhada` ou evolucao do endpoint de download existente.
- Formato esperado: CSV/XLSX com colunas fiscais completas, incluindo base de calculo, CSRF, IRRF, INSS, ISS, valor liquido correto, campos ausentes no XML, codigo de servico, CNAE e alertas fiscais.
- Prioridade: alta para relatorios completos fora da pagina atual.

## Media prioridade

### `GET /processos/{id}/arquivos`
- Tela: detalhe de processo, aba Arquivos.
- Formato esperado: lista compatavel com `Arquivo`, incluindo `id`, `tipo`, `filename`, `content_type`, `size_bytes`.
- Prioridade: media para auditoria por processo.

### `GET /processos/{id}/notas`
- Tela: detalhe de processo, aba Notas.
- Formato esperado: lista de notas vinculadas ao processo.
- Prioridade: media para rastrear execucao ate as notas importadas.

### `GET /empresas/resumo-operacional`
- Tela: Processos / Dashboard.
- Formato esperado: `empresa`, `processos`, `corretas`, `divergentes`, `ultima_execucao`, `ultimo_status`, `ultimo_nsu`.
- Prioridade: media.
- Observacao: hoje o frontend deriva um resumo limitado usando `/processos`.

## Baixa prioridade

### Endpoints de credenciais
- Tela: Credenciais, se for criada no portal novo.
- Formato esperado: CRUD seguro para credenciais sem expor segredos.
- Prioridade: baixa neste ciclo, abaixo de notas, conferencia e processos.

### Metadados fiscais detalhados da nota
- Tela: detalhe da nota e exportacao.
- Campos desejados: municipio, base de calculo, CSRF, IRRF, INSS, ISS, valor liquido correto, status de cada tributo, campos ausentes no XML, codigo de servico, CNAE e alertas fiscais.
- Prioridade: baixa/media conforme disponibilidade no backend.
