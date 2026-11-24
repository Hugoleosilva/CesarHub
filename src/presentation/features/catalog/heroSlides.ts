import { coverFor } from '../../../domain/customLinks';
import type { Category } from '../../../domain/service';
import type { HeroSlide } from './Hero';

/** O banner gira entre as Orientações das áreas visíveis, na ordem escolhida pelo usuário. */
export function buildHeroSlides(
  areas: Category[],
  isGuideVisible: (area: string) => boolean,
  onOpenGuide: (area: string) => void,
): HeroSlide[] {
  return areas
    .filter((category) => isGuideVisible(category.name))
    .map((category) => ({
      id: category.name,
      tag: 'Guia',
      title: `Orientações de ${category.name}`,
      description: `Como fazer, onde acessar e a quem procurar em ${category.name}.`,
      image: category.guideImage ?? coverFor(category.name),
      action: { label: 'Ver orientações', onClick: () => onOpenGuide(category.name) },
    }));
}
