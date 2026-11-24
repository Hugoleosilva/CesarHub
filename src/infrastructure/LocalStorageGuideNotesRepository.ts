import type { GuideNotesRepository } from '../application/ports/GuideNotesRepository';
import { isEmptyNote, validateNoteDraft } from '../domain/guideNotes';
import type { GuideNote, GuideNotes } from '../domain/guideNotes';

const KEY = 'cesar-hub:guide-notes';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Aceita só anotações bem formadas e válidas; qualquer outra coisa no storage é descartada. */
function parseNote(value: unknown): GuideNote | undefined {
  if (!isRecord(value) || typeof value.note !== 'string' || typeof value.link !== 'string') return undefined;
  const result = validateNoteDraft({ note: value.note, link: value.link });
  return result.ok && !isEmptyNote(result.value) ? result.value : undefined;
}

/** Dados do storage podem ter sido editados à mão: cada anotação é revalidada ao carregar. */
export class LocalStorageGuideNotesRepository implements GuideNotesRepository {
  constructor(private readonly storage: () => StorageLike = () => localStorage) {}

  load(): GuideNotes {
    try {
      const parsed: unknown = JSON.parse(this.storage().getItem(KEY) ?? '{}');
      if (!isRecord(parsed)) return {};
      const notes: Record<string, GuideNote> = {};
      for (const [id, value] of Object.entries(parsed)) {
        const note = parseNote(value);
        if (note) notes[id] = note;
      }
      return notes;
    } catch {
      return {};
    }
  }

  save(notes: GuideNotes): void {
    try {
      this.storage().setItem(KEY, JSON.stringify(notes));
    } catch {
      // sem persistência: as anotações valem só até fechar a aba
    }
  }
}
