import { useState } from 'react';
import type { FormEvent } from 'react';
import { MAX_NOTE, validateNoteDraft } from '../../../domain/guideNotes';
import type { GuideNote, NoteDraft, NoteErrors } from '../../../domain/guideNotes';
import { TextField } from '../../components/ui/TextField';

type Props = {
  note?: GuideNote;
  onSave: (draft: NoteDraft) => void;
};

/** Anotações pessoais do usuário sobre um serviço; ficam salvas só neste navegador. */
export function NotesSection({ note, onSave }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="guide__section">
      <h3>Minhas anotações</h3>
      {editing ? (
        <NoteForm
          initial={note}
          onSave={(draft) => {
            onSave(draft);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          {note?.note && <p className="guide__note">{note.note}</p>}
          {note?.link && (
            <a className="btn btn--small guide__note-link" href={note.link} target="_blank" rel="noopener noreferrer">
              Abrir minha página de orientação
            </a>
          )}
          {!note && <p className="dialog__hint">Escreva um lembrete ou cole o link de uma página que oriente este serviço. Fica salvo só neste navegador.</p>}
          <button type="button" className="btn btn--small guide__edit" onClick={() => setEditing(true)}>
            {note ? 'Editar minhas anotações' : 'Adicionar minhas anotações'}
          </button>
        </>
      )}
    </section>
  );
}

type FormProps = { initial?: GuideNote; onSave: (draft: NoteDraft) => void; onCancel: () => void };

function NoteForm({ initial, onSave, onCancel }: FormProps) {
  const [text, setText] = useState(initial?.note ?? '');
  const [link, setLink] = useState(initial?.link ?? '');
  const [errors, setErrors] = useState<NoteErrors>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateNoteDraft({ note: text, link });
    if (result.ok) onSave(result.value);
    else setErrors(result.errors);
  };

  return (
    <form className="guide__form" onSubmit={submit} noValidate>
      <TextField label="Suas anotações" value={text} onChange={setText} error={errors.note} rows={4} maxLength={MAX_NOTE + 200} />
      <TextField label="Link da página de orientação (opcional)" value={link} onChange={setLink} error={errors.link} inputMode="url" placeholder="https://" />
      <div className="dialog__actions">
        <button type="button" className="btn btn--small" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--small btn--accent">
          Salvar anotações
        </button>
      </div>
    </form>
  );
}
