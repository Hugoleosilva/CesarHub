import { useMemo } from 'react';
import { favoriteServices } from '../../domain/favorites';
import { collectTopics, collectTypes, filterCatalog, filterServices, hasFilters } from '../../domain/filters';
import type { Filters } from '../../domain/filters';
import { searchCatalog, suggestServices } from '../../domain/search';
import { CUSTOM_LINKS_CATEGORY } from '../../domain/customLinks';
import type { Catalog, Service } from '../../domain/service';

type Input = {
  catalog: Catalog;
  /** Links externos do usuário, tratados como mais uma área na busca. */
  externalLinks: readonly Service[];
  favoriteIds: readonly string[];
  query: string;
  filters: Filters;
};

/** Tudo o que a tela deriva do catálogo: resultados da busca, filtros disponíveis e a seleção pessoal. */
export function useCatalogView({ catalog, externalLinks, favoriteIds, query, filters }: Input) {
  const externalCategory = useMemo(() => ({ name: CUSTOM_LINKS_CATEGORY, items: [...externalLinks] }), [externalLinks]);
  const searchable = useMemo(() => [...catalog, externalCategory], [catalog, externalCategory]);
  const results = useMemo(() => filterCatalog(searchCatalog(searchable, query), filters), [searchable, query, filters]);
  const suggestions = useMemo(() => suggestServices(searchable, query), [searchable, query]);
  const filteredCatalog = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);
  const filterTypes = useMemo(() => collectTypes(catalog), [catalog]);
  const filterTopics = useMemo(() => collectTopics(catalog), [catalog]);
  const personalItems: Service[] = useMemo(
    () => [...favoriteServices(catalog, favoriteIds), ...externalCategory.items],
    [catalog, favoriteIds, externalCategory],
  );
  const personalShown = useMemo(() => filterServices(personalItems, filters), [personalItems, filters]);

  return {
    searching: query.trim() !== '',
    filtering: hasFilters(filters),
    results,
    suggestions,
    filteredCatalog,
    filterTypes,
    filterTopics,
    personalItems,
    personalShown,
  };
}
