import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

type State = { error: Error | null };
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    const record = { timestamp: new Date().toISOString(), message: error.message, stack: error.stack, componentStack: info.componentStack, path: location.pathname };
    try { const history = JSON.parse(localStorage.getItem('nfse-frontend-errors') || '[]') as unknown[]; localStorage.setItem('nfse-frontend-errors', JSON.stringify([...history.slice(-9), record])); } catch { /* armazenamento indisponível */ }
    console.error('Erro não tratado no portal', record);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-surface p-4"><section className="w-full max-w-lg rounded-2xl border border-danger/30 bg-panel p-6 text-center shadow-card"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-danger"><AlertTriangle size={28} /></div><h1 className="mt-5 text-2xl font-bold text-textStrong">Não foi possível exibir esta tela</h1><p className="mt-2 text-sm leading-6 text-textSoft">O problema foi registrado neste navegador. Atualize a página para continuar; seus filtros salvos serão preservados.</p><Button className="mt-6" variant="primary" onClick={() => location.reload()}><RefreshCcw size={17} /> Atualizar página</Button><details className="mt-5 text-left"><summary className="cursor-pointer text-xs font-semibold text-textSoft">Detalhes técnicos</summary><pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-panelInset p-3 text-xs text-danger">{this.state.error.message}</pre></details></section></main>;
  }
}
