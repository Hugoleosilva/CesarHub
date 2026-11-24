import { LocalStorageCustomLinksRepository } from './LocalStorageCustomLinksRepository';

const memoryStorage = (initial?: string) => {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_: string, next: string) => {
      value = next;
    },
  };
};

describe('LocalStorageCustomLinksRepository', () => {
  it('salva e carrega os links', () => {
    const storage = memoryStorage();
    const repo = new LocalStorageCustomLinksRepository(() => storage);
    const links = [{ id: 'custom:1', title: 'Drive', description: 'Meus arquivos', url: 'https://drive.google.com/' }];
    repo.save(links);
    expect(repo.load()).toEqual(links);
  });

  it('carrega links antigos, salvos sem descrição', () => {
    const raw = JSON.stringify([{ id: 'a', title: 'Antigo', url: 'https://antigo.com/' }]);
    const repo = new LocalStorageCustomLinksRepository(() => memoryStorage(raw));
    expect(repo.load()).toEqual([{ id: 'a', title: 'Antigo', description: '', url: 'https://antigo.com/' }]);
  });

  it('descarta itens inválidos ou perigosos vindos do storage', () => {
    const raw = JSON.stringify([
      { id: 'a', title: 'Ok', url: 'https://ok.com' },
      { id: 'b', title: 'Mal', url: 'javascript:alert(1)' },
      { id: 'c', title: '', url: 'https://x.com' },
      { title: 'sem id', url: 'https://x.com' },
      'texto',
      null,
    ]);
    const repo = new LocalStorageCustomLinksRepository(() => memoryStorage(raw));
    expect(repo.load().map((l) => l.id)).toEqual(['a']);
  });

  it('retorna vazio com JSON corrompido e não lança quando o storage falha', () => {
    expect(new LocalStorageCustomLinksRepository(() => memoryStorage('{oops')).load()).toEqual([]);
    const broken = () => {
      throw new Error('bloqueado');
    };
    const repo = new LocalStorageCustomLinksRepository(broken);
    expect(repo.load()).toEqual([]);
    expect(() => repo.save([])).not.toThrow();
  });
});
