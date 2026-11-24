import type { Catalog, Service } from '../../../domain/service';
import { PERSONAL, categoryTab, isCategoryTab } from '../../navigation';

type Shown = {
  searching: boolean;
  activeView: string;
  results: Catalog;
  filteredCatalog: Catalog;
  personalShown: readonly Service[];
};

const distinctCount = (services: readonly Service[]) => new Set(services.map((service) => service.id)).size;

/** Quantos serviços distintos a tela mostra agora, na busca, na tela personalizada, em uma área ou no início. */
export function countShown({ searching, activeView, results, filteredCatalog, personalShown }: Shown): number {
  if (searching) return distinctCount(results.flatMap((category) => category.items));
  if (activeView === PERSONAL) return distinctCount(personalShown);

  if (isCategoryTab(activeView)) {
    const area = filteredCatalog.find((category) => categoryTab(category.name) === activeView);
    return area ? distinctCount(area.items) : 0; // o filtro esvaziou a área
  }
  // Início: todas as fileiras visíveis, incluindo links externos da tela personalizada.
  return distinctCount([...filteredCatalog.flatMap((category) => category.items), ...personalShown]);
}

export const describeCount = (count: number) => (count === 1 ? '1 serviço encontrado' : `${count} serviços encontrados`);
