import type { Catalog, Service } from '../../../domain/service';
import { categoryTab } from '../../navigation';
import { countShown, describeCount } from './resultCount';

const svc = (id: string): Service => ({
  id, title: id, description: id, url: `https://example.com/${id}`, image: `/covers/${id}.svg`, type: 'Portal', keywords: [], featured: false,
});

const catalog: Catalog = [
  { name: 'Pessoas', items: [svc('a'), svc('b')] },
  { name: 'Ferramentas', items: [svc('c')] },
];
const base = { searching: false, activeView: 'home', results: [], filteredCatalog: catalog, personalShown: [] };

describe('countShown', () => {
  it('na busca conta os resultados', () => {
    expect(countShown({ ...base, searching: true, results: [{ name: 'Pessoas', items: [svc('a')] }] })).toBe(1);
  });

  it('no início soma todas as áreas e os links externos, sem repetir favoritos', () => {
    expect(countShown({ ...base, personalShown: [svc('a'), svc('externo')] })).toBe(4);
  });

  it('em uma área conta só os serviços dela', () => {
    expect(countShown({ ...base, activeView: categoryTab('Pessoas') })).toBe(2);
  });

  it('na tela personalizada conta o que está nela', () => {
    expect(countShown({ ...base, activeView: 'personal', personalShown: [svc('a')] })).toBe(1);
  });

  it('uma área esvaziada pelo filtro conta zero', () => {
    expect(countShown({ ...base, activeView: categoryTab('Aprendizagem') })).toBe(0);
  });
});

describe('describeCount', () => {
  it('usa singular e plural', () => {
    expect(describeCount(1)).toBe('1 serviço encontrado');
    expect(describeCount(0)).toBe('0 serviços encontrados');
    expect(describeCount(7)).toBe('7 serviços encontrados');
  });
});
