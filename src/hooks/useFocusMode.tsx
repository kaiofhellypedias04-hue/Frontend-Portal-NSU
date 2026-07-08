import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'nfse-focus-mode';

type FocusModeContextValue = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
};

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  });

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('focus-mode-enabled', enabled);
  }, [enabled]);

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      toggle: () => setEnabled(!enabled),
    }),
    [enabled],
  );

  return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>;
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used inside FocusModeProvider');
  }
  return context;
}
