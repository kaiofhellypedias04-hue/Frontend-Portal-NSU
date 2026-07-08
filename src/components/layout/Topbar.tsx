import { Menu, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useHealth } from '../../hooks/useHealth';
import { FocusModeButton } from './FocusModeButton';

export function Topbar({ onMenuClick, showMenuButton = true }: { onMenuClick: () => void; showMenuButton?: boolean }) {
  const queryClient = useQueryClient();
  const { online, apiHealth } = useHealth();

  async function refreshOperationalData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notas'] }),
      queryClient.invalidateQueries({ queryKey: ['processos'] }),
      queryClient.invalidateQueries({ queryKey: ['live-status'] }),
      queryClient.invalidateQueries({ queryKey: ['certificados'] }),
    ]);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['notas'], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['processos'], type: 'active' }),
      queryClient.refetchQueries({ queryKey: ['live-status'], type: 'active' }),
    ]);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-borderSoft bg-surface/80 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton ? (
            <Button variant="ghost" className="px-3 lg:hidden" onClick={onMenuClick}>
              <Menu size={20} />
            </Button>
          ) : null}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-textSoft">NFS-e ADN</p>
            <h1 className="truncate text-lg font-bold text-white sm:text-xl">Notas consultadas ao vivo</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <FocusModeButton className="hidden md:inline-flex" />
          <Badge value={online ? 'API conectada' : 'API offline'} tone={online ? 'success' : 'danger'} />
          <Button
            variant="secondary"
            onClick={refreshOperationalData}
            disabled={apiHealth.isFetching}
            className="hidden sm:inline-flex"
          >
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            <RefreshCcw size={15} className={apiHealth.isFetching ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        </div>
      </div>
    </header>
  );
}
