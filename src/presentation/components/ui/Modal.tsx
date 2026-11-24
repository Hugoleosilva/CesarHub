import { useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useDialogFocus } from '../../hooks/useDialogFocus';

type Props = {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
};

/** Janela modal acessível: fecha com Esc ou clique no fundo, prende o foco ao abrir e o devolve ao fechar. */
export function Modal({ title, onClose, wide = false, children }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(dialogRef);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation(); // não aciona o "Esc limpa a busca"
      onClose();
    }
  };

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={wide ? 'dialog dialog--wide' : 'dialog'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
