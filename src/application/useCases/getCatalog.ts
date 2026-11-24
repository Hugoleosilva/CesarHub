import { coveredFirst } from '../../domain/ordering';
import type { Catalog } from '../../domain/service';
import type { CatalogRepository } from '../ports/CatalogRepository';

export type GetCatalog = (signal?: AbortSignal) => Promise<Catalog>;

/** Carrega o catálogo e põe, em cada área, os serviços com capa de verdade antes dos provisórios. */
export const makeGetCatalog =
  (repository: CatalogRepository): GetCatalog =>
  async (signal) =>
    coveredFirst(await repository.getCatalog(signal));
