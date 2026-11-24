import { CatalogLoadError } from '../../domain/errors';
import type { Catalog } from '../../domain/service';
import type { CatalogRepository } from '../ports/CatalogRepository';
import { makeGetCatalog } from './getCatalog';

const svc = (id: string, image: string) => ({
  id, title: id, description: id, url: `https://example.com/${id}`, image, type: 'Portal', keywords: [], featured: false,
});

describe('makeGetCatalog', () => {
  it('entrega o catálogo com os serviços de capa de verdade primeiro', async () => {
    const catalog: Catalog = [{ name: 'A', items: [svc('provisorio', '/covers/x.svg'), svc('pronto', '/covers/y.webp')] }];
    const repository: CatalogRepository = { getCatalog: async () => catalog };
    const result = await makeGetCatalog(repository)();
    expect(result[0]?.items.map((s) => s.id)).toEqual(['pronto', 'provisorio']);
  });

  it('repassa o sinal de cancelamento e propaga os erros do repositório', async () => {
    const controller = new AbortController();
    const seen: (AbortSignal | undefined)[] = [];
    const failing: CatalogRepository = {
      getCatalog: async (signal) => {
        seen.push(signal);
        throw new CatalogLoadError();
      },
    };
    await expect(makeGetCatalog(failing)(controller.signal)).rejects.toBeInstanceOf(CatalogLoadError);
    expect(seen).toEqual([controller.signal]);
  });
});
