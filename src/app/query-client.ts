import { MutationCache, QueryClient } from '@tanstack/react-query';
import { setupPortalDataSync } from '../hooks/queryInvalidation';
import { toast } from '../components/ui/Toaster';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Não foi possível concluir a ação', message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 15 * 60_000,
      refetchOnReconnect: true,
      placeholderData: (previousData: unknown) => previousData,
    },
  },
});

setupPortalDataSync(queryClient);
