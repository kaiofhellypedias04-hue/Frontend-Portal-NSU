import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

type View<T> = { id: number; name: string; value: T };
export function SavedViews<T>({ storageKey, value, onApply }: { storageKey: string; value: T; onApply: (value: T) => void }) {
  const [views, setViews] = useState<View<T>[]>(() => { try { return JSON.parse(localStorage.getItem(storageKey) || '[]') as View<T>[]; } catch { return []; } });
  const [adding, setAdding] = useState(false); const [name, setName] = useState('');
  function persist(next: View<T>[]) { setViews(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* indisponível */ } }
  function save() { const clean = name.trim(); if (!clean) return; persist([...views, { id: Date.now(), name: clean, value }]); setName(''); setAdding(false); }
  return <div className="flex flex-wrap items-center gap-2">{views.map((view) => <span key={view.id} className="inline-flex min-h-10 items-center rounded-xl border border-borderSoft bg-panelInset"><button className="flex min-h-10 items-center gap-1.5 px-3 text-sm font-semibold text-textBody hover:text-accent" onClick={() => onApply(view.value)}><Bookmark size={14} />{view.name}</button><button className="grid h-9 w-9 place-items-center border-l border-borderSoft text-textSoft hover:text-danger" onClick={() => persist(views.filter((item) => item.id !== view.id))} aria-label={`Excluir vista ${view.name}`}><Trash2 size={14} /></button></span>)}{adding ? <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); save(); }}><input autoFocus className="field !min-h-10 !w-40 !py-1.5 !text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da vista" /><Button className="min-h-10 py-1.5" variant="primary" type="submit">Salvar</Button></form> : <Button className="min-h-10 py-1.5" variant="ghost" onClick={() => setAdding(true)}><Plus size={15} /> Salvar vista</Button>}</div>;
}
