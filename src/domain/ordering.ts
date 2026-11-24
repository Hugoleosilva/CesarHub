import type { Catalog, Service } from './service';

/**
 * Capa provisória = SVG gerado pelo projeto (`npm run assets`). Qualquer outro formato
 * (webp, png, jpg…) é arte de verdade, vinda de `npm run images` ou de uma URL.
 */
export const hasCoverArt = (service: Service): boolean => !service.image.toLowerCase().endsWith('.svg');

/** Em cada área, serviços com capa de verdade vêm antes dos provisórios; a ordem relativa é mantida. */
export function coveredFirst(catalog: Catalog): Catalog {
  return catalog.map((category) => ({
    ...category,
    items: [...category.items.filter(hasCoverArt), ...category.items.filter((s) => !hasCoverArt(s))],
  }));
}
