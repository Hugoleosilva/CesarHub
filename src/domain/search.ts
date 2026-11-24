import type { Catalog, Category, Service } from './service';

/** Minúsculas e sem acentos, para "contra-cheque" casar com "Contracheque". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .trim();
}

function tokenize(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/** Cenários e responsáveis também são buscáveis: achar "Maria" traz os serviços dela. */
function guideTerms(service: Service): string[] {
  if (!service.guide) return [];
  return [
    ...service.guide.cases.map((c) => c.title),
    ...service.guide.contacts.flatMap((c) => [c.name, c.role ?? '']),
  ];
}

function haystack(service: Service, category: Category): string {
  return normalize(
    [service.title, service.description, service.type, category.name, ...service.keywords, ...guideTerms(service)].join(' '),
  );
}

/** Todos os termos da consulta precisam aparecer em algum campo do serviço. */
export function searchCatalog(catalog: Catalog, query: string): Catalog {
  const tokens = tokenize(query);
  if (tokens.length === 0) return catalog;

  return catalog
    .map((category) => ({
      name: category.name,
      items: category.items.filter((service) => {
        const text = haystack(service, category);
        return tokens.every((token) => text.includes(token));
      }),
    }))
    .filter((category) => category.items.length > 0);
}

export function countServices(catalog: Catalog): number {
  return catalog.reduce((total, category) => total + category.items.length, 0);
}

/** Sugestões do autocomplete: serviços que casam, com título que começa com o termo primeiro. */
export function suggestServices(catalog: Catalog, query: string, limit = 6): Service[] {
  const first = tokenize(query)[0];
  if (!first) return [];

  const matches = searchCatalog(catalog, query).flatMap((category) => category.items);
  const startsWith = (service: Service) => normalize(service.title).startsWith(first);
  return [...matches.filter(startsWith), ...matches.filter((s) => !startsWith(s))].slice(0, limit);
}
