import type { Filters } from '../domain/filters';
import type { Catalog } from '../domain/service';
import type { useCatalogView } from './hooks/useCatalogView';
import type { useGuideNotes } from './hooks/useGuideNotes';
import type { useNavigation } from './hooks/useNavigation';
import { buildHeroSlides } from './features/catalog/heroSlides';
import { HOME } from './navigation';
import { countShown, describeCount } from './features/catalog/resultCount';
import { CatalogBody } from './features/catalog/CatalogBody';
import type { CatalogActions } from './features/catalog/CatalogBody';
import { FilterBar } from './features/catalog/FilterBar';
import { Hero } from './features/catalog/Hero';
import { ServiceDetail } from './features/guide/ServiceDetail';

type Props = {
  nav: ReturnType<typeof useNavigation>;
  guideNotes: ReturnType<typeof useGuideNotes>;
  catalog: Catalog;
  catalogView: ReturnType<typeof useCatalogView>;
  actions: CatalogActions;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  screenName: string;
  visibleSectionIds: readonly string[];
};

/** A área principal com o catálogo carregado: o detalhe de um serviço, ou banner + filtros + catálogo. */
export function MainContent({ nav, guideNotes, catalog, catalogView, actions, filters, onFiltersChange, screenName, visibleSectionIds }: Props) {
  const { detail } = nav;
  if (detail && !catalogView.searching) {
    return (
      <ServiceDetail
        key={detail.id}
        service={detail}
        note={guideNotes.notes[detail.id]}
        onSaveNote={(draft) => guideNotes.save(detail.id, draft)}
        onBack={nav.closeDetail}
      />
    );
  }

  const heroSlides = buildHeroSlides(
    visibleSectionIds.flatMap((id) => catalog.filter((c) => c.name === id)),
    actions.isGuideVisible,
    actions.onOpenGuide,
  );

  return (
    <>
      {!catalogView.searching && nav.activeView === HOME && <Hero slides={heroSlides} />}
      <FilterBar types={catalogView.filterTypes} topics={catalogView.filterTopics} filters={filters} onChange={onFiltersChange} />
      {(catalogView.searching || catalogView.filtering) && (
        <p className="results-count" role="status">
          {describeCount(countShown({ ...catalogView, activeView: nav.activeView }))}
        </p>
      )}
      <CatalogBody
        actions={actions}
        query={nav.query}
        searching={catalogView.searching}
        filtering={catalogView.filtering}
        activeView={nav.activeView}
        catalog={catalog}
        results={catalogView.results}
        filteredCatalog={catalogView.filteredCatalog}
        personalItems={catalogView.personalItems}
        personalShown={catalogView.personalShown}
        screenName={screenName}
        visibleSectionIds={visibleSectionIds}
      />
    </>
  );
}
