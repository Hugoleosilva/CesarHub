import { DEFAULT_SCREEN_NAME, MAX_SCREEN_NAME, normalizeScreenName } from './personalScreen';

describe('normalizeScreenName', () => {
  it('usa o padrão quando vazio ou ausente', () => {
    expect(normalizeScreenName('   ')).toBe(DEFAULT_SCREEN_NAME);
    expect(normalizeScreenName(null)).toBe(DEFAULT_SCREEN_NAME);
    expect(normalizeScreenName(undefined)).toBe(DEFAULT_SCREEN_NAME);
  });

  it('remove espaços e limita o tamanho', () => {
    expect(normalizeScreenName('  Meu dia a dia ')).toBe('Meu dia a dia');
    expect(normalizeScreenName('x'.repeat(100))).toHaveLength(MAX_SCREEN_NAME);
  });
});
