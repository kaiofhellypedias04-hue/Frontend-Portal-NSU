import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate, formatServiceCode, timeAgo } from '../../lib/format';
import type { Nota } from '../../types/api';

export function NotaMobileCard({ nota, onOpen }: { nota: Nota; onOpen: (nota: Nota) => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-2xl border border-borderSoft bg-panel p-4 transition hover:bg-slate-800/30 focus:bg-slate-800/40 focus:outline-none"
      onClick={() => onOpen(nota)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(nota);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-textSoft">NFS-e</p>
          <h3 className="mt-1 font-bold text-white">{nota.numero_nfse || nota.id}</h3>
        </div>
        <Badge value={nota.status_rotulo || nota.status_documento || 'Sem status'} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">{nota.tomador_nome || nota.empresa_nome || '-'}</p>
      <p className="mt-1 line-clamp-1 text-xs text-textSoft">{nota.prestador_nome || 'Prestador nao informado'}</p>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-textSoft">Competencia</p>
          <p className="font-semibold text-white">{formatDate(nota.competencia)}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Emissao</p>
          <p className="font-semibold text-white">{formatDate(nota.data_emissao)}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Valor</p>
          <p className="font-semibold text-white">{formatCurrency(nota.valor_servico)}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Cod. servico</p>
          <p className="font-semibold text-white">{formatServiceCode(nota.codigo_servico)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-textSoft">Atualizada {timeAgo(nota.importado_em || nota.updated_at || nota.created_at)}</span>
      </div>
    </article>
  );
}
