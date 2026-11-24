import type { LayoutRepository } from '../application/ports/LayoutRepository';
import { DEFAULT_LAYOUT } from '../domain/layout';
import type { Layout } from '../domain/layout';

const KEY = 'cesar-hub:layout';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export class LocalStorageLayoutRepository implements LayoutRepository {
  constructor(private readonly storage: () => StorageLike = () => localStorage) {}

  load(): Layout {
    try {
      const parsed: unknown = JSON.parse(this.storage().getItem(KEY) ?? 'null');
      if (typeof parsed !== 'object' || parsed === null) return DEFAULT_LAYOUT;
      const { order, hidden, hiddenGuides } = parsed as Record<string, unknown>;
      return { order: strings(order), hidden: strings(hidden), hiddenGuides: strings(hiddenGuides) };
    } catch {
      return DEFAULT_LAYOUT;
    }
  }

  save(layout: Layout): void {
    try {
      this.storage().setItem(KEY, JSON.stringify(layout));
    } catch {
      // sem persistência: a ordem vale só nesta sessão
    }
  }
}
