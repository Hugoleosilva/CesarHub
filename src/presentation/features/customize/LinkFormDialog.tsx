import { useState } from 'react';
import type { FormEvent } from 'react';
import { validateLinkDraft } from '../../../domain/customLinks';
import type { LinkDraft, LinkErrors } from '../../../domain/customLinks';
import { Modal } from '../../components/ui/Modal';
import { TextField } from '../../components/ui/TextField';

type Props = {
  initial?: LinkDraft;
  onSave: (draft: LinkDraft) => void;
  onCancel: () => void;
};

export function LinkFormDialog({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [errors, setErrors] = useState<LinkErrors>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateLinkDraft({ title, description, url });
    if (result.ok) onSave(result.value);
    else setErrors(result.errors);
  };

  return (
    <Modal title={initial ? 'Editar link' : 'Adicionar link'} onClose={onCancel}>
      <form className="dialog__form" onSubmit={submit} noValidate>
        <TextField label="Título" value={title} onChange={setTitle} error={errors.title} maxLength={60} autoFocus />
        <TextField label="Descrição (opcional)" value={description} onChange={setDescription} error={errors.description} maxLength={100} />
        <TextField label="Endereço (URL)" value={url} onChange={setUrl} error={errors.url} inputMode="url" placeholder="https://" />
        <div className="dialog__actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--accent">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}
