import { PERSONAL_SECTION } from '../domain/layout';
import type { Catalog, Service } from '../domain/service';
import type { useCustomLinks } from './hooks/useCustomLinks';
import type { useFavorites } from './hooks/useFavorites';
import type { useLayout } from './hooks/useLayout';
import type { useLinkEditor } from './hooks/useLinkEditor';
import type { useScreenName } from './hooks/useScreenName';
import { AreaGuideDialog } from './features/guide/AreaGuideDialog';
import { CustomizeDialog } from './features/customize/CustomizeDialog';
import { HelpDialog } from './features/shell/HelpDialog';
import { LinkFormDialog } from './features/customize/LinkFormDialog';

type Props = {
  catalog: Catalog;
  /** Área cujo resumo de Orientações está aberto, se houver. */
  guideArea: string | null;
  onOpenService: (service: Service) => void;
  onCloseGuideArea: () => void;
  customizing: boolean;
  onCloseCustomize: () => void;
  helping: boolean;
  onCloseHelp: () => void;
  layout: ReturnType<typeof useLayout>;
  screen: ReturnType<typeof useScreenName>;
  favorites: ReturnType<typeof useFavorites>;
  customLinks: ReturnType<typeof useCustomLinks>;
  linkEditor: ReturnType<typeof useLinkEditor>;
};

/** As janelas do app: resumo de Orientações da área, Personalizar e o formulário de link externo. */
export function AppDialogs(props: Props) {
  const { catalog, layout, screen, favorites, customLinks, linkEditor } = props;
  const areaCategory = props.guideArea ? catalog.find((c) => c.name === props.guideArea) : undefined;
  const editing = linkEditor.current;

  return (
    <>
      {areaCategory && <AreaGuideDialog category={areaCategory} onOpenService={props.onOpenService} onClose={props.onCloseGuideArea} />}
      {props.customizing && (
        <CustomizeDialog
          sections={layout.sections.map((section) => ({
            ...section,
            label: section.id === PERSONAL_SECTION ? screen.name : section.id,
            guide: section.id === PERSONAL_SECTION ? undefined : layout.guideVisible(section.id),
          }))}
          onToggleGuide={layout.toggleGuide}
          onToggleSection={layout.toggle}
          onMoveSection={layout.move}
          screenName={screen.name}
          onRename={screen.rename}
          catalog={catalog}
          selectedIds={favorites.idSet}
          onToggle={favorites.toggle}
          externalLinks={customLinks.services}
          onAddLink={linkEditor.openNew}
          onEditLink={linkEditor.openEdit}
          onRemoveLink={linkEditor.requestRemove}
          onClose={props.onCloseCustomize}
        />
      )}
      {props.helping && <HelpDialog onClose={props.onCloseHelp} />}
      {linkEditor.isOpen && (
        <LinkFormDialog
          key={editing?.id ?? 'new'}
          initial={editing && { title: editing.title, description: editing.description, url: editing.url }}
          onSave={linkEditor.save}
          onCancel={linkEditor.close}
        />
      )}
    </>
  );
}
