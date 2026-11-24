import type { CatalogActions } from '../features/catalog/CatalogBody';
import type { useCustomLinks } from './useCustomLinks';
import type { useFavorites } from './useFavorites';
import type { useLayout } from './useLayout';
import type { useLinkEditor } from './useLinkEditor';
import type { useNavigation } from './useNavigation';

type Sources = {
  favorites: ReturnType<typeof useFavorites>;
  customLinks: ReturnType<typeof useCustomLinks>;
  linkEditor: ReturnType<typeof useLinkEditor>;
  layout: ReturnType<typeof useLayout>;
  nav: ReturnType<typeof useNavigation>;
};

/** Liga o que os cards e as seções podem disparar aos hooks que sabem fazer cada coisa. */
export function useCatalogActions({ favorites, customLinks, linkEditor, layout, nav }: Sources): CatalogActions {
  return {
    favoriteIds: favorites.idSet,
    onToggleFavorite: favorites.toggle,
    managedIds: customLinks.ids,
    onEditItem: linkEditor.openEdit,
    onRemoveItem: linkEditor.requestRemove,
    isGuideVisible: layout.guideVisible,
    onOpenGuide: nav.openGuideArea,
    onSelectTab: nav.selectTab,
    onCustomize: nav.openCustomize,
  };
}
