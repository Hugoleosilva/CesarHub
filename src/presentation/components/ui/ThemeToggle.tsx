import type { Theme } from '../../hooks/useTheme';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const next = theme === 'dark' ? 'claro' : 'escuro';
  return (
    <button type="button" className="icon-btn" onClick={onToggle} aria-label={`Mudar para tema ${next}`} title={`Tema ${next}`}>
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
