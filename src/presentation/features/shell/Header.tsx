import type { ReactNode } from 'react';

type Props = { nav: ReactNode; search: ReactNode; actions: ReactNode };

export function Header({ nav, search, actions }: Props) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="brand">
          <img src="/icons/icon.svg" alt="" width={28} height={28} />
          <span className="brand__name">
            CESAR <strong>HUB</strong>
          </span>
        </div>
        {nav}
        {search}
        <div className="header__actions">{actions}</div>
      </div>
    </header>
  );
}
