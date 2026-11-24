import type { CustomLink } from '../../domain/customLinks';

export interface CustomLinksRepository {
  load(): CustomLink[];
  save(links: readonly CustomLink[]): void;
}
