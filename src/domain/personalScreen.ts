export const DEFAULT_SCREEN_NAME = 'Minha Tela';
export const MAX_SCREEN_NAME = 30;

/** Nome da tela personalizada: vazio volta ao padrão e o tamanho é limitado. */
export function normalizeScreenName(raw: string | null | undefined): string {
  const name = (raw ?? '').trim().slice(0, MAX_SCREEN_NAME).trim();
  return name || DEFAULT_SCREEN_NAME;
}
