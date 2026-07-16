import { QueryClient } from '@tanstack/react-query';
import { setupPortalDataSync } from '../hooks/queryInvalidation';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10_000,
    },
  },
});

setupPortalDataSync(queryClient);
