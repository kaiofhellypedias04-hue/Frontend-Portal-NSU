# Correções aplicadas no frontend

Data: 2026-07-07

## Validação realizada

```bash
npx tsc -b --pretty false
npm run build
```

Resultado: TypeScript OK e build Vite gerado com sucesso.

## Principais ajustes

1. **Tabela redimensionável estilo Excel**
   - Criado componente reutilizável `src/components/ui/ResizableDataTable.tsx`.
   - `NotasTable` e `ConferenciaTable` agora usam o mesmo motor de colunas redimensionáveis.
   - O puxador fica na borda direita do cabeçalho.
   - Ao arrastar, somente a coluna ativa muda de largura.
   - A coluna vizinha não aumenta nem diminui automaticamente.
   - O scroll horizontal fica dentro do wrapper da tabela.

2. **Resize mais estável**
   - Mantido o hook `useResizableColumns` com `requestAnimationFrame`.
   - O `localStorage` é salvo somente no fim do resize.
   - O resize bloqueia seleção de texto e usa cursor `col-resize` durante o arraste.

3. **Remoção de zoom na Conferência**
   - A tabela maximizada da Conferência não usa mais `zoom`.
   - Agora mantém comportamento normal de tabela com scroll interno.

4. **API mais tolerante a respostas diferentes**
   - Adicionado helper `extractItems` em `src/lib/api.ts`.
   - O frontend agora aceita respostas em lista direta `[]` ou em envelope `{ items: [] }` para várias rotas.
   - Isso evita bugs silenciosos como `.map is not a function` quando o backend retorna paginação.

5. **Invalidação de cache mais completa**
   - Criado `src/hooks/queryInvalidation.ts`.
   - Após salvar conferência, iniciar/cancelar processo ou alterar certificado, o frontend invalida notas, conferência, totais, processos, empresas, certificados e status ao vivo.

6. **Empresas ativada no menu**
   - A rota `/empresas` agora abre a página de Empresas.
   - O menu lateral passou a exibir Empresas.

7. **Pacote limpo**
   - O ZIP final não inclui `node_modules`.
   - O `dist` gerado foi mantido para conferência/build de produção.

## Como rodar

```bash
npm install
npm run dev
```

Para build de produção:

```bash
npm run build
```

## Observação

O projeto usa `VITE_API_BASE_URL` no `.env`. Confira se ele aponta para o backend local correto antes de rodar.
