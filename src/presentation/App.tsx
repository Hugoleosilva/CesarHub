import { useMemo, useState } from 'react';
import type { CustomLinksRepository } from '../application/ports/CustomLinksRepository';
import type { FavoritesRepository } from '../application/ports/FavoritesRepository';
import type { GuideNotesRepository } from '../application/ports/GuideNotesRepository';
import type { LayoutRepository } from '../application/ports/LayoutRepository';
import type { ScreenNameRepository } from '../application/ports/ScreenNameRepository';
import type { GetCatalog } from '../application/useCases/getCatalog';
import { NO_FILTERS } from '../domain/filters';
import type { Filters } from '../domain/filters';
import { PERSONAL_SECTION } from '../domain/layout';
import { AppDialogs } from './AppDialogs';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Header } from './features/shell/Header';
import { HeaderActions } from './features/shell/HeaderActions';
import { MainContent } from './MainContent';
import { NavTabs } from './features/shell/NavTabs';
import { SearchBar } from './features/shell/SearchBar';
import { ErrorState, LoadingState } from './components/ui/States';
import { useCatalog } from './hooks/useCatalog';
import { useCatalogActions } from './hooks/useCatalogActions';
import { useCatalogView } from './hooks/useCatalogView';
import { useCustomLinks } from './hooks/useCustomLinks';
import { useFavorites } from './hooks/useFavorites';
import { useGuideNotes } from './hooks/useGuideNotes';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useLayout } from './hooks/useLayout';
import { useLinkEditor } from './hooks/useLinkEditor';
import { useNavigation } from './hooks/useNavigation';
import { useScreenName } from './hooks/useScreenName';
import { useTheme } from './hooks/useTheme';

type Props = {
  getCatalog: GetCatalog;
  favoritesRepository: FavoritesRepository;
  customLinksRepository: CustomLinksRepository;
  screenNameRepository: ScreenNameRepository;
  layoutRepository: LayoutRepository;
  guideNotesRepository: GuideNotesRepository;
};

/** Raiz da interface: liga os repositórios aos hooks e distribui o estado para o cabeçalho, o conteúdo e as janelas. */
export function App({
  getCatalog,
  favoritesRepository,
  customLinksRepository,
  screenNameRepository,
  layoutRepository,
  guideNotesRepository,
}: Props) {
  const { state, retry } = useCatalog(getCatalog);
  const { canInstall, install } = useInstallPrompt();
  const { theme, toggle: toggleTheme } = useTheme();
  const favorites = useFavorites(favoritesRepository);
  const customLinks = useCustomLinks(customLinksRepository);
  const linkEditor = useLinkEditor(customLinks);
  const screen = useScreenName(screenNameRepository);
  const guideNotes = useGuideNotes(guideNotesRepository);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const catalog = useMemo(() => (state.status === 'ready' ? state.catalog : []), [state]);
  const availableIds = useMemo(() => [PERSONAL_SECTION, ...catalog.map((c) => c.name)], [catalog]);
  const layout = useLayout(layoutRepository, availableIds);
  const visibleSections = layout.sections.filter((s) => s.visible);
  const nav = useNavigation(visibleSections, (id) => (id === PERSONAL_SECTION ? screen.name : id));

  const actions = useCatalogActions({ favorites, customLinks, linkEditor, layout, nav });
  const catalogView = useCatalogView({ catalog, externalLinks: customLinks.services, favoriteIds: favorites.ids, query: nav.query, filters });

  return (
    <ErrorBoundary>
      <Header
        nav={<NavTabs tabs={nav.tabs} activeId={catalogView.searching ? null : nav.activeView} onSelect={nav.selectTab} />}
        search={<SearchBar value={nav.query} onChange={nav.setQuery} suggestions={catalogView.suggestions} inputRef={nav.searchRef} />}
        actions={
          <HeaderActions
            theme={theme}
            onToggleTheme={toggleTheme}
            onHelp={nav.openHelp}
            onInstall={canInstall ? install : undefined}
          />
        }
      />
      <main className="main">
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState error={state.error} onRetry={retry} />}
        {state.status === 'ready' && (
          <MainContent
            nav={nav}
            guideNotes={guideNotes}
            catalog={catalog}
            catalogView={catalogView}
            filters={filters}
            onFiltersChange={setFilters}
            screenName={screen.name}
            visibleSectionIds={visibleSections.map((s) => s.id)}
            actions={actions}
          />
        )}
      </main>
      <AppDialogs
        catalog={catalog}
        guideArea={nav.guideArea}
        onOpenService={nav.openDetail}
        onCloseGuideArea={nav.closeGuideArea}
        customizing={nav.customizing}
        onCloseCustomize={nav.closeCustomize}
        helping={nav.helping}
        onCloseHelp={nav.closeHelp}
        layout={layout}
        screen={screen}
        favorites={favorites}
        customLinks={customLinks}
        linkEditor={linkEditor}
      />
    </ErrorBoundary>
  );
}
