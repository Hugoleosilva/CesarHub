import { useCallback, useState } from 'react';
import type { GuideNotesRepository } from '../../application/ports/GuideNotesRepository';
import { setNote } from '../../domain/guideNotes';
import type { GuideNotes, NoteDraft } from '../../domain/guideNotes';

/** Recebe rascunhos já validados pelo domínio (ver GuideDialog). */
export function useGuideNotes(repository: GuideNotesRepository) {
  const [notes, setNotes] = useState<GuideNotes>(() => repository.load());

  const save = useCallback(
    (serviceId: string, draft: NoteDraft) =>
      setNotes((current) => {
        const next = setNote(current, serviceId, draft);
        repository.save(next);
        return next;
      }),
    [repository],
  );

  return { notes, save };
}
