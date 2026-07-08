# Checklist de Homologacao do Portal NFS-e

## Dashboard
- [ ] Abrir dashboard com API online e offline.
- [ ] Validar cards, estados vazios e atualizacao manual.
- [ ] Ativar e desativar modo foco.
- [ ] Exportar relatorio XLSX usando os filtros aplicados.

## Conferencia
- [ ] Aplicar filtros basicos e avancados.
- [ ] Usar busca livre e comandos: `nota:123`, `empresa:canopus`, `prestador:nome`, `status:divergente`, `responsavel:nome`, `prioridade:alta`.
- [ ] Clicar na linha e abrir detalhe da nota.
- [ ] Confirmar que resize/scroll horizontal da tabela nao abre o detalhe.
- [ ] Conferir tabela em modo foco sem scroll horizontal global.
- [ ] Exportar relatorio detalhado XLSX com os mesmos filtros da tela.

## Fila de Trabalho
- [ ] Validar cards operacionais e lista de processos recentes.
- [ ] Confirmar atualizacao do status do motor.
- [ ] Testar responsividade com menu aberto e em modo foco.
- [ ] Exportar relatorio detalhado XLSX.

## NFS-e / Notas
- [ ] Listar notas consultadas.
- [ ] Filtrar por empresa, status, data, prestador e busca inteligente.
- [ ] Clicar na linha e abrir drawer de detalhe.
- [ ] Confirmar que a tabela concentra a navegacao e o drawer concentra as acoes.
- [ ] Exportar relatorio detalhado XLSX com os mesmos filtros da tela.

## Detalhe da Nota
- [ ] Validar resumo: numero, chave, competencia, emissao, empresa, prestador, tomador, CNPJs, municipio, codigo de servico, CNAE, valores, status, tipo e conferencia.
- [ ] Validar analise interna ampliada: status, observacao, observacao interna, prioridade, prioridade manual, responsavel, valor liquido correto e alertas fiscais.
- [ ] Salvar conferencia com `PATCH /notas/{id}/conferencia` e confirmar atualizacao da nota.
- [ ] Confirmar fallback amigavel se `/notas/{id}` falhar.

## Documentos XML/PDF
- [ ] Validar `GET /notas/{id}/arquivos`.
- [ ] Ver XML e baixar XML quando disponivel.
- [ ] Ver PDF e baixar PDF quando disponivel.
- [ ] Validar exibicao de outros arquivos quando retornados pela API.
- [ ] Confirmar mensagem "Nao disponivel" quando nao houver arquivo.
- [ ] Testar download em lote de XML, PDF e ambos.

## Comparativo de Tributos
- [ ] Validar `GET /notas/{id}/tributos-comparativo`.
- [ ] Conferir tributo, informado na NF, calculado pelo sistema, diferenca, status e observacao.
- [ ] Confirmar badges para OK, divergente e indisponivel.
- [ ] Confirmar fallback quando endpoint falhar ou retornar vazio.

## Eventos
- [ ] Validar `GET /notas/{id}/eventos`, quando disponivel.
- [ ] Conferir tipo, codigo, descricao, data, protocolo e status.
- [ ] Confirmar fallback quando a API retornar 404 ou lista vazia.

## Processos
- [ ] Abrir lista de processos.
- [ ] Clicar na linha e abrir detalhe.
- [ ] Validar aba Resumo com `GET /processos/{id}/summary`.
- [ ] Validar abas Jobs e Logs com `/processos/{id}/jobs` e `/processos/{id}/logs`.
- [ ] Validar aba Arquivos com `GET /processos/{id}/arquivos`, filtro por tipo e download.
- [ ] Validar aba Notas com `GET /processos/{id}/notas`, filtros e abertura do detalhe da nota.
- [ ] Confirmar fallbacks das abas Arquivos e Notas quando a API nao existir.
- [ ] Cancelar processo pendente/rodando sem abrir drawer pelo clique do botao.

## Resumo por Empresa
- [ ] Validar `GET /empresas/resumo-operacional`.
- [ ] Filtrar por data, competencia, status e conferencia.
- [ ] Conferir empresa, CNPJ, total de notas, corretas, divergentes, pendentes, ultima execucao, ultimo status e ultimo NSU.
- [ ] Confirmar fallback quando endpoint ainda nao estiver implantado.

## Relatorio XLSX
- [ ] Baixar ZIP de XML.
- [ ] Baixar ZIP de PDF.
- [ ] Baixar ZIP completo.
- [ ] Exportar CSV da pagina atual e validar colunas preenchidas apenas com dados retornados pela API.
- [ ] Exportar XLSX por `POST /relatorios/conferencia`.
- [ ] Confirmar nome do arquivo pelo `Content-Disposition` ou fallback `relatorio_conferencia.xlsx`.
- [ ] Confirmar que o XLSX baixa por blob e nao abre nova aba.

## Certificados e Credenciais
- [ ] Validar listagem de certificados.
- [ ] Fazer upload/teste de certificado em homologacao.
- [ ] Confirmar avisos amigaveis de senha e certificado invalido.
- [ ] Registrar pendencia se fluxo de credenciais exigir endpoints nao existentes.

## Responsividade e Tabelas
- [ ] Testar desktop, tablet e mobile.
- [ ] Confirmar scroll horizontal apenas dentro do wrapper da tabela.
- [ ] Confirmar ausencia de scroll horizontal global.
- [ ] Testar modo foco com sidebar oculta e exibida.
- [ ] Testar resize de colunas onde existir.
- [ ] Confirmar que o puxador redimensiona apenas a coluna ativa.
- [ ] Confirmar que filtros, selecao, clique de linha, botoes de download e menus continuam funcionando apos resize.
