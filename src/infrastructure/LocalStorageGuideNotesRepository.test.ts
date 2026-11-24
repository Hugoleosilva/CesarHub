import { LocalStorageGuideNotesRepository } from './LocalStorageGuideNotesRepository';

const memoryStorage = (initial?: string) => {
  let value = initial ?? null;
  return { getItem: () => value, setItem: (_: string, next: string) => void (value = next) };
};

describe('LocalStorageGuideNotesRepository', () => {
  it('salva e carrega as anotações', () => {
    const storage = memoryStorage();
    const repo = new LocalStorageGuideNotesRepository(() => storage);
    const notes = { plano: { note: 'Falar com a Ana', link: 'https://wiki.empresa.com/plano' } };
    repo.save(notes);
    expect(repo.load()).toEqual(notes);
  });

  it('descarta entradas inválidas, vazias ou com link perigoso', () => {
    const raw = JSON.stringify({
      ok: { note: 'bom', link: '' },
      mau: { note: '', link: 'javascript:alert(1)' },
      vazio: { note: '', link: '' },
      tipo: { note: 1, link: '' },
      texto: 'x',
      nulo: null,
    });
    const repo = new LocalStorageGuideNotesRepository(() => memoryStorage(raw));
    expect(Object.keys(repo.load())).toEqual(['ok']);
  });

  it('retorna vazio com JSON corrompido ou formato inesperado e não lança quando o storage falha', () => {
    expect(new LocalStorageGuideNotesRepository(() => memoryStorage('{oops')).load()).toEqual({});
    expect(new LocalStorageGuideNotesRepository(() => memoryStorage('[1]')).load()).toEqual({});
    const broken = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageGuideNotesRepository(broken);
    expect(repo.load()).toEqual({});
    expect(() => repo.save({})).not.toThrow();
  });
});
