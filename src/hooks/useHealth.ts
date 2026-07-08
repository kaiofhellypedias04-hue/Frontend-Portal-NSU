import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useHealth() {
  const apiHealth = useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 30_000 });
  const dbHealth = useQuery({ queryKey: ['db-health'], queryFn: api.dbHealth, refetchInterval: 30_000 });
  const storageHealth = useQuery({ queryKey: ['storage-health'], queryFn: api.storageHealth, refetchInterval: 30_000 });

  return {
    apiHealth,
    dbHealth,
    storageHealth,
    online: apiHealth.isSuccess && dbHealth.isSuccess && storageHealth.isSuccess,
  };
}
