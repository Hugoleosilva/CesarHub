import { PERSONAL_SECTION } from '../domain/layout';

/** Uma aba do menu principal. */
export type Tab = { id: string; label: string };

/** Identificadores das abas do menu: início, tela personalizada e uma por área do catálogo. */
export const HOME = 'home';
export const PERSONAL = 'personal';

export const categoryTab = (name: string) => `cat:${name}`;

export const isCategoryTab = (tabId: string) => tabId.startsWith('cat:');

/** Aba que corresponde a uma seção do layout (a personalizada ou uma área). */
export const sectionTab = (sectionId: string) => (sectionId === PERSONAL_SECTION ? PERSONAL : categoryTab(sectionId));
