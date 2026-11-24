import { NO_FILTERS, collectTopics, collectTypes, filterCatalog, filterServices, hasFilters, matchesFilters } from './filters';
import type { Catalog } from './service';

const svc = (id: string, type: string, topics?: string[]) => ({
  id, title: id, description: id, url: `https://example.com/${id}`, image: `/covers/${id}.webp`, type, keywords: [], featured: false, topics,
});

const catalog: Catalog = [
  { name: 'Pessoas', guideImage: '/g.webp', items: [svc('ponto', 'Portal', ['Jornada']), svc('plano', 'Zeev', ['Benefícios', 'Saúde']), svc('semtopico', 'Portal')] },
  { name: 'Ferramentas', items: [svc('gmail', 'Google', ['Colaboração'])] },
];

describe('hasFilters', () => {
  it('é falso sem seleção e verdadeiro com qualquer seleção', () => {
    expect(hasFilters(NO_FILTERS)).toBe(false);
    expect(hasFilters({ types: ['Portal'], topics: [] })).toBe(true);
    expect(hasFilters({ types: [], topics: ['Jornada'] })).toBe(true);
  });
});

describe('matchesFilters', () => {
  it('sem filtros aceita tudo', () => {
    expect(matchesFilters(svc('a', 'Portal'), NO_FILTERS)).toBe(true);
  });

  it('dentro de cada lista vale "qualquer um"', () => {
    expect(matchesFilters(svc('a', 'Zeev'), { types: ['Portal', 'Zeev'], topics: [] })).toBe(true);
    expect(matchesFilters(svc('a', 'Google', ['Saúde']), { types: [], topics: ['Jornada', 'Saúde'] })).toBe(true);
  });

  it('entre tipo e tópico vale "e"', () => {
    const filters = { types: ['Zeev'], topics: ['Saúde'] };
    expect(matchesFilters(svc('a', 'Zeev', ['Saúde']), filters)).toBe(true);
    expect(matchesFilters(svc('a', 'Portal', ['Saúde']), filters)).toBe(false);
    expect(matchesFilters(svc('a', 'Zeev', ['Jornada']), filters)).toBe(false);
  });

  it('serviço sem tópicos não casa com filtro de tópico', () => {
    expect(matchesFilters(svc('a', 'Portal'), { types: [], topics: ['Jornada'] })).toBe(false);
  });
});

describe('filterServices / filterCatalog', () => {
  it('filtra a lista e devolve cópia quando não há filtros', () => {
    const items = catalog[0]!.items;
    expect(filterServices(items, { types: ['Portal'], topics: [] }).map((s) => s.id)).toEqual(['ponto', 'semtopico']);
    const copy = filterServices(items, NO_FILTERS);
    expect(copy).toEqual(items);
    expect(copy).not.toBe(items);
  });

  it('descarta áreas que ficam vazias e preserva os dados das demais', () => {
    const result = filterCatalog(catalog, { types: ['Portal'], topics: [] });
    expect(result.map((c) => c.name)).toEqual(['Pessoas']);
    expect(result[0]?.guideImage).toBe('/g.webp');
    expect(result[0]?.items.map((s) => s.id)).toEqual(['ponto', 'semtopico']);
  });

  it('sem filtros devolve o próprio catálogo', () => {
    expect(filterCatalog(catalog, NO_FILTERS)).toBe(catalog);
  });
});

describe('collectTypes / collectTopics', () => {
  it('lista valores únicos em ordem alfabética', () => {
    expect(collectTypes(catalog)).toEqual(['Google', 'Portal', 'Zeev']);
    expect(collectTopics(catalog)).toEqual(['Benefícios', 'Colaboração', 'Jornada', 'Saúde']);
  });
});
