import { useState } from 'react';
import type { LinkDraft } from '../../domain/customLinks';
import type { useCustomLinks } from './useCustomLinks';

type Editing = { mode: 'new' } | { mode: 'edit'; id: string } | null;

/** Controla o formulário de link externo: aberto para um link novo, aberto para editar um existente, ou fechado. */
export function useLinkEditor(customLinks: ReturnType<typeof useCustomLinks>) {
  const [editing, setEditing] = useState<Editing>(null);

  const save = (draft: LinkDraft) => {
    if (editing?.mode === 'edit') customLinks.update(editing.id, draft);
    else customLinks.add(draft);
    setEditing(null);
  };

  /** Remover é definitivo: pede confirmação antes. */
  const requestRemove = (id: string) => {
    const link = customLinks.links.find((item) => item.id === id);
    if (link && window.confirm(`Remover o link "${link.title}"?`)) customLinks.remove(id);
  };

  return {
    isOpen: editing !== null,
    /** O link em edição, ou `undefined` ao criar um novo. */
    current: editing?.mode === 'edit' ? customLinks.links.find((link) => link.id === editing.id) : undefined,
    openNew: () => setEditing({ mode: 'new' }),
    openEdit: (id: string) => setEditing({ mode: 'edit', id }),
    close: () => setEditing(null),
    save,
    requestRemove,
  };
}
