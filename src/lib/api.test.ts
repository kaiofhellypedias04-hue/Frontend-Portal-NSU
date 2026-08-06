import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, friendlyHttpMessage } from './api';
import { clearAccessToken, setAccessToken } from './auth-storage';

const usuario = { id: 1, empresa_id: 1, email: 'user@example.com', nome: 'User', ativo: true, grupo: 'planning_hub', is_admin: false };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('cliente HTTP autenticado', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(clearAccessToken);

  it('faz login com o contrato esperado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ access_token: 'jwt', token_type: 'bearer', usuario }));
    await expect(api.login({ email: usuario.email, senha: '12345678' })).resolves.toMatchObject({ access_token: 'jwt' });
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/auth/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: usuario.email, senha: '12345678' }) }));
  });

  it('envia o JWT em requisições comuns', async () => {
    setAccessToken('jwt-test');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(usuario));
    await api.me();
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer jwt-test');
    expect(Object.keys(headers).some((key) => key.toLowerCase() === 'x-api-key')).toBe(false);
    expect(Object.keys(headers).some((key) => key.toLowerCase().startsWith('x-operator') || key.toLowerCase() === 'x-device-id')).toBe(false);
  });

  it.each([
    [401, 'sessão'],
    [403, 'permissão'],
    [429, 'tentativas'],
  ])('preserva o status HTTP %i e fornece mensagem amigável', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ detail: message }, status));
    await expect(api.me()).rejects.toMatchObject({ status, detail: message } satisfies Partial<ApiError>);
  });

  it('interpreta detalhes de validação do FastAPI', () => {
    expect(friendlyHttpMessage(422, [{ loc: ['body', 'email'], msg: 'E-mail inválido', type: 'value_error' }])).toBe('E-mail inválido');
  });

  it('envia JWT e devolve blob em download autenticado', async () => {
    setAccessToken('download-token');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('xml', { headers: { 'Content-Type': 'application/xml', 'Content-Disposition': 'attachment; filename="nota.xml"' } }));
    const result = await api.baixarArquivo(9);
    expect(result.filename).toBe('nota.xml');
    expect(result.blob).toBeInstanceOf(Blob);
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer download-token');
  });
});
