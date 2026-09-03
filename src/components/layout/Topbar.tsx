import { ALargeSmall, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, RefreshCcw, Rows3, Search, Sun, Wifi, WifiOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useHealth } from '../../hooks/useHealth';
import { FocusModeButton } from './FocusModeButton';
import { useTheme } from '../../hooks/useTheme';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const routeTitles: Array<[string, string]> = [
  ['/conferencia/tomados', 'Serviços tomados'],
  ['/conferencia/prestados', 'Serviços prestados'],
  ['/motor-adn', 'Motor ADN'],
  ['/certificados', 'Certificados digitais'],
  ['/notas', 'Notas consultadas'],
  ['/fila', 'Fila de consultas'],
  ['/processos', 'Histórico de processos'],
  ['/configuracoes', 'Ajuda'],
  ['/dashboard', 'Visão geral'],
  ['/admin', 'Área administrativa'],
];

export function Topbar({ onMenuClick, showMenuButton = true, sidebarCollapsed = false, onSidebarToggle, onCommandClick }: { onMenuClick: () => void; showMenuButton?: boolean; sidebarCollapsed?: boolean; onSidebarToggle?: () => void; onCommandClick?: () => void }) {
  const queryClient = useQueryClient();
  const { online, apiHealth } = useHealth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const pageTitle = routeTitles.find(([path]) => pathname.startsWith(path))?.[1] || 'Portal NFS-e';
  const [largeText, setLargeText] = useState(() => document.documentElement.dataset.fontSize === 'large');
  const [compactTables, setCompactTables] = useState(() => document.documentElement.dataset.tableDensity === 'compact');
  const { usuario, logout } = useAuth();

  function toggleTextSize() {
    const next = !largeText;
    document.documentElement.dataset.fontSize = next ? 'large' : 'normal';
    localStorage.setItem('nfse-font-size', next ? 'large' : 'normal');
    setLargeText(next);
  }

  function toggleTableDensity() {
    const next = !compactTables;
    document.documentElement.dataset.tableDensity = next ? 'compact' : 'comfortable';
    localStorage.setItem('nfse-table-density', next ? 'compact' : 'comfortable');
    setCompactTables(next);
  }

  async function refreshOperationalData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notas'] }),
      queryClient.invalidateQueries({ queryKey: ['notas-infinite'] }),
      queryClient.invalidateQueries({ queryKey: ['notas-totals'] }),
      queryClient.invalidateQueries({ queryKey: ['conferencia-notas'] }),
      queryClient.invalidateQueries({ queryKey: ['conferencia-notas-infinite'] }),
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
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-12 min-w-0 items-center gap-2">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton ? <Button variant="ghost" className="px-3 lg:hidden" onClick={onMenuClick} aria-label="Abrir menu"><Menu size={20} /></Button> : null}
          {showMenuButton ? (
            <Button variant="ghost" className="hidden w-11 px-0 lg:inline-flex" onClick={onSidebarToggle} aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}>
              {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </Button>
          ) : null}
          <div className="min-w-0">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted sm:block">Portal NFS-e</p>
            <p className="truncate text-base font-bold text-text-primary sm:text-lg">{pageTitle}</p>
          </div>
        </div>
        <div className="ml-auto flex min-w-0 shrink items-center gap-2">
          <Button variant="secondary" className="hidden min-w-0 gap-2 px-3 lg:inline-flex" onClick={onCommandClick} aria-label="Abrir busca global"><Search size={18} /><span className="truncate">Busca global</span><kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted">Ctrl K</kbd></Button>
          <Button variant="ghost" className="hidden w-11 px-0 sm:inline-flex" onClick={toggleTextSize} aria-pressed={largeText} aria-label={largeText ? 'Usar texto normal' : 'Aumentar texto'} title={largeText ? 'Texto normal' : 'Aumentar texto'}><ALargeSmall size={20} /></Button>
          <Button variant="ghost" className="hidden w-11 px-0 xl:inline-flex" onClick={toggleTableDensity} aria-pressed={compactTables} aria-label={compactTables ? 'Usar tabelas confortáveis' : 'Usar tabelas compactas'} title={compactTables ? 'Tabelas confortáveis' : 'Tabelas compactas'}><Rows3 size={19} /></Button>
          <Button variant="ghost" className="w-11 px-0" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</Button>
          <FocusModeButton className="hidden md:inline-flex" />
          <Badge className="hidden sm:inline-flex" value={online ? 'API conectada' : 'API offline'} tone={online ? 'success' : 'danger'} />
          <Button variant="secondary" onClick={refreshOperationalData} disabled={apiHealth.isFetching} aria-label="Atualizar dados" className="px-3 sm:px-4">
            {online ? <Wifi size={16} className="hidden sm:inline" /> : <WifiOff size={16} className="hidden sm:inline" />}
            <RefreshCcw size={15} className={apiHealth.isFetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button variant="secondary" className="hidden md:inline-flex" onClick={logout} aria-label={`Sair da conta${usuario?.email ? ` de ${usuario.email}` : ''}`} title="Sair"><LogOut size={18} /><span className="hidden xl:inline">Sair</span></Button>
        </div>
      </div>
    </header>
  );
}
