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
