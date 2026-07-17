import { useEffect, useState } from 'react';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try { const saved = sessionStorage.getItem(key); return saved ? JSON.parse(saved) as T : initialValue; } catch { return initialValue; }
  });
  useEffect(() => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento indisponível */ } }, [key, value]);
  return [value, setValue] as const;
}

export function useRestoreScroll(key: string) {
  useEffect(() => {
    const saved = Number(sessionStorage.getItem(`scroll:${key}`) || 0);
    requestAnimationFrame(() => window.scrollTo({ top: saved }));
    const save = () => sessionStorage.setItem(`scroll:${key}`, String(window.scrollY));
    window.addEventListener('scroll', save, { passive: true });
    return () => { save(); window.removeEventListener('scroll', save); };
  }, [key]);
}
