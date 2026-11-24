import type { Catalog, Service } from './service';

/** Filtros do estilo KnowBe4: tipo de conteúdo (Portal, Zeev…) e tópicos (assuntos). */
export type Filters = { readonly types: readonly string[]; readonly topics: readonly string[] };

export const NO_FILTERS: Filters = { types: [], topics: [] };

export const hasFilters = (filters: Filters): boolean => filters.types.length > 0 || filters.topics.length > 0;

/** Dentro de cada lista vale "qualquer um"; entre as duas listas vale "e". Lista vazia não filtra. */
export function matchesFilters(service: Service, filters: Filters): boolean {
  const typeOk = filters.types.length === 0 || filters.types.includes(service.type);
  const topicOk = filters.topics.length === 0 || (service.topics ?? []).some((topic) => filters.topics.includes(topic));
  return typeOk && topicOk;
}

export function filterServices(services: readonly Service[], filters: Filters): Service[] {
  return hasFilters(filters) ? services.filter((service) => matchesFilters(service, filters)) : [...services];
}

/** Mantém só as áreas que ainda têm serviços depois do filtro. */
export function filterCatalog(catalog: Catalog, filters: Filters): Catalog {
  if (!hasFilters(filters)) return catalog;
  return catalog
    .map((category) => ({ ...category, items: category.items.filter((service) => matchesFilters(service, filters)) }))
    .filter((category) => category.items.length > 0);
}

const byName = (a: string, b: string) => a.localeCompare(b, 'pt-BR');

export function collectTypes(catalog: Catalog): string[] {
  return [...new Set(catalog.flatMap((category) => category.items.map((service) => service.type)))].sort(byName);
}

export function collectTopics(catalog: Catalog): string[] {
  return [...new Set(catalog.flatMap((category) => category.items.flatMap((service) => service.topics ?? [])))].sort(byName);
}
