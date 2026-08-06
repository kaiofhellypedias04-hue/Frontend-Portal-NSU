import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Building2, FileCheck2, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { api, ApiError } from '../lib/api';
import type { GrupoPublico } from '../types/api';
import { ADMIN_ENABLED } from '../lib/config';

export function CriarConta() {
  const { usuario, criarConta } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [grupo, setGrupo] = useState('planning_hub');
  const [grupos, setGrupos] = useState<GrupoPublico[]>([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (ADMIN_ENABLED) api.listarGruposPublicos().then(setGrupos).catch(() => setGrupos([]));
  }, []);

  if (usuario) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErro('');
    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }
    setEnviando(true);
    try {
      if (ADMIN_ENABLED && !grupo) {
        setErro('Selecione o grupo ao qual você pertence.');
        return;
      }
      await criarConta({ nome: nome.trim(), email: email.trim(), senha, grupo });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) setErro('Já existe uma conta com este e-mail.');
      else if (error instanceof ApiError && error.status === 429) setErro('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      else setErro(error instanceof Error ? error.message : 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-screen relative flex min-h-screen flex-col items-center justify-center gap-3 overflow-hidden px-5 py-6">
      <img className="login-planning-brand" src="/auth/planning-dark.png" alt="Planning" />
      <section className="login-card relative z-10 w-full max-w-md rounded-[1.75rem] p-5 text-white sm:p-7">
        <div className="flex items-center gap-3"><span className="login-card-icon grid h-9 w-9 place-items-center rounded-xl text-cyan-100"><FileCheck2 size={19} /></span><span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-200">Portal NFS-e</span></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Novo acesso</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Crie sua conta</h1>
        <p className="mt-2 text-slate-300">Preencha seus dados para acessar o dashboard.</p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <div><label className="label" htmlFor="nome">Nome completo</label><div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textSoft" size={19} /><input className="field pl-11" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Seu nome completo" required maxLength={255} autoFocus /></div></div>
          <div><label className="label" htmlFor="cadastro-email">E-mail</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textSoft" size={19} /><input className="field pl-11" id="cadastro-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="voce@empresa.com.br" required /></div></div>
          {ADMIN_ENABLED ? <div><label className="label" htmlFor="cadastro-grupo">Grupo</label><div className="relative"><Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textSoft" size={19} /><select className="field pl-11" id="cadastro-grupo" value={grupo} onChange={(e) => setGrupo(e.target.value)} required><option value="" disabled>Selecione seu grupo</option>{grupos.map((item) => <option key={item.codigo} value={item.codigo}>{item.nome}</option>)}</select></div><p className="mt-1.5 text-xs text-slate-300">Você verá somente as notas pertencentes ao grupo escolhido.</p></div> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="cadastro-senha">Senha</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-textSoft" size={18} /><input className="field pl-11" id="cadastro-senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" required minLength={8} /></div></div>
            <div><label className="label" htmlFor="confirmar-senha">Confirmar senha</label><input className="field" id="confirmar-senha" type="password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoComplete="new-password" placeholder="Repita a senha" required minLength={8} /></div>
          </div>
          {erro ? <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</div> : null}
          <Button className="login-submit w-full" variant="primary" type="submit" disabled={enviando}>{enviando ? <><Loader2 size={18} className="animate-spin" /> Criando conta...</> : <>Criar conta <ArrowRight size={18} /></>}</Button>
        </form>
        <div className="mt-6 border-t border-white/15 pt-5 text-center"><Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:underline"><ArrowLeft size={17} /> Já tenho uma conta</Link></div>
      </section>
    </main>
  );
}
