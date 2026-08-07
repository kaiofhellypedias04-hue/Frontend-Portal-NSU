import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, KeyRound, Loader2, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { CertificadoUploadForm } from '../components/certificados/CertificadoUploadForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { useCertificados, useDesativarCertificado, useTestarSenhaSalva } from '../hooks/useCertificados';
import { formatDate, formatDateTime } from '../lib/format';

const PAGE_SIZE = 6;

export function Certificados() {
  const { data: certificados = [], isLoading } = useCertificados();
  const testar = useTestarSenhaSalva();
  const desativar = useDesativarCertificado();
  const [certificateToDisable, setCertificateToDisable] = useState<{ id: number; nome: string } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredCertificates = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return [...certificados]
      .sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome, 'pt-BR'))
      .filter((certificado) => {
        if (!term) return true;
        return [certificado.nome, certificado.subject_cn, certificado.empresa_id, certificado.id]
          .some((value) => String(value ?? '').toLocaleLowerCase('pt-BR').includes(term));
      });
  }, [certificados, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / PAGE_SIZE));
  const paginatedCertificates = filteredCertificates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return (
    <div>
      <PageHeader
        eyebrow="Administração"
        title="Certificados digitais"
        description="Cadastre, teste e acompanhe os certificados usados nas consultas de NFS-e."
        actions={<Badge value={`${certificados.filter((certificate) => certificate.ativo).length} ativos`} tone="success" />}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <CertificadoUploadForm />

        <Card>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white">Certificados cadastrados</h1>
              <p className="mt-1 text-sm text-textSoft">A senha e o storage ficam protegidos no backend. Todos os cadastros usam o ambiente de produção.</p>
            </div>
            <Badge value={`${filteredCertificates.length} encontrados`} tone="info" />
          </div>

          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textSoft" size={18} />
            <input
              className="field pl-10 pr-10"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CNPJ ou ID"
              aria-label="Buscar certificados"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSoft transition hover:text-white"
                aria-label="Limpar busca"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-textSoft"><Loader2 className="animate-spin" size={18} /> Carregando certificados...</div>
          ) : certificados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderSoft p-8 text-center text-textSoft">Nenhum certificado cadastrado ainda.</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderSoft p-8 text-center text-textSoft">Nenhum certificado corresponde à busca.</div>
          ) : (
            <>
              <div className="grid gap-3 lg:grid-cols-2">
                {paginatedCertificates.map((certificado) => (
                  <article key={certificado.id} className="flex min-h-64 flex-col rounded-2xl border border-borderSoft bg-slate-950/30 p-4">
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="line-clamp-2 min-w-0 flex-1 font-bold text-white" title={certificado.nome}>{certificado.nome}</h3>
                          <Badge value={certificado.ativo ? 'Ativo' : 'Inativo'} tone={certificado.ativo ? 'success' : 'muted'} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge
                            value={certificado.senha_configurada || certificado.possui_senha ? 'Senha configurada' : 'Sem senha'}
                            tone={certificado.senha_configurada || certificado.possui_senha ? 'success' : 'warning'}
                          />
                          <Badge value={`Empresa #${certificado.empresa_id}`} tone="muted" />
                          <Badge value={`Certificado #${certificado.id}`} tone="muted" />
                        </div>
                        <p className="mt-3 truncate text-sm text-slate-300" title={certificado.subject_cn || undefined}>
                          {certificado.subject_cn || 'Subject não informado'}
                        </p>
                        <div className="mt-3 grid gap-2 text-xs text-textSoft sm:grid-cols-2">
                          <span>Validade: {formatDate(certificado.valido_ate)}</span>
                          <span>Atualizado: {formatDateTime(certificado.updated_at)}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2 border-t border-borderSoft pt-4">
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

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-borderSoft pt-4">
                <p className="text-sm text-textSoft">Página {page} de {totalPages} · {filteredCertificates.length} certificado(s)</p>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                    <ChevronLeft size={16} /> Anterior
                  </Button>
                  <Button variant="secondary" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                    Próxima <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}

          {testar.isSuccess ? (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
              <ShieldCheck size={16} className="mr-2 inline" /> Teste concluído: {testar.data.ok ? 'certificado válido' : testar.data.erro || 'falhou'}.
            </p>
          ) : null}
          {testar.isError ? <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{testar.error.message}</p> : null}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(certificateToDisable)}
        title="Desativar certificado?"
        description={`O certificado ${certificateToDisable?.nome || ''} deixará de ser usado nas novas consultas.`}
        confirmLabel="Desativar certificado"
        onClose={() => setCertificateToDisable(null)}
        onConfirm={() => {
          if (certificateToDisable) desativar.mutate(certificateToDisable.id);
          setCertificateToDisable(null);
        }}
      />
    </div>
  );
}
