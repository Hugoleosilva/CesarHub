import type { CatalogRepository } from '../application/ports/CatalogRepository';
import { CatalogLoadError } from '../domain/errors';
import type { Catalog } from '../domain/service';
import { parseCatalog } from './catalogSchema';

export class JsonCatalogRepository implements CatalogRepository {
  constructor(
    private readonly url = '/data/services.json',
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
  ) {}

  async getCatalog(signal?: AbortSignal): Promise<Catalog> {
    let raw: unknown;
    try {
      const response = await this.fetchFn(this.url, { signal });
      if (!response.ok) throw new CatalogLoadError(`Falha ao carregar o catálogo (HTTP ${response.status}).`);
      raw = await response.json();
    } catch (error) {
      if (error instanceof CatalogLoadError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new CatalogLoadError(undefined, { cause: error });
    }
    return parseCatalog(raw);
  }
}
