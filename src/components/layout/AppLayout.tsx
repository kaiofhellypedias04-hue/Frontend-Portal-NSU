import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OperatorGate } from '../operator/OperatorGate';
import { FocusModeProvider, useFocusMode } from '../../hooks/useFocusMode';
import { classNames } from '../../lib/format';

function AppLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { enabled: focusMode } = useFocusMode();

  useEffect(() => {
    if (focusMode) setSidebarOpen(false);
  }, [focusMode]);

  return (
    <OperatorGate>
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} hidden={focusMode} />
        <div className={classNames('min-w-0 overflow-x-hidden transition-[padding] duration-200', focusMode ? 'lg:pl-0' : 'lg:pl-72')}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} showMenuButton={!focusMode} />
          <main className="mx-auto w-full max-w-[1500px] min-w-0 overflow-x-hidden px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
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
