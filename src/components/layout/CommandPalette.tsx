import { ClipboardCheck, Cpu, FileSearch, Gauge, History, Search, Settings, ShieldCheck, Workflow, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prefetchRoute } from '../../app/page-loaders';

const destinations = [
  { label: 'Painel principal', description: 'Visão geral da operação', path: '/dashboard', icon: Gauge },
  { label: 'Serviços tomados', description: 'Conferir notas recebidas', path: '/conferencia/tomados', icon: ClipboardCheck },
  { label: 'Serviços prestados', description: 'Conferir notas emitidas', path: '/conferencia/prestados', icon: ClipboardCheck },
  { label: 'Todas as notas', description: 'Pesquisar número, chave, CNPJ ou empresa', path: '/notas', icon: FileSearch },
  { label: 'Iniciar Motor ADN', description: 'Configurar uma nova consulta', path: '/motor-adn', icon: Cpu },
  { label: 'Fila de consultas', description: 'Acompanhar o processamento atual', path: '/fila', icon: Workflow },
  { label: 'Processos com erro', description: 'Abrir o histórico operacional', path: '/processos', icon: History },
  { label: 'Cadastrar certificado', description: 'Gerenciar certificados digitais', path: '/certificados', icon: ShieldCheck },
  { label: 'Configurações', description: 'Verificar API e armazenamento', path: '/configuracoes', icon: Settings },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState(''); const inputRef = useRef<HTMLInputElement>(null); const navigate = useNavigate();
  const results = useMemo(() => { const q = query.trim().toLocaleLowerCase('pt-BR'); return q ? destinations.filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase('pt-BR').includes(q)) : destinations; }, [query]);
  useEffect(() => { if (open) { setQuery(''); requestAnimationFrame(() => inputRef.current?.focus()); } }, [open]);
  useEffect(() => { if (!open) return; const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, [open, onClose]);
  if (!open) return null;
  function go(path: string) { prefetchRoute(path); navigate(path); onClose(); }
  function searchNotes() { const value = query.trim(); if (value) go(`/notas?busca=${encodeURIComponent(value)}`); }
  return <div className="fixed inset-0 z-[80] flex justify-center bg-black/55 p-3 pt-[8vh] backdrop-blur-sm sm:p-6 sm:pt-[12vh]" onMouseDown={onClose}><div role="dialog" aria-modal="true" aria-label="Busca e ações rápidas" className="h-fit max-h-[78vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-borderSoft bg-panel shadow-card" onMouseDown={(e) => e.stopPropagation()}><div className="flex items-center gap-3 border-b border-borderSoft px-4"><Search className="shrink-0 text-accent" size={21} /><input ref={inputRef} className="h-14 min-w-0 flex-1 bg-transparent text-base text-textStrong outline-none placeholder:text-textSoft" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') results[0] ? go(results[0].path) : searchNotes(); }} placeholder="Buscar página, nota, CNPJ ou ação..." /><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-textSoft hover:bg-panel2" aria-label="Fechar"><X size={19} /></button></div><div className="max-h-[60vh] overflow-y-auto p-2">{results.map((item) => <button key={item.path + item.label} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-panel2 focus:bg-panel2 focus:outline-none" onClick={() => go(item.path)} onMouseEnter={() => prefetchRoute(item.path)}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><item.icon size={19} /></span><span className="min-w-0"><span className="block font-semibold text-textStrong">{item.label}</span><span className="block truncate text-sm text-textSoft">{item.description}</span></span></button>)}{query.trim() ? <button className="mt-1 flex min-h-14 w-full items-center gap-3 rounded-xl border border-dashed border-borderSoft px-3 text-left hover:bg-panel2" onClick={searchNotes}><Search size={19} className="text-accent" /><span><span className="block font-semibold text-textStrong">Pesquisar “{query.trim()}” nas notas</span><span className="text-sm text-textSoft">Busca por número, chave, CNPJ ou empresa</span></span></button> : null}</div><div className="flex items-center justify-between border-t border-borderSoft bg-panelInset px-4 py-2 text-xs text-textSoft"><span>Enter para abrir · Esc para fechar</span><kbd className="rounded-md border border-borderSoft bg-panel px-2 py-1">Ctrl K</kbd></div></div></div>;
}
