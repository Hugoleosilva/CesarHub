import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
};

/** Lista suspensa com caixas de marcar, no estilo dos filtros do KnowBe4. */
export function MultiSelect({ label, options, selected, onChange }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const toggle = (option: string) =>
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);

  const summary =
    selected.length === 0 ? 'Selecionar opções' : selected.length === 1 ? (selected[0] ?? '') : `${selected.length} selecionados`;

  return (
    <div
      ref={rootRef}
      className="multiselect"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation(); // fecha só a lista; não aciona o "Esc limpa a busca"
          setOpen(false);
        }
      }}
    >
      <span id={`${id}-label`} className="multiselect__label">
        {label}
      </span>
      <button
        type="button"
        className="multiselect__button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen((current) => !current)}
      >
        <span id={`${id}-value`}>{summary}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="multiselect__list" role="group" aria-labelledby={`${id}-label`}>
          {options.length === 0 ? (
            <p className="multiselect__empty">Sem opções.</p>
          ) : (
            options.map((option) => (
              <label key={option} className="multiselect__option">
                <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
                {option}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
