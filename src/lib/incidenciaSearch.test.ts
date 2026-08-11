import { describe, expect, it } from 'vitest';
import { cleanClientOnlyFiltersForApi, notaMatchesPortalFilters } from './notaFilters';
import { notaMatchesSmartSearch } from './smartSearch';
import type { Nota } from '../types/api';

const nota = {
  id: 1,
  incidencia_iss: 'Imperatriz',
  municipio: 'Imperatriz',
} as Nota;

describe('busca por incidência do ISS', () => {
  it('aceita município com ou sem a UF', () => {
    expect(notaMatchesPortalFilters(nota, { incidencia_iss: 'Imperatriz' })).toBe(true);
    expect(notaMatchesPortalFilters(nota, { incidencia_iss: 'Imperatriz MA' })).toBe(true);
    expect(notaMatchesPortalFilters(nota, { incidencia_iss: 'Imperatriz/MA' })).toBe(true);
  });

  it('envia o município normalizado para o backend', () => {
    expect(cleanClientOnlyFiltersForApi({ incidencia_iss: 'Imperatriz - MA' }).incidencia_iss).toBe('Imperatriz');
  });

  it('inclui incidência e município na busca geral', () => {
    expect(notaMatchesSmartSearch(nota, 'Imperatriz')).toBe(true);
    expect(notaMatchesSmartSearch(nota, 'municipio:Imperatriz')).toBe(true);
  });
});
