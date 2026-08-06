import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, BarChart3, CheckCircle2, FileArchive, FileText, FolderKanban, KeyRound, LayoutDashboard, LogOut, Menu, Pencil, Plus, RefreshCcw, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/Toaster';
import { formatDateTime } from '../lib/format';
import './Admin.css';

type Tab = 'dashboard' | 'usuarios' | 'grupos' | 'erros';
type AdminUser = Awaited<ReturnType<typeof api.adminUsuarios>>[number];
const nav = [{ id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard }, { id: 'usuarios' as const, label: 'Usuários', icon: Users }, { id: 'grupos' as const, label: 'Grupos', icon: FolderKanban }, { id: 'erros' as const, label: 'Erros do sistema', icon: AlertTriangle }];

export function Admin() {
  const { usuario, logout } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [menu, setMenu] = useState(false);
  const [days, setDays] = useState(14);
  const [search, setSearch] = useState('');
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [password, setPassword] = useState('');
  const [groupEditor, setGroupEditor] = useState<{ id?: number; nome: string } | null>(null);
  const overview = useQuery({ queryKey: ['admin-overview'], queryFn: api.adminOverview, enabled: Boolean(usuario?.is_admin), refetchInterval: 30000 });
  const accesses = useQuery({ queryKey: ['admin-accesses', days], queryFn: () => api.adminAcessos(days), enabled: Boolean(usuario?.is_admin) });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: api.adminUsuarios, enabled: Boolean(usuario?.is_admin) });
  const groups = useQuery({ queryKey: ['admin-groups'], queryFn: api.adminGrupos, enabled: Boolean(usuario?.is_admin) });
  const errors = useQuery({ queryKey: ['admin-errors'], queryFn: () => api.adminErros(100), enabled: Boolean(usuario?.is_admin), refetchInterval: 30000 });
  const update = useMutation({ mutationFn: ({ id, data }: { id: number; data: Parameters<typeof api.adminAtualizarUsuario>[1] }) => api.adminAtualizarUsuario(id, data), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-users'] }); void qc.invalidateQueries({ queryKey: ['admin-overview'] }); toast.success('Usuário atualizado'); } });
  const reset = useMutation({ mutationFn: ({ id, senha }: { id: number; senha: string }) => api.adminRedefinirSenha(id, senha), onSuccess: () => { setPasswordUser(null); setPassword(''); toast.success('Senha redefinida'); } });
  const removeUser = useMutation({ mutationFn: api.adminExcluirUsuario, onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-users'] }); void qc.invalidateQueries({ queryKey: ['admin-overview'] }); toast.success('Usuário excluído'); } });
  const saveGroup = useMutation({ mutationFn: ({ id, nome }: { id?: number; nome: string }) => id ? api.adminEditarGrupo(id, { nome }) : api.adminCriarGrupo(nome), onSuccess: () => { setGroupEditor(null); void qc.invalidateQueries({ queryKey: ['admin-groups'] }); toast.success('Grupo salvo'); } });
  const removeGroup = useMutation({ mutationFn: api.adminExcluirGrupo, onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-groups'] }); toast.success('Grupo excluído'); } });
  const filteredUsers = useMemo(() => (users.data || []).filter(u => `${u.nome || ''} ${u.email} ${u.grupo}`.toLowerCase().includes(search.toLowerCase())), [users.data, search]);
  const filteredErrors = useMemo(() => (errors.data || []).filter(e => `${e.mensagem} ${e.processo_id || ''} ${e.empresa_id || ''}`.toLowerCase().includes(search.toLowerCase())), [errors.data, search]);
  if (!usuario?.is_admin) return <Navigate to="/dashboard" replace />;
  const m = overview.data || {};
  const max = Math.max(1, ...(accesses.data || []).map(x => x.acessos));
  const complete = m.processos ? Math.round((m.processos_finalizados || 0) / m.processos * 100) : 0;
  const changeTab = (next: Tab) => { setTab(next); setSearch(''); setMenu(false); };
  const refresh = () => void Promise.all([overview.refetch(), accesses.refetch(), users.refetch(), groups.refetch(), errors.refetch()]);

  const sidebar = <>
    <div className="adm-brand"><ShieldCheck /><strong>NFS-e Admin</strong></div>
    <div className="adm-profile"><span>{(usuario.nome || usuario.email)[0].toUpperCase()}</span><div><strong>{usuario.nome || 'Administrador'}</strong><small><i /> Online</small></div></div>
    <div className="adm-nav-title">MENU PRINCIPAL</div>
    <nav className="adm-nav">{nav.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => changeTab(item.id)}><item.icon /> <span>{item.label}</span>{item.id === 'erros' && m.erros ? <b>{m.erros}</b> : null}</button>)}</nav>
    <div className="adm-sidebar-bottom"><Link to="/dashboard"><ArrowLeft /> Portal operacional</Link><button onClick={logout}><LogOut /> Sair</button></div>
  </>;

  return <div className="nfse-admin">
    <aside className={`adm-sidebar ${menu ? 'open' : ''}`}>{sidebar}</aside>{menu ? <button className="adm-overlay" onClick={() => setMenu(false)} aria-label="Fechar menu" /> : null}
    <div className="adm-page">
      <header className="adm-header"><button className="adm-menu" onClick={() => setMenu(true)}><Menu /></button><div className="adm-header-links"><span>Início</span><span>Contato</span></div><div className="adm-header-right"><span className="adm-online"><i /> API conectada</span><button onClick={refresh} title="Atualizar"><RefreshCcw className={overview.isFetching ? 'spin' : ''} /></button></div></header>
      <main className="adm-content"><div className="adm-title"><div><h1>{tab === 'dashboard' ? 'Dashboard' : tab === 'usuarios' ? 'Usuários' : tab === 'grupos' ? 'Grupos' : 'Erros do sistema'}</h1><p>{tab === 'dashboard' ? 'Visão geral da operação NFS-e' : tab === 'usuarios' ? 'Gerencie contas, grupos e permissões' : tab === 'grupos' ? 'Crie e organize os grupos do portal' : 'Acompanhe falhas dos processamentos'}</p></div><span>Home / {tab === 'dashboard' ? 'Dashboard' : tab === 'usuarios' ? 'Usuários' : tab === 'grupos' ? 'Grupos' : 'Erros'}</span></div>

        {tab === 'dashboard' ? <>
          <div className="adm-metrics"><Metric color="info" icon={<Users />} value={m.usuarios_ativos || 0} label="Usuários ativos" hint={`${m.usuarios_ativos_hoje || 0} acessaram hoje`} /><Metric color="success" icon={<FileText />} value={(m.notas || 0).toLocaleString('pt-BR')} label="Notas processadas" hint="Todos os grupos" /><Metric color="warning" icon={<FileArchive />} value={(m.arquivos || 0).toLocaleString('pt-BR')} label="Arquivos armazenados" hint="XML, PDF e documentos" /><Metric color="danger" icon={<AlertTriangle />} value={m.erros || 0} label="Erros registrados" hint="Precisam de atenção" /></div>
          <div className="adm-dashboard-grid"><section className="adm-card"><CardHeader title="Acessos ao portal" icon={<BarChart3 />} action={<select value={days} onChange={e => setDays(Number(e.target.value))}><option value={14}>14 dias</option><option value={30}>30 dias</option><option value={90}>90 dias</option></select>} /><div className="adm-chart"><div className="adm-chart-lines"><i /><i /><i /><i /></div>{(accesses.data || []).map(x => <div className="adm-bar-wrap" key={x.data} title={`${x.acessos} acessos; ${x.usuarios} usuários`}><span>{x.acessos}</span><div className="adm-bar" style={{ height: `${Math.max(3, x.acessos / max * 190)}px` }} /><small>{x.data.slice(5).split('-').reverse().join('/')}</small></div>)}</div></section>
            <section className="adm-card"><CardHeader title="Processamentos" icon={<CheckCircle2 />} /><div className="adm-progress-panel"><div className="adm-donut" style={{ background: `conic-gradient(#00a65a ${complete}%, #e5e7eb 0)` }}><span>{complete}%<small>concluídos</small></span></div><dl><div><dt>Total</dt><dd>{m.processos || 0}</dd></div><div><dt>Finalizados</dt><dd className="green">{m.processos_finalizados || 0}</dd></div><div><dt>Com erro</dt><dd className="red">{m.erros || 0}</dd></div></dl></div></section></div>
          <section className="adm-card adm-recent"><CardHeader title="Erros recentes" icon={<AlertTriangle />} action={<button onClick={() => changeTab('erros')}>Ver todos</button>} /><div>{(errors.data || []).slice(0, 5).map(e => <article key={e.id}><AlertTriangle /><p><strong>{e.mensagem}</strong><small>Processo #{e.processo_id || '-'} · {formatDateTime(e.created_at)}</small></p></article>)}{!errors.data?.length ? <div className="adm-empty">Nenhum erro registrado.</div> : null}</div></section>
        </> : null}

        {tab === 'usuarios' ? <section className="adm-card"><CardHeader title="Usuários cadastrados" icon={<Users />} action={<SearchBox value={search} onChange={setSearch} placeholder="Buscar usuário" />} /><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Usuário</th><th>Grupo</th><th>Status</th><th>Permissão</th><th>Ações</th></tr></thead><tbody>{filteredUsers.map(u => <tr key={u.id}><td><div className="adm-user"><span>{(u.nome || u.email)[0].toUpperCase()}</span><p><strong>{u.nome || 'Sem nome'}</strong><small>{u.email}</small></p></div></td><td><select value={u.grupo} onChange={e => update.mutate({ id: u.id, data: { grupo: e.target.value } })}>{(groups.data || []).filter(g => g.ativo || g.codigo === u.grupo).map(g => <option key={g.codigo} value={g.codigo}>{g.nome}</option>)}</select></td><td><button disabled={u.id === usuario.id} className={`adm-badge ${u.ativo ? 'ok' : 'off'}`} onClick={() => update.mutate({ id: u.id, data: { ativo: !u.ativo } })}>{u.ativo ? 'Ativo' : 'Inativo'}</button></td><td><button disabled={u.id === usuario.id} className={`adm-badge ${u.is_admin ? 'admin' : ''}`} onClick={() => update.mutate({ id: u.id, data: { is_admin: !u.is_admin } })}>{u.is_admin ? 'Administrador' : 'Usuário'}</button></td><td><div className="adm-actions"><button className="adm-key" onClick={() => { setPasswordUser(u); setPassword(''); }}><KeyRound /> Senha</button><button disabled={u.id === usuario.id} className="adm-delete" onClick={() => { if (confirm(`Excluir definitivamente o usuário ${u.email}?`)) removeUser.mutate(u.id); }}><Trash2 /> Excluir</button></div></td></tr>)}</tbody></table></div></section> : null}

        {tab === 'grupos' ? <section className="adm-card"><CardHeader title="Grupos cadastrados" icon={<FolderKanban />} action={<button className="adm-add" onClick={() => setGroupEditor({ nome: '' })}><Plus /> Novo grupo</button>} /><div className="adm-groups">{(groups.data || []).map(g => <article key={g.id}><div className="adm-group-icon"><FolderKanban /></div><div className="adm-group-info"><h3>{g.nome}</h3><code>{g.codigo}</code><p>{g.usuarios} usuário(s) · {g.empresas} empresa(s)</p></div><span className={`adm-badge ${g.ativo ? 'ok' : 'off'}`}>{g.ativo ? 'Ativo' : 'Inativo'}</span><div className="adm-group-actions"><button title="Editar nome" onClick={() => setGroupEditor({ id: g.id, nome: g.nome })}><Pencil /></button><button title={g.ativo ? 'Desativar' : 'Ativar'} onClick={() => api.adminEditarGrupo(g.id, { ativo: !g.ativo }).then(() => groups.refetch())}><CheckCircle2 /></button><button title="Excluir" className="danger" onClick={() => { if (confirm(`Excluir o grupo ${g.nome}?`)) removeGroup.mutate(g.id); }}><Trash2 /></button></div></article>)}</div></section> : null}

        {tab === 'erros' ? <section className="adm-card"><CardHeader title="Central de erros" icon={<AlertTriangle />} action={<SearchBox value={search} onChange={setSearch} placeholder="Buscar erro" />} /><div className="adm-errors">{filteredErrors.map(e => <article key={e.id}><span><AlertTriangle /></span><div><h3>{e.origem} {e.processo_id ? `#${e.processo_id}` : ''}</h3><p>{e.mensagem}</p><small>Empresa #{e.empresa_id || '-'} · {formatDateTime(e.created_at)}</small></div></article>)}{!filteredErrors.length ? <div className="adm-empty">Nenhum erro encontrado.</div> : null}</div></section> : null}
      </main><footer className="adm-footer"><strong>Portal NFS-e</strong><span>Painel administrativo</span></footer>
    </div>
    {passwordUser ? <div className="adm-modal"><form onSubmit={e => { e.preventDefault(); reset.mutate({ id: passwordUser.id, senha: password }); }}><button type="button" className="adm-modal-close" onClick={() => setPasswordUser(null)}><X /></button><KeyRound className="adm-modal-icon" /><h2>Redefinir senha</h2><p>Nova senha para <strong>{passwordUser.nome || passwordUser.email}</strong>.</p><label>Nova senha<input autoFocus type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" /></label><div><button type="button" onClick={() => setPasswordUser(null)}>Cancelar</button><button className="primary" disabled={password.length < 8 || reset.isPending}>Salvar senha</button></div></form></div> : null}
    {groupEditor ? <div className="adm-modal"><form onSubmit={e => { e.preventDefault(); saveGroup.mutate(groupEditor); }}><button type="button" className="adm-modal-close" onClick={() => setGroupEditor(null)}><X /></button><FolderKanban className="adm-modal-icon" /><h2>{groupEditor.id ? 'Editar grupo' : 'Criar grupo'}</h2><p>{groupEditor.id ? 'Altere o nome exibido para os usuários.' : 'O código interno será criado automaticamente a partir do nome.'}</p><label>Nome do grupo<input autoFocus value={groupEditor.nome} onChange={e => setGroupEditor({ ...groupEditor, nome: e.target.value })} placeholder="Ex.: Planning/Sul" minLength={2} maxLength={120} /></label><div><button type="button" onClick={() => setGroupEditor(null)}>Cancelar</button><button className="primary" disabled={groupEditor.nome.trim().length < 2 || saveGroup.isPending}>Salvar grupo</button></div></form></div> : null}
  </div>;
}

function Metric({ color, icon, value, label, hint }: { color: string; icon: React.ReactNode; value: number | string; label: string; hint: string }) { return <article className={`adm-metric ${color}`}><div><h2>{value}</h2><p>{label}</p>{icon}</div><footer>{hint}</footer></article>; }
function CardHeader({ title, icon, action }: { title: string; icon: React.ReactNode; action?: React.ReactNode }) { return <header className="adm-card-header"><h2>{icon}{title}</h2>{action}</header>; }
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) { return <label className="adm-search"><Search /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>; }
