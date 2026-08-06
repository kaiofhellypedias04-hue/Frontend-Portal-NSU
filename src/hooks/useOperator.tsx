import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearOperator as clearStoredOperator,
  getOperator,
  getStorageWarning,
  saveOperator as saveStoredOperator,
  type LocalOperator,
} from '../lib/operator';
import { useAuth } from './useAuth';

type OperatorContextValue = {
  operator: LocalOperator | null;
  storageWarning: boolean;
  saveOperator: (name: string) => LocalOperator;
  clearOperator: () => void;
};

const OperatorContext = createContext<OperatorContextValue | null>(null);

export function OperatorProvider({ children }: { children: ReactNode }) {
  const { usuario, loading: authLoading } = useAuth();
  const [operator, setOperator] = useState<LocalOperator | null>(() => getOperator());
  const [storageWarning, setStorageWarning] = useState(() => getStorageWarning());

  const saveOperator = useCallback((name: string) => {
    const saved = saveStoredOperator(name);
    setOperator(saved);
    setStorageWarning(getStorageWarning());
    return saved;
  }, []);

  const clearOperator = useCallback(() => {
    clearStoredOperator();
    setOperator(null);
    setStorageWarning(getStorageWarning());
  }, []);

  useLayoutEffect(() => {
    if (authLoading) return;

    const nomeUsuario = usuario?.nome?.replace(/\s+/g, ' ').trim();
    if (!usuario) {
      if (operator) clearOperator();
      return;
    }

    if (nomeUsuario && operator?.operator_name !== nomeUsuario) {
      saveOperator(nomeUsuario);
    }
  }, [authLoading, clearOperator, operator, saveOperator, usuario]);

  const value = useMemo(
    () => ({ operator, storageWarning, saveOperator, clearOperator }),
    [clearOperator, operator, saveOperator, storageWarning],
  );

  return <OperatorContext.Provider value={value}>{children}</OperatorContext.Provider>;
}

export function useOperatorContext() {
  const context = useContext(OperatorContext);
  if (!context) {
    throw new Error('useOperatorContext deve ser usado dentro de OperatorProvider.');
  }
  return context;
}
