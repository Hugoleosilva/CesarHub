import { DEFAULT_LAYOUT, PERSONAL_SECTION, isGuideVisible, moveSection, resolveLayout, toggleHidden } from './layout';

const available = [PERSONAL_SECTION, 'Pessoas', 'Solicitações', 'Ferramentas'];

describe('resolveLayout', () => {
  it('usa a ordem padrão quando não há preferência', () => {
    expect(resolveLayout(DEFAULT_LAYOUT, available).map((s) => s.id)).toEqual(available);
    expect(resolveLayout(DEFAULT_LAYOUT, available).every((s) => s.visible)).toBe(true);
  });

  it('respeita ordem e ocultas salvas', () => {
    const sections = resolveLayout({ order: ['Ferramentas', 'Pessoas'], hidden: ['Pessoas'], hiddenGuides: [] }, available);
    expect(sections.map((s) => s.id)).toEqual(['Ferramentas', 'Pessoas', PERSONAL_SECTION, 'Solicitações']);
    expect(sections.find((s) => s.id === 'Pessoas')?.visible).toBe(false);
  });

  it('ignora áreas que sumiram e acrescenta as novas no fim', () => {
    const sections = resolveLayout({ order: ['Antiga', 'Solicitações'], hidden: [], hiddenGuides: [] }, available);
    expect(sections.map((s) => s.id)).toEqual(['Solicitações', PERSONAL_SECTION, 'Pessoas', 'Ferramentas']);
  });

  it('não duplica ids repetidos na preferência', () => {
    expect(resolveLayout({ order: ['Pessoas', 'Pessoas'], hidden: [], hiddenGuides: [] }, available)).toHaveLength(4);
  });
});

describe('moveSection', () => {
  it('troca com o vizinho sem mutar a lista', () => {
    const order = ['a', 'b', 'c'];
    expect(moveSection(order, 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveSection(order, 'b', 1)).toEqual(['a', 'c', 'b']);
    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('não move além das pontas nem ids inexistentes', () => {
    expect(moveSection(['a', 'b'], 'a', -1)).toEqual(['a', 'b']);
    expect(moveSection(['a', 'b'], 'b', 1)).toEqual(['a', 'b']);
    expect(moveSection(['a', 'b'], 'x', 1)).toEqual(['a', 'b']);
  });
});

describe('isGuideVisible', () => {
  it('mostra o card de Orientações por padrão e respeita as áreas em que foi removido', () => {
    expect(isGuideVisible(DEFAULT_LAYOUT, 'Pessoas')).toBe(true);
    const layout = { order: [], hidden: [], hiddenGuides: ['Pessoas'] };
    expect(isGuideVisible(layout, 'Pessoas')).toBe(false);
    expect(isGuideVisible(layout, 'Ferramentas')).toBe(true);
  });
});

describe('toggleHidden', () => {
  it('oculta e reexibe', () => {
    expect(toggleHidden([], 'a')).toEqual(['a']);
    expect(toggleHidden(['a'], 'a')).toEqual([]);
  });
});
