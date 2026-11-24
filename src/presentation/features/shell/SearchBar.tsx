import { useId, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import type { Service } from '../../../domain/service';

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly Service[];
  inputRef: RefObject<HTMLInputElement>;
};

export function SearchBar({ value, onChange, suggestions, inputRef }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const showList = open && suggestions.length > 0;

  const pick = (service: Service) => {
    onChange(service.title);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && showList) {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && showList) {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Enter' && showList && active >= 0) {
      event.preventDefault();
      const chosen = suggestions[active];
      if (chosen) pick(chosen);
    }
  };

  return (
    <div className="search" role="search">
      <input
        ref={inputRef}
        className="search__input"
        type="search"
        placeholder="Buscar serviços…"
        aria-label="Buscar serviços"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <span className="search__hints" aria-hidden="true">
        <kbd>/</kbd> buscar · <kbd>Esc</kbd> limpar
      </span>
      {showList && (
        <ul id={listId} className="search__list" role="listbox">
          {suggestions.map((service, index) => (
            <li
              key={service.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? 'is-active' : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(service);
              }}
            >
              {service.title}
              <span className="tag">{service.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
