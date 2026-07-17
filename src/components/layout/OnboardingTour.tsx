import { Keyboard, LayoutDashboard, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

const steps = [
  { icon: LayoutDashboard, title: 'Navegue por tarefas', text: 'Use o menu lateral organizado por operação fiscal, automação e administração.' },
  { icon: Search, title: 'Encontre tudo rapidamente', text: 'Pressione Ctrl + K para buscar páginas, ações, notas, CNPJ ou empresas.' },
  { icon: Keyboard, title: 'Trabalhe com menos cliques', text: 'Use F para filtros, R para atualizar e Alt + M para abrir o menu.' },
];
export function OnboardingTour() {
  const [open, setOpen] = useState(() => localStorage.getItem('nfse-tour-complete') !== 'true'); const [step, setStep] = useState(0);
  if (!open) return null; const current = steps[step];
  function finish() { localStorage.setItem('nfse-tour-complete', 'true'); setOpen(false); }
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="w-full max-w-lg rounded-2xl border border-borderSoft bg-panel p-6 shadow-card"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent"><current.icon size={24} /></div><button className="grid h-10 w-10 place-items-center rounded-xl text-textSoft hover:bg-panel2" onClick={finish} aria-label="Pular apresentação"><X size={19} /></button></div><p className="mt-5 text-xs font-bold uppercase tracking-widest text-accent">Passo {step + 1} de {steps.length}</p><h2 id="tour-title" className="mt-1 text-2xl font-bold text-textStrong">{current.title}</h2><p className="mt-3 text-base leading-7 text-textSoft">{current.text}</p><div className="mt-6 flex items-center justify-between"><div className="flex gap-1.5">{steps.map((_, index) => <span key={index} className={`h-2 rounded-full transition-all ${index === step ? 'w-7 bg-accent' : 'w-2 bg-borderSoft'}`} />)}</div><div className="flex gap-2">{step > 0 ? <Button variant="ghost" onClick={() => setStep((value) => value - 1)}>Voltar</Button> : null}<Button variant="primary" onClick={() => step === steps.length - 1 ? finish() : setStep((value) => value + 1)}>{step === steps.length - 1 ? 'Começar' : 'Continuar'}</Button></div></div></div></div>;
}
