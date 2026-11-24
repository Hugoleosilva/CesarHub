import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const KEY = 'cesar-hub:theme';
const BAR_COLOR: Record<Theme, string> = { dark: '#0e1116', light: '#ff6a13' };

function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Dark é o padrão; a escolha do usuário fica salva no navegador. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOR[theme]);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // sem persistência: vale só nesta sessão
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
