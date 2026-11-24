import type { GuideNotes } from '../../domain/guideNotes';

export interface GuideNotesRepository {
  load(): GuideNotes;
  save(notes: GuideNotes): void;
}
