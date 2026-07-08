import type { Nota, NotasFilters } from '../types/api';
import { onlyDigits } from './format';
import { notaMatchesSmartSearch } from './smartSearch';

function normalize(value?: string | number | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseCurrencyInput(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const raw = String(value).trim();
  if (!raw) return null;

  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/,/g, '');
  const numeric = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

function notaValor(nota: Nota) {
  return parseCurrencyInput(nota.valor_servico ?? nota.valor);
}

function fieldIncludes(value: string | number | null | undefined, term?: string) {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return true;
  return normalize(value).includes(normalizedTerm);
}

function digitsInclude(value: string | number | null | undefined, term?: string) {
  const digitsTerm = onlyDigits(String(term || ''));
  if (!digitsTerm) return true;
  return onlyDigits(String(value || '')).includes(digitsTerm);
}

function matchesSimpleStatus(nota: Nota, value?: string) {
  const filter = normalize(value);
  if (!filter) return true;
  if (filter === 'nfs-e') return normalize(nota.tipo).includes('nfs-e');

  const haystack = normalize([
    nota.status_simples_nacional,
    nota.simples_nacional,
    nota.simples_xml,
    nota.simples_nacional_xml,
    nota.consulta_simples_api,
  ].join(' '));

  if (filter === 'mei') return haystack.includes('mei');
  if (filter === 'nao_optante') return haystack.includes('nao optante') || haystack.includes('nao_optante');
  if (filter === 'optante_sn') return haystack.includes('optante') && !haystack.includes('nao optante') && !haystack.includes('nao_optante');
  return true;
}

export function notaMatchesPortalFilters(nota: Nota, filters?: NotasFilters) {
  if (!filters) return true;
  if (!notaMatchesSmartSearch(nota, filters.busca)) return false;
  if (!fieldIncludes(nota.incidencia_iss, filters.incidencia_iss)) return false;
  if (!fieldIncludes(nota.prestador_nome, filters.prestador_nome)) return false;
  if (!digitsInclude(nota.prestador_cnpj ?? nota.cnpj_prestador, filters.prestador_cnpj)) return false;
  if (!digitsInclude(nota.tomador_cnpj ?? nota.cnpj_tomador, filters.tomador_cnpj)) return false;
  if (!matchesSimpleStatus(nota, filters.status_simples_nacional)) return false;

  const min = parseCurrencyInput(filters.valor_minimo ?? filters.valor_min);
  const max = parseCurrencyInput(filters.valor_maximo ?? filters.valor_max);
  const valor = notaValor(nota);
  if (min !== null && (valor === null || valor < min)) return false;
  if (max !== null && (valor === null || valor > max)) return false;

  return true;
}

export function filterNotasByPortalFilters(notas: Nota[], filters?: NotasFilters) {
  return notas.filter((nota) => notaMatchesPortalFilters(nota, filters));
}

export function notaUniqueKey(nota: Nota) {
  const chave = String(nota.chave || '').trim();
  if (chave) return `chave:${chave}`;
  return `id:${nota.id}`;
}

export function dedupeNotas(notas: Nota[]) {
  const seen = new Set<string>();
  return notas.filter((nota) => {
    const key = notaUniqueKey(nota);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cleanClientOnlyFiltersForApi(filters?: NotasFilters): NotasFilters {
  const prestadorDigits = onlyDigits(String(filters?.prestador_cnpj || ''));
  const tomadorDigits = onlyDigits(String(filters?.tomador_cnpj || ''));
  return {
    ...filters,
    busca: undefined,
    incidencia_iss: undefined,
    prestador_nome: undefined,
    prestador_cnpj: prestadorDigits.length === 14 ? prestadorDigits : undefined,
    tomador_cnpj: tomadorDigits.length === 14 ? tomadorDigits : undefined,
  };
}
