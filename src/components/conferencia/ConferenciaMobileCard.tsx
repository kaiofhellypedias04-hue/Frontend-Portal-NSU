import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatCnpj, formatCurrency, formatDate, formatServiceCode } from '../../lib/format';
import type { Nota } from '../../types/api';
import { badgeTone, conferenciaLabel, displayValue, notaNumero, notaValor, tipoNotaLabel } from './conferenciaUtils';

function conferenciaIcon(status?: string | null) {
  const value = String(status || 'pendente').toLowerCase();
  if (value === 'ok') return <CheckCircle2 aria-label="Nota conferida" className="text-emerald-300" size={18} />;
  if (value === 'observacao') return <Eye aria-label="Nota em observação" className="text-sky-300" size={18} />;
  return <AlertTriangle aria-label="Nota pendente de conferência" className="text-amber-300" size={18} />;
}

function slaLabel(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.label;
  return nota.sla || nota.sla_status || 'Sem prazo';
}

function slaTone(nota: Nota) {
  if (nota.sla && typeof nota.sla === 'object') return nota.sla.tone;
  return nota.sla_status || null;
}

export function ConferenciaMobileCard({ nota, onOpen }: { nota: Nota; onOpen: (nota: Nota) => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-2xl border border-borderSoft bg-panel p-4 transition hover:bg-slate-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
      onClick={() => onOpen(nota)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(nota);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {conferenciaIcon(nota.conferencia_status)}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-textSoft">NFS-e</p>
            <h3 className="mt-0.5 truncate font-bold text-white">{notaNumero(nota)}</h3>
          </div>
        </div>
        <Badge value={conferenciaLabel(nota.conferencia_status || 'pendente')} tone={badgeTone(nota.conferencia_status || 'pendente')} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">{displayValue(nota.tomador_nome || 'Não informado no XML')}</p>
      <p className="mt-0.5 line-clamp-1 text-xs text-textSoft">{formatCnpj(nota.tomador_cnpj)}</p>
      <p className="mt-2 line-clamp-1 text-xs text-textSoft">Prestador: {displayValue(nota.prestador_nome)}</p>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-textSoft">Competência</p>
          <p className="font-semibold text-white">{formatDate(nota.competencia)}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Emissão</p>
          <p className="font-semibold text-white">{formatDate(nota.data_emissao)}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Valor</p>
          <p className="font-semibold text-white">{formatCurrency(notaValor(nota))}</p>
        </div>
        <div>
          <p className="text-xs text-textSoft">Cód. serviço</p>
          <p className="font-semibold text-white">{formatServiceCode(nota.codigo_servico)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge value={tipoNotaLabel(nota.tipo_nota)} tone={badgeTone(nota.tipo_nota)} className="text-[11px]" />
        <Badge
          value={nota.divergencia_fila_label || nota.divergencia || 'Sem divergência'}
          tone={nota.divergencia_fila_final ? 'danger' : 'success'}
          className="text-[11px]"
        />
        <Badge value={slaLabel(nota)} tone={badgeTone(slaTone(nota))} className="text-[11px]" />
      </div>
    </article>
  );
}
