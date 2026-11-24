import type { Layout } from '../../domain/layout';

export interface LayoutRepository {
  load(): Layout;
  save(layout: Layout): void;
}
