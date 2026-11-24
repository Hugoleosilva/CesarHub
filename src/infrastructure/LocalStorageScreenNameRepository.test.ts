import { LocalStorageScreenNameRepository } from './LocalStorageScreenNameRepository';

describe('LocalStorageScreenNameRepository', () => {
  it('salva e carrega o nome', () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_: string, next: string) => void (value = next) };
    const repo = new LocalStorageScreenNameRepository(() => storage);
    expect(repo.load()).toBeNull();
    repo.save('Meu dia a dia');
    expect(repo.load()).toBe('Meu dia a dia');
  });

  it('não lança quando o storage falha', () => {
    const broken = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageScreenNameRepository(broken);
    expect(repo.load()).toBeNull();
    expect(() => repo.save('x')).not.toThrow();
  });
});
