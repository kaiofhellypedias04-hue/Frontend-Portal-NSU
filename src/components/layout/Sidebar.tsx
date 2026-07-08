import { NavLink } from 'react-router-dom';
import { Activity, ClipboardCheck, Cpu, FileText, Gauge, ListChecks, Settings, ShieldCheck, Workflow } from 'lucide-react';
import { classNames } from '../../lib/format';
import { useOperatorContext } from '../../hooks/useOperator';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/conferencia/tomados', label: 'Conferência S/Tomados', icon: ClipboardCheck },
  { to: '/conferencia/prestados', label: 'Conferência S/Prestados', icon: ClipboardCheck },
  { to: '/motor-adn', label: 'Motor ADN', icon: Cpu },
  { to: '/certificados', label: 'Certificados', icon: ShieldCheck },
  { to: '/notas', label: 'Notas', icon: FileText },
  { to: '/fila', label: 'Fila', icon: Workflow },
  { to: '/processos', label: 'Processos', icon: ListChecks },
  { to: '/configuracoes', label: 'Configuracoes', icon: Settings },
];

export function Sidebar({ open, onClose, hidden = false }: { open: boolean; onClose: () => void; hidden?: boolean }) {
  const { operator, clearOperator, storageWarning } = useOperatorContext();

  if (hidden) return null;

  function changeOperator() {
    if (window.confirm('Trocar operador deste navegador?')) {
      clearOperator();
    }
  }

  return (
    <>
      {open ? <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-label="Fechar menu" /> : null}
      <aside
        className={classNames(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-y-auto border-r border-borderSoft bg-surface/95 p-4 backdrop-blur transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-borderSoft bg-panel p-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Portal NFS-e</p>
            <p className="text-xs text-textSoft">Painel operacional</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-borderSoft bg-panel p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-textSoft">Operador</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold text-white">{operator?.operator_name || '-'}</p>
            <button className="text-xs font-semibold text-sky-300 hover:text-sky-200" onClick={changeOperator}>
              Trocar
            </button>
          </div>
          {storageWarning ? <p className="mt-2 text-xs text-amber-200">Armazenamento local indisponivel.</p> : null}
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition',
                  isActive ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/20' : 'text-textSoft hover:bg-panel2 hover:text-white',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-borderSoft bg-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-textSoft">Motor separado</p>
          <p className="mt-2 text-sm text-slate-200">O front so enxerga o painel. Fila, ciclo e certificados ficam no backend.</p>
        </div>
      </aside>
    </>
  );
}
