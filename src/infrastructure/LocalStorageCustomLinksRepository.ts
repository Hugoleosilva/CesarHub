import type { CustomLinksRepository } from '../application/ports/CustomLinksRepository';
import { validateLinkDraft } from '../domain/customLinks';
import type { CustomLink } from '../domain/customLinks';

const KEY = 'cesar-hub:custom-links';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Dados do storage podem ter sido editados à mão: cada item é revalidado ao carregar. */
export class LocalStorageCustomLinksRepository implements CustomLinksRepository {
  constructor(private readonly storage: () => StorageLike = () => localStorage) {}

  load(): CustomLink[] {
    try {
      const parsed: unknown = JSON.parse(this.storage().getItem(KEY) ?? '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item: unknown): CustomLink[] => {
        if (typeof item !== 'object' || item === null) return [];
        const { id, title, description, url } = item as Record<string, unknown>;
        if (typeof id !== 'string' || typeof title !== 'string' || typeof url !== 'string') return [];
        // links salvos antes de existir descrição não têm o campo
        const result = validateLinkDraft({ title, description: typeof description === 'string' ? description : '', url });
        return result.ok ? [{ id, ...result.value }] : [];
      });
    } catch {
      return [];
    }
  }

  save(links: readonly CustomLink[]): void {
    try {
      this.storage().setItem(KEY, JSON.stringify(links));
    } catch {
      // sem persistência: os links valem só até fechar a aba
    }
  }
}
