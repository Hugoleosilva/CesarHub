import { useCallback, useState } from 'react';
import type { ScreenNameRepository } from '../../application/ports/ScreenNameRepository';
import { normalizeScreenName } from '../../domain/personalScreen';

export function useScreenName(repository: ScreenNameRepository) {
  const [name, setName] = useState(() => normalizeScreenName(repository.load()));

  const rename = useCallback(
    (raw: string) => {
      const next = normalizeScreenName(raw);
      setName(next);
      repository.save(next);
      return next;
    },
    [repository],
  );

  return { name, rename };
}
