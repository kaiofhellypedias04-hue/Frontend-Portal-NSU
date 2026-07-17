import { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OperatorGate } from '../operator/OperatorGate';
import { FocusModeProvider, useFocusMode } from '../../hooks/useFocusMode';
import { Toaster } from '../ui/Toaster';
import { classNames } from '../../lib/format';
import { CommandPalette } from './CommandPalette';
import { useQueryClient } from '@tanstack/react-query';
import { OnboardingTour } from './OnboardingTour';

function AppLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('nfse-sidebar-collapsed') === 'true');
  const { enabled: focusMode } = useFocusMode();
  const [commandOpen, setCommandOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  useEffect(() => {
    if (focusMode) setSidebarOpen(false);
  }, [focusMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches('input, textarea, select, [contenteditable="true"]');
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); }
      else if (!typing && event.key === '/') { event.preventDefault(); setCommandOpen(true); }
      else if (!typing && event.key.toLowerCase() === 'f') window.dispatchEvent(new CustomEvent('portal:toggle-filters'));
      else if (!typing && event.key.toLowerCase() === 'r') { event.preventDefault(); void queryClient.invalidateQueries(); }
      else if (event.altKey && event.key.toLowerCase() === 'm') { event.preventDefault(); setSidebarOpen(true); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [queryClient]);

  function toggleSidebar() {
    setSidebarCollapsed((value) => {
      localStorage.setItem('nfse-sidebar-collapsed', String(!value));
      return !value;
    });
  }

  return (
    <OperatorGate>
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden">
        <div aria-hidden="true" className={classNames('fixed left-0 top-0 z-[100] h-0.5 bg-accent shadow-[0_0_10px_rgb(var(--accent))] transition-all duration-300', navigation.state === 'idle' ? 'w-0 opacity-0' : 'w-2/3 opacity-100')} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} hidden={focusMode} collapsed={sidebarCollapsed} />
        <div className={classNames('min-w-0 overflow-x-hidden transition-[padding] duration-200', focusMode ? 'lg:pl-0' : sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72')}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} showMenuButton={!focusMode} sidebarCollapsed={sidebarCollapsed} onSidebarToggle={toggleSidebar} onCommandClick={() => setCommandOpen(true)} />
          <main className="w-full min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Suspense
              fallback={
                <div className="flex items-center justify-center gap-2 py-24 text-textSoft" role="status">
                  <Loader2 className="animate-spin" size={20} /> Carregando página...
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
        <Toaster />
        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
        <OnboardingTour />
      </div>
    </OperatorGate>
  );
}

export function AppLayout() {
  return (
    <FocusModeProvider>
      <AppLayoutContent />
    </FocusModeProvider>
  );
}
