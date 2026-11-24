import { useCallback, useMemo, useState } from 'react';
import type { LayoutRepository } from '../../application/ports/LayoutRepository';
import { isGuideVisible, moveSection, resolveLayout, toggleHidden } from '../../domain/layout';
import type { Layout } from '../../domain/layout';

/** `availableIds` precisa ser estável (useMemo) para não recalcular a cada render. */
export function useLayout(repository: LayoutRepository, availableIds: readonly string[]) {
  const [layout, setLayout] = useState<Layout>(() => repository.load());
  const sections = useMemo(() => resolveLayout(layout, availableIds), [layout, availableIds]);

  const commit = useCallback(
    (next: Layout) => {
      setLayout(next);
      repository.save(next);
    },
    [repository],
  );

  const move = useCallback(
    (id: string, direction: -1 | 1) =>
      commit({ ...layout, order: moveSection(sections.map((s) => s.id), id, direction) }),
    [commit, layout, sections],
  );

  const toggle = useCallback(
    (id: string) => commit({ ...layout, order: sections.map((s) => s.id), hidden: toggleHidden(layout.hidden, id) }),
    [commit, layout, sections],
  );

  /** O card de Orientações da área: visível por padrão, removível por área. */
  const guideVisible = useCallback((areaId: string) => isGuideVisible(layout, areaId), [layout]);
  const toggleGuide = useCallback(
    (areaId: string) => commit({ ...layout, hiddenGuides: toggleHidden(layout.hiddenGuides, areaId) }),
    [commit, layout],
  );

  return { sections, move, toggle, guideVisible, toggleGuide };
}
