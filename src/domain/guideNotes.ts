import { normalizeHttpUrl } from './customLinks';

/** Anotações pessoais sobre um serviço: texto livre e/ou link de uma página de orientação. */
export type GuideNote = { readonly note: string; readonly link: string };
export type GuideNotes = Readonly<Record<string, GuideNote>>;

export type NoteDraft = { note: string; link: string };
export type NoteErrors = { note?: string; link?: string };
export type NoteValidation = { ok: true; value: NoteDraft } | { ok: false; errors: NoteErrors };

export const MAX_NOTE = 1000;

export function validateNoteDraft(draft: NoteDraft): NoteValidation {
  const errors: NoteErrors = {};
  const note = draft.note.trim();
  const rawLink = draft.link.trim();

  if (note.length > MAX_NOTE) errors.note = `Use no máximo ${MAX_NOTE} caracteres.`;

  let link = '';
  if (rawLink) {
    const normalized = normalizeHttpUrl(rawLink);
    if (normalized) link = normalized;
    else errors.link = 'Endereço inválido. Ex.: https://wiki.empresa.com/pagina';
  }

  return errors.note || errors.link ? { ok: false, errors } : { ok: true, value: { note, link } };
}

export const isEmptyNote = (draft: NoteDraft): boolean => !draft.note && !draft.link;

/** Guarda a anotação do serviço; uma anotação vazia remove a entrada. */
export function setNote(notes: GuideNotes, serviceId: string, draft: NoteDraft): GuideNotes {
  const next: Record<string, GuideNote> = { ...notes };
  if (isEmptyNote(draft)) delete next[serviceId];
  else next[serviceId] = draft;
  return next;
}
