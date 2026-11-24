import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Foca o diálogo ao abrir (para o Esc fechar mesmo sem clicar dentro), a menos que um campo dele já
 * tenha o foco, e devolve o foco a quem o abriu ao fechar (para o Esc seguir funcionando no diálogo de baixo).
 */
export function useDialogFocus(ref: RefObject<HTMLElement>) {
  const opener = useRef(document.activeElement); // lido na primeira renderização, antes de o foco mudar

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
    const previous = opener.current;
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [ref]);
}
