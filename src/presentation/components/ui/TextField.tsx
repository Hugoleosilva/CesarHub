import { useId } from 'react';
import type { ChangeEvent } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  inputMode?: 'url';
  autoFocus?: boolean;
  /** Com `rows`, o campo vira uma área de texto. */
  rows?: number;
};

/** Campo com rótulo e mensagem de erro ligada ao campo (o erro fica fora do `<label>`). */
export function TextField({ label, value, onChange, error, rows, ...attributes }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const shared = {
    id,
    value,
    ...attributes,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {rows ? <textarea rows={rows} {...shared} /> : <input {...shared} />}
      {error && (
        <span id={errorId} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}
