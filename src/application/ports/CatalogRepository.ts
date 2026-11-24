import type { Catalog } from '../../domain/service';

export interface CatalogRepository {
  /** @throws CatalogLoadError | CatalogValidationError */
  getCatalog(signal?: AbortSignal): Promise<Catalog>;
}
