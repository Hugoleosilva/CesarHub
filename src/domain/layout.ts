/** Identifica a tela personalizada do usuário entre as áreas (as demais usam o nome da categoria). */
export const PERSONAL_SECTION = '__personal__';

/**
 * Preferência do usuário: ordem das áreas, quais estão ocultas e em quais áreas
 * o card de Orientações foi removido (por padrão, toda área mostra o seu).
 */
export type Layout = { order: string[]; hidden: string[]; hiddenGuides: string[] };

export type Section = { id: string; visible: boolean };

export const DEFAULT_LAYOUT: Layout = { order: [], hidden: [], hiddenGuides: [] };

export const isGuideVisible = (layout: Layout, areaId: string): boolean => !layout.hiddenGuides.includes(areaId);

/**
 * Junta a preferência salva com as áreas que existem hoje:
 * descarta ids que sumiram do catálogo e põe áreas novas no fim, visíveis.
 */
export function resolveLayout(layout: Layout, available: readonly string[]): Section[] {
  const known = new Set(available);
  const ordered = [...new Set(layout.order)].filter((id) => known.has(id));
  const rest = available.filter((id) => !ordered.includes(id));
  return [...ordered, ...rest].map((id) => ({ id, visible: !layout.hidden.includes(id) }));
}

export function moveSection(order: readonly string[], id: string, direction: -1 | 1): string[] {
  const from = order.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return [...order];
  const next = [...order];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

export function toggleHidden(hidden: readonly string[], id: string): string[] {
  return hidden.includes(id) ? hidden.filter((current) => current !== id) : [...hidden, id];
}
