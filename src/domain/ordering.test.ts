import { coveredFirst, hasCoverArt } from './ordering';
import type { Catalog } from './service';

const svc = (id: string, image: string) => ({
  id,
  title: id,
  description: id,
  url: `https://example.com/${id}`,
  image,
  type: 'Portal',
  keywords: [],
  featured: false,
});

describe('hasCoverArt', () => {
  it('trata SVG como capa provisória e qualquer outro formato como arte de verdade', () => {
    expect(hasCoverArt(svc('a', '/covers/a.svg'))).toBe(false);
    expect(hasCoverArt(svc('a', '/covers/A.SVG'))).toBe(false);
    expect(hasCoverArt(svc('a', '/covers/a.webp'))).toBe(true);
    expect(hasCoverArt(svc('a', 'https://cdn.example.com/a.png'))).toBe(true);
  });
});

describe('coveredFirst', () => {
  const catalog: Catalog = [
    { name: 'A', guideImage: '/g.webp', items: [svc('p1', '/covers/p1.svg'), svc('r1', '/covers/r1.webp'), svc('p2', '/covers/p2.svg'), svc('r2', '/covers/r2.webp')] },
    { name: 'B', items: [svc('p3', '/covers/p3.svg')] },
  ];

  it('põe os com capa de verdade na frente, mantendo a ordem dentro de cada grupo', () => {
    const [a] = coveredFirst(catalog);
    expect(a?.items.map((s) => s.id)).toEqual(['r1', 'r2', 'p1', 'p2']);
  });

  it('preserva os dados da área e não altera o catálogo original', () => {
    const result = coveredFirst(catalog);
    expect(result[0]?.guideImage).toBe('/g.webp');
    expect(result[1]?.items.map((s) => s.id)).toEqual(['p3']);
    expect(catalog[0]?.items.map((s) => s.id)).toEqual(['p1', 'r1', 'p2', 'r2']);
  });
});
