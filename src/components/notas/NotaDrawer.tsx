import { ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Drawer } from '../ui/Drawer';
import { api } from '../../lib/api';
import type { Nota } from '../../types/api';
import { NotaDetailSections } from './NotaDetailSections';

export function NotaDrawer({ nota, notas = [], onSelectNota, onClose }: { nota: Nota | null; notas?: Nota[]; onSelectNota?: (nota: Nota) => void; onClose: () => void }) {
  const open = Boolean(nota);
  const {
    data: notaDetalhada,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['nota-detalhe', nota?.id],
    queryFn: () => api.obterNota(nota!.id),
    enabled: open,
    placeholderData: (previousData) => previousData,
  });
  const currentNota = notaDetalhada || nota;
  const currentIndex = nota ? notas.findIndex((item) => item.id === nota.id) : -1;
  const nextNota = currentIndex >= 0 ? notas[currentIndex + 1] : undefined;

  return (
    <Drawer
      open={open}
      title={`NFS-e ${currentNota?.numero_nfse || currentNota?.numero_nota || currentNota?.id || ''}`}
      onClose={onClose}
      expandable
      actions={onSelectNota ? (
        <button type="button" disabled={!nextNota} onClick={() => nextNota && onSelectNota(nextNota)} className="mr-1 flex items-center gap-2 rounded-lg border border-borderSoft px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-accent/60 hover:bg-accent/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:mr-2" aria-label="Passar para a próxima nota" title="Passar para a próxima nota">
          <span className="hidden md:inline">Passar para a próxima nota</span><ArrowRight size={17} />
        </button>
      ) : null}
    >
      {currentNota ? (
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-borderSoft bg-slate-950/30 p-3 text-sm text-textSoft">
              <Loader2 className="animate-spin" size={16} /> Carregando detalhes da nota...
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
              Não foi possível atualizar os detalhes agora. Mostrando dados da lista.
            </div>
          ) : null}
          <NotaDetailSections nota={currentNota} />
        </div>
      ) : null}
    </Drawer>
  );
}
