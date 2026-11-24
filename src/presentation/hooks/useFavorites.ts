import { useCallback, useMemo, useState } from 'react';
import type { FavoritesRepository } from '../../application/ports/FavoritesRepository';
import { toggleFavorite } from '../../domain/favorites';

export function useFavorites(repository: FavoritesRepository) {
  const [ids, setIds] = useState<string[]>(() => repository.load());

  const toggle = useCallback(
    (id: string) =>
      setIds((current) => {
        const next = toggleFavorite(current, id);
        repository.save(next);
        return next;
      }),
    [repository],
  );

  const idSet = useMemo(() => new Set(ids), [ids]);
  return { ids, idSet, toggle };
}
