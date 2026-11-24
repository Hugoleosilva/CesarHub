import type { Theme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  onInstall?: () => void;
  onHelp: () => void;
};

/** Botões do canto direito do cabeçalho: ajuda, tema e instalar o app. */
export function HeaderActions({ theme, onToggleTheme, onInstall, onHelp }: Props) {
  return (
    <>
      <button type="button" className="icon-btn" aria-label="Ajuda" title="Como usar o CESAR Hub" onClick={onHelp}>
        ?
      </button>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      {onInstall && (
        <button type="button" className="btn btn--accent" onClick={onInstall}>
          Instalar App
        </button>
      )}
    </>
  );
}
