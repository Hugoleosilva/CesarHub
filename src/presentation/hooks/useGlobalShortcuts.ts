import { useEffect } from 'react';
import type { RefObject } from 'react';

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || TYPING_TAGS.has(target.tagName));
}

/** "/" foca a busca; "Esc" limpa e devolve o foco à página. */
export function useGlobalShortcuts(inputRef: RefObject<HTMLInputElement>, onClear: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !isTyping(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === 'Escape') {
        onClear();
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inputRef, onClear]);
}
