import { DEFAULT_LAYOUT } from '../domain/layout';
import { LocalStorageLayoutRepository } from './LocalStorageLayoutRepository';

const memoryStorage = (initial?: string) => {
  let value = initial ?? null;
  return { getItem: () => value, setItem: (_: string, next: string) => void (value = next) };
};

describe('LocalStorageLayoutRepository', () => {
  it('salva e carrega ordem e ocultas', () => {
    const storage = memoryStorage();
    const repo = new LocalStorageLayoutRepository(() => storage);
    repo.save({ order: ['b', 'a'], hidden: ['a'], hiddenGuides: ['b'] });
    expect(repo.load()).toEqual({ order: ['b', 'a'], hidden: ['a'], hiddenGuides: ['b'] });
  });

  it('usa o padrão sem dados, com JSON corrompido ou formato inesperado', () => {
    expect(new LocalStorageLayoutRepository(() => memoryStorage()).load()).toEqual(DEFAULT_LAYOUT);
    expect(new LocalStorageLayoutRepository(() => memoryStorage('{oops')).load()).toEqual(DEFAULT_LAYOUT);
    expect(new LocalStorageLayoutRepository(() => memoryStorage('42')).load()).toEqual(DEFAULT_LAYOUT);
  });

  it('descarta itens que não são texto', () => {
    const repo = new LocalStorageLayoutRepository(() => memoryStorage('{"order":["a",1],"hidden":"x"}'));
    expect(repo.load()).toEqual({ order: ['a'], hidden: [], hiddenGuides: [] });
  });

  it('carrega preferências antigas, salvas antes de existir o card de Orientações', () => {
    const repo = new LocalStorageLayoutRepository(() => memoryStorage('{"order":["a"],"hidden":["b"]}'));
    expect(repo.load()).toEqual({ order: ['a'], hidden: ['b'], hiddenGuides: [] });
  });

  it('não lança quando o storage falha', () => {
    const broken = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageLayoutRepository(broken);
    expect(repo.load()).toEqual(DEFAULT_LAYOUT);
    expect(() => repo.save(DEFAULT_LAYOUT)).not.toThrow();
  });
});
