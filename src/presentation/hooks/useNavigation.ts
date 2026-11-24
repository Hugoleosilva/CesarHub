import { useCallback, useRef, useState } from 'react';
import type { Service } from '../../domain/service';
import { HOME, sectionTab } from '../navigation';
import type { Tab } from '../navigation';
import { useGlobalShortcuts } from './useGlobalShortcuts';

type Section = { id: string };

/**
 * Onde o usuário está: aba ativa, busca, resumo de área e detalhe de serviço abertos, e a janela de personalização.
 * `labelOf` dá o nome da aba de cada seção visível (a tela personalizada pode ter sido renomeada).
 */
export function useNavigation(visibleSections: readonly Section[], labelOf: (sectionId: string) => string) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState(HOME);
  const [detail, setDetail] = useState<Service | null>(null);
  const [guideArea, setGuideArea] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [helping, setHelping] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const clearQuery = useCallback(() => setQuery(''), []);
  useGlobalShortcuts(searchRef, clearQuery);

  const tabs: Tab[] = [
    { id: HOME, label: 'Início' },
    ...visibleSections.map((section) => ({ id: sectionTab(section.id), label: labelOf(section.id) })),
  ];
  // Se a área aberta foi ocultada, volta ao início.
  const activeView = tabs.some((tab) => tab.id === view) ? view : HOME;

  const selectTab = (id: string) => {
    setQuery('');
    setDetail(null);
    setView(id);
  };
  /** Do resumo da área para a tela de detalhe do serviço. */
  const openDetail = (service: Service) => {
    setGuideArea(null);
    setDetail(service);
  };

  return {
    query,
    setQuery,
    searchRef,
    tabs,
    activeView,
    selectTab,
    detail,
    openDetail,
    closeDetail: () => setDetail(null),
    guideArea,
    openGuideArea: setGuideArea,
    closeGuideArea: () => setGuideArea(null),
    customizing,
    openCustomize: () => setCustomizing(true),
    closeCustomize: () => setCustomizing(false),
    helping,
    openHelp: () => setHelping(true),
    closeHelp: () => setHelping(false),
  };
}
