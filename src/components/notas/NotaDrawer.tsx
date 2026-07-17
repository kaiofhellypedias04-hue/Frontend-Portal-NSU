import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Drawer } from '../ui/Drawer';
import { api } from '../../lib/api';
import type { Nota } from '../../types/api';
import { NotaDetailSections } from './NotaDetailSections';

export function NotaDrawer({ nota, onClose }: { nota: Nota | null; onClose: () => void }) {
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

  return (
    <Drawer open={open} title={`NFS-e ${currentNota?.numero_nfse || currentNota?.numero_nota || currentNota?.id || ''}`} onClose={onClose}>
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
