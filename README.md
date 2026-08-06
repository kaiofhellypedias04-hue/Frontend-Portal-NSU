# Portal NFS-e Frontend Starter

Frontend separado para conectar no backend FastAPI do projeto NFS-e ADN.

A regra principal e: **o backend e o motor, o frontend e o painel**.

- O frontend nao roda fila.
- O frontend nao controla o ciclo de consulta diretamente.
- O frontend nao salva senha de certificado no navegador.
- O frontend consome os endpoints do backend usando `VITE_API_BASE_URL`.

## Como rodar

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

No `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STATUS_REFRESH_MS=5000
VITE_ADMIN_ENABLED=false
```

Somente a URL pública da API e o intervalo de atualização pertencem ao frontend. Não configure `API_KEY`, `X-API-Key` ou equivalentes `VITE_*`: qualquer variável Vite é incluída no bundle do navegador. A autenticação do portal usa exclusivamente o JWT Bearer retornado por `/auth/login` ou `/auth/criar-conta`.

Para testar localmente, inicie o backend em `http://localhost:8000`, copie `.env.example` para `.env`, execute `npm install` e `npm run dev`. Use `/login` para uma conta existente ou `/criar-conta` para cadastrar usuário e empresa.

Em produção, configure `VITE_API_BASE_URL` com a URL HTTPS real do backend. Mantenha `VITE_ADMIN_ENABLED=false` até liberar a administração; quando ativada com `true`, ela ainda exige `usuario.is_admin === true`. Com o recurso desligado, novos cadastros usam o grupo `planning_hub` sem exibir seleção.

## Fluxo recomendado

1. Cadastrar empresa.
2. Cadastrar certificado da empresa.
3. Iniciar consultas ADN.
4. Acompanhar processos/notas ao vivo.

## Rotas do frontend

- `/dashboard`: notas consultadas ao vivo + filtro colapsavel.
- `/motor-adn`: iniciar/desativar consultas automaticas e acompanhar status.
- `/empresas`: cadastro e edicao simples de empresas.
- `/certificados`: upload de certificado `.pfx` ou `.p12`.
- `/notas`: tabela/card de notas com drawer de detalhes e download de arquivos.
- `/fila`: visao operacional da fila usando processos existentes.
- `/processos`: historico e cancelamento de processos.
- `/configuracoes`: status de API, banco e storage.

## Endpoints usados

- `GET /health`
- `GET /db/health`
- `GET /storage/health`
- `GET /consultas/status`
- `POST /consultas/iniciar`
- `POST /consultas/desativar`
- `GET /empresas`
- `POST /empresas`
- `PATCH /empresas/{id}`
- `GET /certificados`
- `POST /empresas/{empresa_id}/certificados`
- `POST /certificados/{certificado_id}/testar-senha-salva`
- `DELETE /certificados/{certificado_id}`
- `GET /processos`
- `POST /processos`
- `POST /processos/{processo_id}/cancelar`
- `GET /processos/{processo_id}/logs`
- `GET /notas`
- `GET /notas/{nota_id}`
- `GET /notas/{nota_id}/arquivos`
- `GET /arquivos/{arquivo_id}/download`
