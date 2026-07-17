import { KeyRound, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { CertificadoUploadForm } from '../components/certificados/CertificadoUploadForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCertificados, useDesativarCertificado, useTestarSenhaSalva } from '../hooks/useCertificados';
import { formatDate, formatDateTime } from '../lib/format';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useState } from 'react';

export function Certificados() {
  const { data: certificados = [], isLoading } = useCertificados();
  const testar = useTestarSenhaSalva();
  const desativar = useDesativarCertificado();
  const [certificateToDisable, setCertificateToDisable] = useState<{ id: number; nome: string } | null>(null);

  return (
    <div>
      <PageHeader eyebrow="Administração" title="Certificados digitais" description="Cadastre, teste e acompanhe os certificados usados nas consultas de NFS-e." actions={<Badge value={`${certificados.filter((c) => c.ativo).length} ativos`} tone="success" />} />
      <div className="grid gap-5 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <CertificadoUploadForm />

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white">Certificados cadastrados</h1>
            <p className="mt-1 text-sm text-textSoft">A senha e o storage ficam protegidos no backend. A empresa é identificada automaticamente no cadastro.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-textSoft"><Loader2 className="animate-spin" size={18} /> Carregando certificados...</div>
        ) : certificados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-borderSoft p-8 text-center text-textSoft">Nenhum certificado cadastrado ainda.</div>
        ) : (
          <div className="space-y-3">
            {certificados.map((certificado) => (
              <article key={certificado.id} className="rounded-2xl border border-borderSoft bg-slate-950/30 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white">{certificado.nome}</h3>
                      <Badge value={certificado.ativo ? 'Ativo' : 'Inativo'} tone={certificado.ativo ? 'success' : 'muted'} />
                      <Badge value={certificado.senha_configurada || certificado.possui_senha ? 'Senha configurada' : 'Sem senha'} tone={certificado.senha_configurada || certificado.possui_senha ? 'success' : 'warning'} />
                    </div>
                    <p className="mt-2 text-sm text-textSoft">Empresa ID #{certificado.empresa_id}</p>
                    <p className="mt-1 truncate text-sm text-slate-300">{certificado.subject_cn || 'Subject não informado'}</p>
                    <div className="mt-3 grid gap-2 text-xs text-textSoft sm:grid-cols-2">
                      <span>Validade: {formatDate(certificado.valido_ate)}</span>
                      <span>Atualizado: {formatDateTime(certificado.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => testar.mutate(certificado.id)} disabled={testar.isPending}>
                      {testar.isPending ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                      Testar senha
                    </Button>
                    {certificado.ativo ? (
                      <Button variant="danger" onClick={() => setCertificateToDisable({ id: certificado.id, nome: certificado.nome })} disabled={desativar.isPending}>
                        <Trash2 size={16} /> Desativar
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {testar.isSuccess ? (
          <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
            <ShieldCheck size={16} className="mr-2 inline" /> Teste concluído: {testar.data.ok ? 'certificado válido' : testar.data.erro || 'falhou'}.
          </p>
        ) : null}
        {testar.isError ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{testar.error.message}</p> : null}
      </Card>
      </div>
      <ConfirmDialog open={Boolean(certificateToDisable)} title="Desativar certificado?" description={`O certificado ${certificateToDisable?.nome || ''} deixará de ser usado nas novas consultas.`} confirmLabel="Desativar certificado" onClose={() => setCertificateToDisable(null)} onConfirm={() => { if (certificateToDisable) desativar.mutate(certificateToDisable.id); setCertificateToDisable(null); }} />
    </div>
  );
}
