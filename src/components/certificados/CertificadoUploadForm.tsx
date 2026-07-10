import { FormEvent, useMemo, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAutocadastrarCertificado } from '../../hooks/useCertificados';

function isValidCertFile(file?: File | null) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return name.endsWith('.pfx') || name.endsWith('.p12');
}

function resultMessage(autoIniciar: boolean, processoId?: number | null, automaticoAtivo?: boolean) {
  if (!autoIniciar) return 'Certificado cadastrado. A consulta automatica nao foi iniciada.';
  if (processoId) return `Consulta colocada na fila no processo #${processoId}.`;
  if (automaticoAtivo) return 'Motor automatico ativado. O backend vai enfileirar a consulta quando houver certificado elegivel.';
  return 'Certificado cadastrado. Confira o status do motor para acompanhar a fila.';
}

export function CertificadoUploadForm() {
  const autocadastrar = useAutocadastrarCertificado();
  const [senha, setSenha] = useState('');
  const [ambiente, setAmbiente] = useState<'producao' | 'homologacao'>('producao');
  const [autoIniciar, setAutoIniciar] = useState(true);
  const [limite, setLimite] = useState('100');
  const [nsuInicio, setNsuInicio] = useState('');
  const [forcar, setForcar] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fileError = useMemo(() => file && !isValidCertFile(file), [file]);
  const canSubmit = Boolean(file && isValidCertFile(file) && senha.trim());

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || !file) return;

    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('senha', senha);
    formData.append('ambiente', ambiente);
    formData.append('auto_iniciar', String(autoIniciar));
    formData.append('limite', limite.trim() || '100');
    if (nsuInicio.trim()) {
      formData.append('nsu_inicio', nsuInicio.trim());
    }
    formData.append('forcar', String(forcar));

    await autocadastrar.mutateAsync(formData);
    setSenha('');
    setFile(null);
    setForcar(false);
    setNsuInicio('');
  }

  const response = autocadastrar.data;
  const processoId = response?.processo?.id;
  const automaticoAtivo = response?.consulta_status?.automatico_ativo;

  return (
    <form onSubmit={onSubmit} className="glass-card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Cadastrar certificado</h2>
        <p className="mt-1 text-sm text-textSoft">Envie o certificado. O sistema identifica a empresa automaticamente e guarda a senha apenas no backend.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label">Arquivo .pfx / .p12</span>
          <input className="field" type="file" accept=".pfx,.p12" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          {fileError ? <p className="mt-2 text-xs text-rose-300">Arquivo invalido. Envie somente .pfx ou .p12.</p> : null}
        </label>

        <label>
          <span className="label">Senha</span>
          <input className="field" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Senha do certificado" required autoComplete="off" />
        </label>

        <label>
          <span className="label">Ambiente</span>
          <select className="field" value={ambiente} onChange={(event) => setAmbiente(event.target.value as 'producao' | 'homologacao')}>
            <option value="producao">Producao</option>
            <option value="homologacao">Homologacao</option>
          </select>
        </label>

        <label>
          <span className="label">Limite por consulta</span>
          <input className="field" type="number" min={1} value={limite} onChange={(event) => setLimite(event.target.value)} placeholder="Padrao do sistema" />
        </label>

        <label>
          <span className="label">NSU recomendado pelo usuario</span>
          <input
            className="field"
            type="number"
            min={0}
            value={nsuInicio}
            onChange={(event) => setNsuInicio(event.target.value)}
            placeholder="Numero do NSU"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-borderSoft bg-slate-950/30 px-3 py-3">
          <input type="checkbox" checked={forcar} onChange={(event) => setForcar(event.target.checked)} />
          <span className="text-sm text-slate-200">Forcar consulta mesmo se ja houver processo ativo.</span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-borderSoft bg-slate-950/30 px-3 py-3 md:col-span-2">
          <input type="checkbox" checked={autoIniciar} onChange={(event) => setAutoIniciar(event.target.checked)} />
          <span className="text-sm text-slate-200">Iniciar consulta automaticamente apos cadastrar.</span>
        </label>
      </div>

      {autocadastrar.isError ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{autocadastrar.error.message}</p> : null}
      {response ? (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          <p>{resultMessage(autoIniciar, processoId, automaticoAtivo)}</p>
          <div className="flex flex-wrap gap-2">
            {response.empresa ? <Badge value={`Empresa: ${response.empresa.nome}`} tone="success" /> : null}
            {response.certificado ? <Badge value={`Certificado #${response.certificado.id}: ${response.certificado.nome}`} tone="success" /> : null}
            {response.processo ? <Badge value={`Processo ${response.processo.status}`} tone="info" /> : null}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <Button variant="primary" disabled={autocadastrar.isPending || Boolean(fileError) || !canSubmit}>
          {autocadastrar.isPending ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
          Cadastrar certificado
        </Button>
      </div>
    </form>
  );
}
