import { useState } from 'react';
import { MAX_SCREEN_NAME } from '../../../domain/personalScreen';
import type { Catalog, Service } from '../../../domain/service';
import { AreasPicker, ExternalLinksPicker, ServicesPicker } from './CustomizeSections';
import type { SectionRow } from './CustomizeSections';
import { Modal } from '../../components/ui/Modal';

type Props = {
  sections: readonly SectionRow[];
  onToggleSection: (id: string) => void;
  onToggleGuide: (id: string) => void;
  onMoveSection: (id: string, direction: -1 | 1) => void;
  screenName: string;
  onRename: (name: string) => string;
  catalog: Catalog;
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  externalLinks: readonly Service[];
  onAddLink: () => void;
  onEditLink: (id: string) => void;
  onRemoveLink: (id: string) => void;
  onClose: () => void;
};

/** Monte sua tela: nomeie, marque serviços de qualquer área e inclua cursos e links externos. */
export function CustomizeDialog({ screenName, onRename, onClose, ...rest }: Props) {
  const [draftName, setDraftName] = useState(screenName);

  const commitName = () => setDraftName(onRename(draftName));
  const close = () => {
    commitName();
    onClose();
  };

  return (
    <Modal title="Personalizar minha tela" onClose={close} wide>
      <p className="dialog__hint">
        Escolha o que aparece logo no início: serviços do CESAR e também os seus cursos e sites externos.
      </p>

      <label className="field">
        Nome da sua tela
        <input
          value={draftName}
          maxLength={MAX_SCREEN_NAME}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === 'Enter' && commitName()}
        />
      </label>

      <div className="dialog__body">
        <AreasPicker
          sections={rest.sections}
          onToggleSection={rest.onToggleSection}
          onToggleGuide={rest.onToggleGuide}
          onMoveSection={rest.onMoveSection}
        />
        <ServicesPicker catalog={rest.catalog} selectedIds={rest.selectedIds} onToggle={rest.onToggle} />
        <ExternalLinksPicker links={rest.externalLinks} onAdd={rest.onAddLink} onEdit={rest.onEditLink} onRemove={rest.onRemoveLink} />
      </div>

      <div className="dialog__actions">
        <button type="button" className="btn btn--accent" onClick={close}>
          Concluir
        </button>
      </div>
    </Modal>
  );
}
