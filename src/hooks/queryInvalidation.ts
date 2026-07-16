import type { QueryClient } from '@tanstack/react-query';

const PORTAL_SYNC_CHANNEL = 'nfse-portal-data-sync';
const PORTAL_SYNC_STORAGE_KEY = 'nfse-portal-data-sync-at';

const PORTAL_QUERY_KEYS = [
    ['notas'],
    ['notas-infinite'],
    ['notas-totals'],
    ['conferencia-notas'],
    ['conferencia-notas-infinite'],
    ['processos'],
    ['processo-summary'],
    ['processo-jobs'],
    ['processo-logs'],
    ['processo-arquivos'],
    ['processo-notas'],
    ['certificados'],
    ['empresas'],
    ['empresas-resumo-operacional'],
    ['live-status'],
];

async function invalidateLocalPortalData(queryClient: QueryClient) {
  await Promise.all(
    PORTAL_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

function notifyOtherTabs() {
  if (typeof window === 'undefined') return;

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(PORTAL_SYNC_CHANNEL);
    channel.postMessage({ type: 'portal-data-changed', at: Date.now() });
    channel.close();
  }

  // O evento `storage` cobre navegadores sem BroadcastChannel e tambem
  // mantem a sincronizacao quando uma aba ficou suspensa por algum tempo.
  window.localStorage.setItem(PORTAL_SYNC_STORAGE_KEY, String(Date.now()));
}

export async function invalidatePortalData(queryClient: QueryClient, notifyTabs = true) {
  await invalidateLocalPortalData(queryClient);
  if (notifyTabs) notifyOtherTabs();
}

export function setupPortalDataSync(queryClient: QueryClient) {
  if (typeof window === 'undefined') return () => undefined;

  const refresh = () => {
    void invalidateLocalPortalData(queryClient);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === PORTAL_SYNC_STORAGE_KEY) refresh();
  };

  const channel = 'BroadcastChannel' in window ? new BroadcastChannel(PORTAL_SYNC_CHANNEL) : null;
  channel?.addEventListener('message', refresh);
  window.addEventListener('storage', onStorage);

  return () => {
    channel?.removeEventListener('message', refresh);
    channel?.close();
    window.removeEventListener('storage', onStorage);
  };
}
