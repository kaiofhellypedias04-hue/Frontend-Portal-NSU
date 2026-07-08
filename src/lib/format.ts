import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCnpj(value?: string | null) {
  const digits = onlyDigits(value || '');
  if (digits.length !== 14) return value || '-';
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatServiceCode(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  const raw = String(value).trim();
  const digits = onlyDigits(raw);
  if (digits.length < 4) return raw || '-';
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}`;
}

export function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numeric);
}

export function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-';
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function timeAgo(value?: string | null) {
  if (!value) return '-';
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return formatDistanceToNowStrict(date, { locale: ptBR, addSuffix: true });
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function statusLabel(status?: string | null) {
  const s = (status || '').toLowerCase();
  const map: Record<string, string> = {
    pendente: 'Pendente',
    rodando: 'Rodando',
    finalizado: 'Finalizado',
    erro: 'Erro',
    cancelado: 'Cancelado',
    normal: 'Normal',
    cancelada: 'Cancelada',
    substituida: 'Substituída',
  };
  return map[s] || status || '-';
}
