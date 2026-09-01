import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '../lib/api';
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/auth-storage';
import { queryClient } from '../app/query-client';

import type { ContaCreate, Usuario } from '../types/api';

type AuthContextValue = {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  criarConta: (payload: ContaCreate) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAccessToken();
    setUsuario(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      const localAccess = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
      if (!localAccess) {
        setLoading(false);
        return;
      }
      api.loginLocal()
        .then(autenticarComToken)
        .catch(() => setUsuario(null))
        .finally(() => setLoading(false));
      return;
    }
    api.me().then(setUsuario).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) logout();
    }).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('portal:unauthorized', logout);
    return () => window.removeEventListener('portal:unauthorized', logout);
  }, [logout]);

  async function login(email: string, senha: string) {
    const response = await api.login({ email, senha });
    await autenticarComToken(response);
  }

  async function criarConta(payload: ContaCreate) {
    const response = await api.criarConta(payload);
    await autenticarComToken(response);
  }

  async function autenticarComToken(response: { access_token: string; usuario?: Usuario }) {
    const token = response.access_token;
    if (!token) throw new Error('O backend não retornou um token de acesso válido.');
    setAccessToken(token);
    try {
      setUsuario(response.usuario || await api.me());
    } catch (error) {
      clearAccessToken();
      throw error;
    }
  }

  return <AuthContext.Provider value={{ usuario, loading, login, criarConta, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
