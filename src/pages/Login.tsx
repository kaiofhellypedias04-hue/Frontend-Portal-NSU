import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, FileCheck2, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ApiError } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  if (usuario) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(email.trim(), senha);
      const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';
      navigate(destino, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setErro('E-mail ou senha inválidos. Confira os dados e tente novamente.');
      else if (error instanceof ApiError && error.status === 429) setErro('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      else setErro(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-screen relative flex min-h-screen flex-col items-center justify-center gap-3 overflow-hidden px-5 py-6">
      <picture>
        <source srcSet="/auth/planning-light.jpg" media="(prefers-color-scheme: light)" />
        <source srcSet="/auth/planning-dark.png" media="(prefers-color-scheme: dark)" />
        <img className="login-planning-brand" src="/auth/planning-dark.png" alt="Planning" width={410} height={112} />
      </picture>
      <section className="login-card relative z-10 w-full max-w-sm rounded-[1.75rem] p-5 text-white sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="login-card-icon grid h-9 w-9 place-items-center rounded-xl text-primary"><FileCheck2 size={19} /></span>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Portal NFS-e</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Bem-vindo de volta</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Entre na sua conta</h2>
        <p className="mt-2 text-text-secondary">Use o e-mail e a senha cadastrados para acessar o portal.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={19} />
              <input className="field pl-11" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" required autoFocus />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="senha">Senha</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={19} />
              <input className="field pl-11 pr-11" id="senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" required minLength={1} />
              <button type="button" onClick={() => setMostrarSenha((value) => !value)} className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-text-muted hover:bg-surface-muted" aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {erro ? <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</div> : null}
          <Button className="login-submit w-full" variant="primary" type="submit" disabled={enviando}>{enviando ? <><Loader2 size={18} className="animate-spin" /> Entrando...</> : <>Entrar <ArrowRight size={18} /></>}</Button>
        </form>

        <div className="mt-6 border-t border-white/15 pt-5 text-center text-sm text-text-secondary">Ainda não tem acesso? <Link className="font-semibold text-primary hover:underline" to="/criar-conta">Criar conta</Link></div>
      </section>
    </main>
  );
}
