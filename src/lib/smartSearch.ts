import type { Nota } from '../types/api';

const COMMAND_ALIASES: Record<string, Array<keyof Nota>> = {
  nota: ['numero_nota', 'numero_nfse', 'numero'],
  numero: ['numero_nota', 'numero_nfse', 'numero'],
  chave: ['chave'],
  empresa: ['empresa_nome'],
  prestador: ['prestador_nome', 'prestador_cnpj', 'cnpj_prestador'],
  tomador: ['tomador_nome', 'tomador_cnpj', 'cnpj_tomador'],
  cnpj: ['prestador_cnpj', 'cnpj_prestador', 'tomador_cnpj', 'cnpj_tomador'],
  status: ['status', 'status_documento', 'status_nota', 'status_rotulo', 'conferencia_status', 'divergencia'],
  responsavel: ['responsavel', 'conferencia_por'],
  prioridade: ['prioridade'],
};

function normalize(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function compactDigits(value: string) {
  return value.replace(/\D/g, '');
}

function notaHaystack(nota: Nota) {
  return normalize(
    [
      nota.numero_nota,
      nota.numero_nfse,
      nota.numero,
      nota.chave,
      nota.empresa_nome,
      nota.prestador_nome,
      nota.prestador_cnpj,
      nota.cnpj_prestador,
      nota.tomador_nome,
      nota.tomador_cnpj,
      nota.cnpj_tomador,
      nota.status,
      nota.status_documento,
      nota.status_nota,
      nota.status_rotulo,
      nota.conferencia_status,
      nota.responsavel,
      nota.conferencia_por,
      nota.prioridade,
      nota.divergencia,
      nota.conferencia_observacao,
    ].join(' '),
  );
}

function fieldMatches(nota: Nota, fields: Array<keyof Nota>, term: string) {
  const normalizedTerm = normalize(term);
  const digitsTerm = compactDigits(term);

  return fields.some((field) => {
    const value = normalize(nota[field]);
    if (value.includes(normalizedTerm)) return true;
    return digitsTerm.length > 0 && compactDigits(value).includes(digitsTerm);
  });
}

export function notaMatchesSmartSearch(nota: Nota, busca?: string) {
  const query = (busca || '').trim();
  if (!query) return true;

  const parts = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const freeTerms: string[] = [];

  for (const rawPart of parts) {
    const part = rawPart.replace(/^"|"$/g, '');
    const commandMatch = part.match(/^([a-zA-Z_]+):(.+)$/);
    if (!commandMatch) {
      freeTerms.push(part);
      continue;
    }

    const [, rawKey, rawValue] = commandMatch;
    const fields = COMMAND_ALIASES[normalize(rawKey)];
    if (!fields) {
      freeTerms.push(rawValue);
      continue;
    }

    if (!fieldMatches(nota, fields, rawValue)) return false;
  }

  if (freeTerms.length === 0) return true;
  const haystack = notaHaystack(nota);
  return freeTerms.every((term) => {
    const normalizedTerm = normalize(term);
    const digitsTerm = compactDigits(term);
    return haystack.includes(normalizedTerm) || (digitsTerm.length > 0 && compactDigits(haystack).includes(digitsTerm));
  });
}

export function filterNotasBySmartSearch(notas: Nota[], busca?: string) {
  return notas.filter((nota) => notaMatchesSmartSearch(nota, busca));
}
