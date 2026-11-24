import { LocalStorageFavoritesRepository } from './LocalStorageFavoritesRepository';

const memoryStorage = (initial?: string) => {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_: string, next: string) => {
      value = next;
    },
  };
};

describe('LocalStorageFavoritesRepository', () => {
  it('salva e carrega os ids', () => {
    const storage = memoryStorage();
    const repo = new LocalStorageFavoritesRepository(() => storage);
    repo.save(['a', 'b']);
    expect(repo.load()).toEqual(['a', 'b']);
  });

  it('retorna vazio com JSON corrompido ou formato inesperado', () => {
    expect(new LocalStorageFavoritesRepository(() => memoryStorage('{oops')).load()).toEqual([]);
    expect(new LocalStorageFavoritesRepository(() => memoryStorage('{"a":1}')).load()).toEqual([]);
    expect(new LocalStorageFavoritesRepository(() => memoryStorage('["a",1]')).load()).toEqual(['a']);
  });

  it('não lança quando o storage falha', () => {
    const broken = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageFavoritesRepository(broken);
    expect(repo.load()).toEqual([]);
    expect(() => repo.save(['a'])).not.toThrow();
  });
});
