import { ClipboardCheck, Cpu, FileSearch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const tasks = [
  { title: 'Conferir pendências', description: 'Revise notas de serviços tomados.', to: '/conferencia/tomados', icon: ClipboardCheck },
  { title: 'Pesquisar uma nota', description: 'Encontre por número, chave ou CNPJ.', to: '/notas', icon: FileSearch },
  { title: 'Iniciar consultas', description: 'Configure e execute o Motor ADN.', to: '/motor-adn', icon: Cpu },
  { title: 'Cadastrar certificado', description: 'Adicione um certificado digital.', to: '/certificados', icon: ShieldCheck },
];

export function QuickTasks() {
  return <section className="mb-6" aria-labelledby="quick-tasks-title"><div className="mb-3"><h2 id="quick-tasks-title" className="text-lg font-bold text-textStrong">O que você quer fazer?</h2><p className="text-sm text-textSoft">Acesse as tarefas mais usadas com um clique.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{tasks.map((task) => <Link key={task.to} to={task.to} className="group flex min-h-28 items-start gap-3 rounded-2xl border border-borderSoft bg-panel p-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-panel2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><task.icon size={21} /></span><span><span className="block font-bold text-textStrong group-hover:text-accent">{task.title}</span><span className="mt-1 block text-sm leading-5 text-textSoft">{task.description}</span></span></Link>)}</div></section>;
}
