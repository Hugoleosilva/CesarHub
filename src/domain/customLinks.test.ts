import { coverFor, customLinkToService, validateLinkDraft } from './customLinks';

describe('validateLinkDraft', () => {
  it('normaliza título e adiciona https:// quando falta', () => {
    expect(validateLinkDraft({ title: '  Meu Drive ', description: '', url: 'drive.google.com/x' })).toEqual({
      ok: true,
      value: { title: 'Meu Drive', description: '', url: 'https://drive.google.com/x' },
    });
  });

  it('mantém http:// explícito', () => {
    const result = validateLinkDraft({ title: 'Local', description: '', url: 'http://localhost:3000' });
    expect(result).toEqual({ ok: true, value: { title: 'Local', description: '', url: 'http://localhost:3000/' } });
  });

  it('aceita descrição opcional e limita o tamanho', () => {
    const ok = validateLinkDraft({ title: 'A', description: '  Curso de Go  ', url: 'a.com' });
    expect(ok).toMatchObject({ ok: true, value: { description: 'Curso de Go' } });
    const tooLong = validateLinkDraft({ title: 'A', description: 'x'.repeat(81), url: 'a.com' });
    expect(tooLong).toMatchObject({ ok: false, errors: { description: expect.any(String) } });
  });

  it('exige título e endereço', () => {
    expect(validateLinkDraft({ title: ' ', description: '', url: '' })).toEqual({
      ok: false,
      errors: { title: 'Informe um título.', url: 'Informe o endereço do link.' },
    });
  });

  it('limita o tamanho do título', () => {
    expect(validateLinkDraft({ title: 'a'.repeat(41), description: '', url: 'a.com' }).ok).toBe(false);
  });

  it('rejeita credenciais embutidas que disfarçam o destino', () => {
    expect(validateLinkDraft({ title: 'X', description: '', url: 'https://meu-banco.com@evil.com' }).ok).toBe(false);
  });

  it.each(['javascript:alert(1)', 'mailto:a@b.com', 'data:text/html,x', 'ftp://x.com', 'não é url'])(
    'rejeita endereço não http(s): %s',
    (url) => {
      const result = validateLinkDraft({ title: 'X', description: '', url });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.url).toBeDefined();
    },
  );
});

describe('customLinkToService', () => {
  it('usa o host como descrição quando não há uma, e gera a capa', () => {
    const service = customLinkToService({ id: 'custom:1', title: 'Meu Drive', description: '', url: 'https://drive.google.com/x' });
    expect(service).toMatchObject({ id: 'custom:1', description: 'drive.google.com', type: 'Externo', featured: false });
    expect(service.image).toMatch(/^data:image\/svg\+xml/);
  });

  it('prefere a descrição escrita pelo usuário', () => {
    const service = customLinkToService({ id: 'custom:2', title: 'Go', description: 'Curso de Go', url: 'https://alura.com.br/' });
    expect(service.description).toBe('Curso de Go');
  });
});

describe('coverFor', () => {
  it('é determinística por título e escapa caracteres especiais', () => {
    expect(coverFor('Abc')).toBe(coverFor('Abc'));
    expect(decodeURIComponent(coverFor('<script'))).toContain('&lt;');
  });
});
