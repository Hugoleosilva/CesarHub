import type { Catalog, Service } from './service';

export function toggleFavorite(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];
}

/** Favoritos na ordem em que foram marcados; ids que não existem mais no catálogo são ignorados. */
export function favoriteServices(catalog: Catalog, ids: readonly string[]): Service[] {
  const byId = new Map(catalog.flatMap((category) => category.items).map((s) => [s.id, s]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

export function featuredServices(catalog: Catalog): Service[] {
  return catalog.flatMap((category) => category.items).filter((service) => service.featured);
}
