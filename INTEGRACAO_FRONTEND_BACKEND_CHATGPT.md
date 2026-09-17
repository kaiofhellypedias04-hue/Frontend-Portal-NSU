# Frontend pronto integrado ao backend

Validações realizadas:

```bash
npm install
npx tsc -b --pretty false
npm run build
```

Resultado: TypeScript OK e build Vite gerado em `dist/`.

## Ajustes desta entrega

- Tabela redimensionável agora tem puxador estilo Excel na borda direita do cabeçalho.
- Ao redimensionar, somente a coluna ativa muda de largura.
- Larguras são persistidas no localStorage por tabela.
- Frontend normaliza respostas de API em array direto ou `{ items: [...] }`.
- Tipagem de nota aceita os campos operacionais retornados pelo backend:
  - `simples_xml`
  - `simples_nacional`
  - `status_fila_final`
  - `divergencia_fila_label`
  - `prioridade_fila`
  - `entrada_fila`
  - `sla`
- Tabela operacional usa os campos vindos do backend em vez de recalcular no frontend.
- Drawer da nota exibe seção Operacional.
- Download/relatório usa `POST /relatorios/conferencia`.
- O frontend está apontado para `http://localhost:8000` via `.env`.

## Como rodar

```bash
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` e conversa com a API em `http://localhost:8000`.

## Ajustes de 2026-09-17 (compatibilidade com o backend atual)

- `ProcessoDrawer` mostrava o erro do job lendo `job.erro`; o backend envia `erro_resumo`. Tipo `ProcessoJob` alinhado ao `JobRead` do backend.
- Perfis: o backend distingue `admin`, `operador` e `leitura` (`papel`). O frontend agora tipa `Usuario.papel`, expõe `podeOperar` em `useAuth` e desabilita iniciar/desativar consultas, cancelar processo e salvar análise para `leitura` (rotas que o backend responde com 403). No Admin, o toggle Administrador/Usuário virou um seletor de papel.
- `baixar_pdf_oficial` saiu do payload de consultas/processos: o download do PDF oficial do ADN foi removido do backend. O portal entrega o PDF espelho.
- `resetar_fila` removido do tipo de payload (nunca existiu no backend).
- Login automático em `localhost` (`POST /auth/local`): o backend passou a habilitá-lo pela mesma chave do autocadastro (`LOCAL_SIGNUP_ENABLED=true` no `.env` do backend). Com `iniciar_local.py` antes ele respondia 404.
