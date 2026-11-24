import { favoriteServices, featuredServices, toggleFavorite } from './favorites';
import type { Catalog } from './service';

const svc = (id: string, featured = false) => ({
  id,
  title: id,
  description: id,
  url: `https://example.com/${id}`,
  image: `/${id}.svg`,
  type: 'Portal',
  keywords: [],
  featured,
});

const catalog: Catalog = [
  { name: 'A', items: [svc('a'), svc('b', true)] },
  { name: 'B', items: [svc('c')] },
];

describe('toggleFavorite', () => {
  it('adiciona e remove sem mutar a lista original', () => {
    const ids = ['a'];
    expect(toggleFavorite(ids, 'b')).toEqual(['a', 'b']);
    expect(toggleFavorite(ids, 'a')).toEqual([]);
    expect(ids).toEqual(['a']);
  });
});

describe('favoriteServices', () => {
  it('mantém a ordem marcada e ignora ids obsoletos', () => {
    expect(favoriteServices(catalog, ['c', 'removido', 'a']).map((s) => s.id)).toEqual(['c', 'a']);
  });
});

describe('featuredServices', () => {
  it('retorna só os serviços em destaque', () => {
    expect(featuredServices(catalog).map((s) => s.id)).toEqual(['b']);
  });
});
