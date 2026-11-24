import { MAX_NOTE, setNote, validateNoteDraft } from './guideNotes';

describe('validateNoteDraft', () => {
  it('normaliza texto e link', () => {
    expect(validateNoteDraft({ note: '  Falar com a Ana antes  ', link: 'wiki.empresa.com/plano' })).toEqual({
      ok: true,
      value: { note: 'Falar com a Ana antes', link: 'https://wiki.empresa.com/plano' },
    });
  });

  it('aceita só texto, só link ou ambos vazios', () => {
    expect(validateNoteDraft({ note: 'x', link: '' }).ok).toBe(true);
    expect(validateNoteDraft({ note: '', link: 'a.com' }).ok).toBe(true);
    expect(validateNoteDraft({ note: '', link: '' }).ok).toBe(true);
  });

  it('limita o tamanho do texto', () => {
    const result = validateNoteDraft({ note: 'x'.repeat(MAX_NOTE + 1), link: '' });
    expect(result).toMatchObject({ ok: false, errors: { note: expect.any(String) } });
  });

  it.each(['javascript:alert(1)', 'mailto:a@b.com', 'https://banco.com@evil.com', 'não é url'])(
    'recusa link perigoso ou inválido: %s',
    (link) => {
      expect(validateNoteDraft({ note: '', link })).toMatchObject({ ok: false, errors: { link: expect.any(String) } });
    },
  );
});

describe('setNote', () => {
  it('adiciona, substitui e remove sem mutar', () => {
    const base = { a: { note: 'um', link: '' } };
    const added = setNote(base, 'b', { note: 'dois', link: '' });
    expect(Object.keys(added)).toEqual(['a', 'b']);
    expect(setNote(added, 'a', { note: 'novo', link: '' }).a?.note).toBe('novo');
    expect(Object.keys(setNote(added, 'a', { note: '', link: '' }))).toEqual(['b']);
    expect(Object.keys(base)).toEqual(['a']);
  });
});
