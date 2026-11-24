import type { ScreenNameRepository } from '../application/ports/ScreenNameRepository';

const KEY = 'cesar-hub:screen-name';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export class LocalStorageScreenNameRepository implements ScreenNameRepository {
  constructor(private readonly storage: () => StorageLike = () => localStorage) {}

  load(): string | null {
    try {
      return this.storage().getItem(KEY);
    } catch {
      return null;
    }
  }

  save(name: string): void {
    try {
      this.storage().setItem(KEY, name);
    } catch {
      // sem persistência: o nome vale só nesta sessão
    }
  }
}
