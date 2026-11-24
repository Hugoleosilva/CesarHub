import type { FavoritesRepository } from '../application/ports/FavoritesRepository';

const KEY = 'cesar-hub:favorites';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Falhas de storage (modo privado, cota cheia, JSON corrompido) nunca quebram o app. */
export class LocalStorageFavoritesRepository implements FavoritesRepository {
  constructor(private readonly storage: () => StorageLike = () => localStorage) {}

  load(): string[] {
    try {
      const parsed: unknown = JSON.parse(this.storage().getItem(KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  save(ids: readonly string[]): void {
    try {
      this.storage().setItem(KEY, JSON.stringify(ids));
    } catch {
      // sem persistência: os favoritos valem só até fechar a aba
    }
  }
}
