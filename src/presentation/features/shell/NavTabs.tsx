import type { Tab } from '../../navigation';

type Props = {
  tabs: readonly Tab[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function NavTabs({ tabs, activeId, onSelect }: Props) {
  return (
    <nav className="tabs" aria-label="Áreas">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === activeId ? 'tabs__item is-active' : 'tabs__item'}
          aria-current={tab.id === activeId ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
