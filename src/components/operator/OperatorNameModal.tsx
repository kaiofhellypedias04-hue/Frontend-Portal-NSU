import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Button } from '../ui/Button';

export function OperatorNameModal({
  storageWarning,
  onSubmit,
}: {
  storageWarning?: boolean;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const cleanName = name.replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    setError('');
    onSubmit(cleanName);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/90 px-4 backdrop-blur">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-borderSoft bg-panel p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
            <UserRound size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quem está usando o portal?</h1>
            <p className="mt-1 text-sm text-textSoft">Informe seu nome para registrar responsável e conferências neste computador.</p>
          </div>
        </div>

        <label>
          <span className="label">Seu nome</span>
          <input
            autoFocus
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Kaio"
          />
        </label>

        {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        {storageWarning ? (
          <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
            O armazenamento local não está disponível. O nome ficará ativo apenas enquanto esta aba estiver aberta.
          </p>
        ) : (
          <p className="mt-2 text-xs text-textSoft">Esse nome ficará salvo apenas neste navegador.</p>
        )}

        <Button type="submit" variant="primary" className="mt-5 w-full">
          Entrar no portal
        </Button>
      </form>
    </div>
  );
}
