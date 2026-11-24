import { PERSONAL_SECTION } from '../../../domain/layout';
import type { Catalog, Category, Service } from '../../../domain/service';
import { HOME, PERSONAL, categoryTab, sectionTab } from '../../navigation';
import { CategorySection } from './CategorySection';
import { GuideCard } from './GuideCard';
import { EmptyState, PersonalEmptyState } from '../../components/ui/States';

/** Tudo o que os cards e as seções podem disparar; o App decide o que cada ação faz. */
export type CatalogActions = {
  favoriteIds: ReadonlySet<string>;
  onToggleFavorite: (id: string) => void;
  /** Ids dos links externos do usuário, que podem ser editados e removidos direto no card. */
  managedIds: ReadonlySet<string>;
  onEditItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  isGuideVisible: (area: string) => boolean;
  onOpenGuide: (area: string) => void;
  onSelectTab: (tabId: string) => void;
  onCustomize: () => void;
};

type Props = {
  actions: CatalogActions;
  searching: boolean;
  query: string;
  /** Com filtro ativo os cards de Orientações somem: não são serviços e não têm tipo nem tópico. */
  filtering: boolean;
  activeView: string;
  catalog: Catalog;
  results: Catalog;
  filteredCatalog: Catalog;
  personalItems: readonly Service[];
  personalShown: readonly Service[];
  screenName: string;
  visibleSectionIds: readonly string[];
};

type SectionProps = {
  category: Category;
  variant: 'row' | 'grid';
  actions: CatalogActions;
  onSeeAll?: () => void;
  onBack?: () => void;
  /** Áreas oficiais começam com o card de Orientações (se o usuário não o removeu em Personalizar). */
  withGuide?: boolean;
};

function Section({ category, variant, actions, onSeeAll, onBack, withGuide = false }: SectionProps) {
  const showGuide = withGuide && actions.isGuideVisible(category.name);
  return (
    <CategorySection
      category={category}
      variant={variant}
      favoriteIds={actions.favoriteIds}
      onToggleFavorite={actions.onToggleFavorite}
      onSeeAll={onSeeAll}
      onBack={onBack}
      managedIds={actions.managedIds}
      onEditItem={actions.onEditItem}
      onRemoveItem={actions.onRemoveItem}
      leading={
        showGuide ? <GuideCard key="guide" area={category.name} image={category.guideImage} onOpen={() => actions.onOpenGuide(category.name)} /> : undefined
      }
    />
  );
}

/** O que aparece abaixo dos filtros: resultados da busca, a tela personalizada, uma área ou as fileiras do início. */
export function CatalogBody(props: Props) {
  const { actions, searching, query, filtering, activeView } = props;

  if (searching) {
    if (props.results.length === 0) return <EmptyState query={query} filtered={filtering} />;
    return <>{props.results.map((category) => <Section key={category.name} category={category} variant="grid" actions={actions} />)}</>;
  }
  if (activeView === PERSONAL) return <PersonalView {...props} />;
  if (props.catalog.some((category) => categoryTab(category.name) === activeView)) return <AreaView {...props} />;
  return <HomeRows {...props} />;
}

function PersonalView({ actions, personalItems, personalShown, screenName }: Props) {
  if (personalItems.length === 0) return <PersonalEmptyState screenName={screenName} onCustomize={actions.onCustomize} />;
  return (
    <>
      <div className="personal-bar">
        <button type="button" className="btn btn--header" onClick={actions.onCustomize}>
          Personalizar
        </button>
      </div>
      {personalShown.length === 0 ? (
        <EmptyState query="" filtered />
      ) : (
        <Section category={{ name: screenName, items: [...personalShown] }} variant="grid" actions={actions} onBack={() => actions.onSelectTab(HOME)} />
      )}
    </>
  );
}

function AreaView({ actions, filteredCatalog, activeView, filtering }: Props) {
  const selected = filteredCatalog.find((category) => categoryTab(category.name) === activeView);
  if (!selected) return <EmptyState query="" filtered />;
  return <Section category={selected} variant="grid" actions={actions} withGuide={!filtering} onBack={() => actions.onSelectTab(HOME)} />;
}

function HomeRows({ actions, filteredCatalog, personalShown, screenName, visibleSectionIds, filtering }: Props) {
  if (visibleSectionIds.length === 0) {
    return (
      <div className="state" role="status">
        <h2>Nenhuma área na tela</h2>
        <p>Abra “Minha Tela” e use “Personalizar” para escolher quais áreas aparecem aqui.</p>
      </div>
    );
  }

  const rows = visibleSectionIds.map((id) => {
    const onSeeAll = () => actions.onSelectTab(sectionTab(id));
    if (id === PERSONAL_SECTION) {
      if (personalShown.length === 0) return null;
      return <Section key={id} category={{ name: screenName, items: [...personalShown] }} variant="row" actions={actions} onSeeAll={onSeeAll} />;
    }
    const category = filteredCatalog.find((c) => c.name === id);
    return category ? <Section key={id} category={category} variant="row" actions={actions} onSeeAll={onSeeAll} withGuide={!filtering} /> : null;
  });
  return rows.some(Boolean) ? <>{rows}</> : <EmptyState query="" filtered />;
}
