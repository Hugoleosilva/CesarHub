import type { Category } from '../../../domain/service';
import { buildHeroSlides } from './heroSlides';

const area = (name: string, guideImage?: string): Category => ({ name, items: [], guideImage });

describe('buildHeroSlides', () => {
  const areas = [area('Pessoas', '/covers/p.svg'), area('Ferramentas')];

  it('cria um slide de Orientações por área, na ordem recebida', () => {
    const slides = buildHeroSlides(areas, () => true, () => {});
    expect(slides.map((s) => s.title)).toEqual(['Orientações de Pessoas', 'Orientações de Ferramentas']);
    expect(slides[0]?.image).toBe('/covers/p.svg');
  });

  it('usa uma capa gerada quando a área não tem imagem de Orientações', () => {
    const [, ferramentas] = buildHeroSlides(areas, () => true, () => {});
    expect(ferramentas?.image).toMatch(/^data:image\/svg\+xml/);
  });

  it('omite as áreas cujo card de Orientações foi removido', () => {
    const slides = buildHeroSlides(areas, (name) => name !== 'Pessoas', () => {});
    expect(slides.map((s) => s.id)).toEqual(['Ferramentas']);
  });

  it('o botão abre as orientações da própria área', () => {
    const opened: string[] = [];
    const [first] = buildHeroSlides(areas, () => true, (name) => opened.push(name));
    if (first?.action && 'onClick' in first.action) first.action.onClick();
    expect(opened).toEqual(['Pessoas']);
  });
});
