import { NavLink } from 'react-router-dom';
import { Activity, ClipboardCheck, Cpu, FileText, Gauge, ListChecks, Settings, ShieldCheck, Workflow, X } from 'lucide-react';
import { classNames } from '../../lib/format';
import { useOperatorContext } from '../../hooks/useOperator';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { prefetchRoute } from '../../app/page-loaders';

const groups = [
  { label: 'Visão geral', items: [{ to: '/dashboard', label: 'Painel principal', icon: Gauge }] },
  { label: 'Operação fiscal', items: [
    { to: '/conferencia/tomados', label: 'Serviços tomados', icon: ClipboardCheck },
    { to: '/conferencia/prestados', label: 'Serviços prestados', icon: ClipboardCheck },
    { to: '/notas', label: 'Todas as notas', icon: FileText },
  ] },
  { label: 'Automação', items: [
    { to: '/motor-adn', label: 'Motor ADN', icon: Cpu },
    { to: '/fila', label: 'Fila de consultas', icon: Workflow },
    { to: '/processos', label: 'Histórico', icon: ListChecks },
  ] },
  { label: 'Administração', items: [
    { to: '/certificados', label: 'Certificados', icon: ShieldCheck },
    { to: '/configuracoes', label: 'Configurações', icon: Settings },
  ] },
];

export function Sidebar({ open, onClose, hidden = false, collapsed = false }: { open: boolean; onClose: () => void; hidden?: boolean; collapsed?: boolean }) {
  const { operator, clearOperator, storageWarning } = useOperatorContext();
  const [confirmChange, setConfirmChange] = useState(false);

  if (hidden) return null;

  return (
    <>
      {open ? <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-label="Fechar menu" /> : null}
      <aside
        className={classNames(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-y-auto border-r border-borderSoft bg-panel p-4 shadow-card transition-[width,transform] lg:translate-x-0',
          collapsed ? 'lg:w-20 lg:px-3' : 'lg:w-72',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-borderSoft bg-panel2 p-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <Activity size={22} />
          </div>
          <div className={collapsed ? 'lg:hidden' : ''}>
            <p className="text-sm font-bold text-textStrong">Portal NFS-e</p>
            <p className="text-xs text-textSoft">Painel operacional</p>
          </div>
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-xl text-textSoft hover:bg-panel lg:hidden" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
        </div>

        <div className={classNames('mb-4 rounded-2xl border border-borderSoft bg-panel2 p-3', collapsed ? 'lg:hidden' : '')}>
          <p className="text-xs uppercase tracking-[0.18em] text-textSoft">Operador</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold text-textStrong">{operator?.operator_name || '-'}</p>
            <button className="min-h-10 rounded-lg px-2 text-xs font-semibold text-accent hover:bg-accent/10" onClick={() => setConfirmChange(true)}>
              Trocar
            </button>
          </div>
          {storageWarning ? <p className="mt-2 text-xs text-amber-200">Armazenamento local indisponível.</p> : null}
        </div>

        <nav className="space-y-5" aria-label="Navegação principal">
          {groups.map((group) => (
            <div key={group.label}>
              <p className={classNames('mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-textSoft', collapsed ? 'lg:hidden' : '')}>{group.label}</p>
              <div className="space-y-1">{group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              onTouchStart={() => prefetchRoute(item.to)}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  collapsed ? 'lg:justify-center lg:px-0' : '',
                  isActive ? 'bg-accent/15 text-accent ring-1 ring-accent/20' : 'text-textBody hover:bg-panel2 hover:text-textStrong',
                )
              }
            >
              <item.icon className="shrink-0" size={20} />
              <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
            </NavLink>
              ))}</div>
            </div>
          ))}
        </nav>

        <div className={classNames('mt-auto rounded-2xl border border-borderSoft bg-panel2 p-4', collapsed ? 'lg:hidden' : '')}>
          <p className="text-xs uppercase tracking-[0.18em] text-textSoft">Motor separado</p>
          <p className="mt-2 text-sm text-slate-200">O front só enxerga o painel. Fila, ciclo e certificados ficam no backend.</p>
        </div>
      </aside>
      <ConfirmDialog open={confirmChange} title="Trocar operador?" description="O nome do operador atual será removido deste navegador e você precisará se identificar novamente." confirmLabel="Trocar operador" onClose={() => setConfirmChange(false)} onConfirm={() => { setConfirmChange(false); clearOperator(); }} />
    </>
  );
}
