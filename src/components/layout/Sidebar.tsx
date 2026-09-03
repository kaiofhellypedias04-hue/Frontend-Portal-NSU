import { NavLink } from 'react-router-dom';
import { Activity, ClipboardCheck, Cpu, FileText, Gauge, ListChecks, Settings, ShieldCheck, UserCog, Workflow, X } from 'lucide-react';
import { classNames } from '../../lib/format';
import { useOperatorContext } from '../../hooks/useOperator';
import { useAuth } from '../../hooks/useAuth';
import { prefetchRoute } from '../../app/page-loaders';
import { ADMIN_ENABLED } from '../../lib/config';

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
  { label: 'Configuração', items: [
    { to: '/certificados', label: 'Certificados', icon: ShieldCheck },
    { to: '/configuracoes', label: 'Ajuda', icon: Settings },
  ] },
];

export function Sidebar({ open, onClose, hidden = false, collapsed = false }: { open: boolean; onClose: () => void; hidden?: boolean; collapsed?: boolean }) {
  const { operator, storageWarning } = useOperatorContext();
  const { usuario } = useAuth();
  const navigationGroups = ADMIN_ENABLED && usuario?.is_admin
    ? [...groups, { label: 'Administração', items: [{ to: '/admin', label: 'Painel administrativo', icon: UserCog }] }]
    : groups;
  const grupoNome = usuario?.grupo === 'planning_ma'
    ? 'Planning/MA'
    : usuario?.grupo === 'planning_hub'
      ? 'Planning/Hub'
      : usuario?.grupo
        ? usuario.grupo.replace(/_/g, ' ')
        : 'Grupo não informado';

  if (hidden) return null;

  return (
    <>
      {open ? <button className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] lg:hidden" onClick={onClose} aria-label="Fechar menu" /> : null}
      <aside
        className={classNames(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-y-auto border-r border-border bg-surface-elevated p-4 shadow-card transition-[width,transform] lg:translate-x-0',
          collapsed ? 'lg:w-20 lg:px-3' : 'lg:w-72',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-border bg-surface-muted p-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-primary/15 text-primary">
            <Activity size={22} />
          </div>
          <div className={collapsed ? 'lg:hidden' : ''}>
            <p className="text-sm font-bold text-text-primary">Portal NFS-e</p>
            <p className="text-xs text-text-secondary">Painel operacional</p>
          </div>
          <button className="ml-auto grid h-10 w-10 place-items-center rounded-[12px] text-text-secondary hover:bg-surface-muted lg:hidden" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
        </div>

        <div className={classNames('mb-4 rounded-[12px] border border-border bg-surface-muted p-3', collapsed ? 'lg:hidden' : '')}>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Operador</p>
          <p className="mt-2 min-w-0 truncate text-sm font-semibold text-text-primary">{operator?.operator_name || '-'}</p>
          <p className="mt-1 min-w-0 truncate text-xs font-medium text-primary">{grupoNome}</p>
          {storageWarning ? <p className="mt-2 text-xs text-warning">Armazenamento local indisponível.</p> : null}
        </div>

        <nav className="space-y-5" aria-label="Navegação principal">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className={classNames('mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted', collapsed ? 'lg:hidden' : '')}>{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
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
                        'flex min-h-12 items-center gap-3 rounded-[12px] px-3 py-3 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        collapsed ? 'lg:justify-center lg:px-0' : '',
                        isActive ? 'bg-primary/12 text-primary ring-1 ring-primary/20' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                      )
                    }
                  >
                    <item.icon className="shrink-0" size={20} />
                    <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={classNames('mt-auto rounded-[12px] border border-border bg-surface-muted p-4', collapsed ? 'lg:hidden' : '')}>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Operação</p>
          <p className="mt-2 text-sm text-text-secondary">Fila, ciclo e certificados são acompanhados no portal sem duplicar controles técnicos na interface.</p>
        </div>
      </aside>
    </>
  );
}
