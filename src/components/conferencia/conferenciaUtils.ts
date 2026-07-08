import type { Nota } from '../../types/api';

export function displayValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

export function notaNumero(nota: Nota) {
  return displayValue(nota.numero_nota ?? nota.numero_nfse ?? nota.numero);
}

export function notaValor(nota: Nota) {
  return nota.valor_servico ?? nota.valor ?? null;
}

export function conferenciaLabel(value?: string | null) {
  const map: Record<string, string> = {
    pendente: 'Pendente',
    ok: 'OK',
    corrigir: 'Corrigir',
    observacao: 'Observação',
  };
  return map[(value || '').toLowerCase()] || displayValue(value);
}

export function tipoNotaLabel(value?: string | null) {
  const map: Record<string, string> = {
    tomada: 'Tomada',
    prestada: 'Prestada',
    indefinida: 'Indefinida',
    inconsistente: 'Inconsistente',
  };
  return map[(value || '').toLowerCase()] || displayValue(value);
}

export function badgeTone(value?: string | null): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
  const text = (value || '').toLowerCase();
  if (['ok', 'normal', 'baixo', 'no_prazo', 'sem_divergencia'].includes(text)) return 'success';
  if (['pendente', 'medio', 'médio', 'observacao', 'observação', 'atencao', 'atenção'].includes(text)) return 'warning';
  if (['corrigir', 'alto', 'vencido', 'cancelada', 'substituida', 'com_divergencia', 'divergente'].includes(text)) return 'danger';
  if (['entrada', 'competencia', 'atualizacao', 'sla'].includes(text)) return 'info';
  return 'muted';
}
