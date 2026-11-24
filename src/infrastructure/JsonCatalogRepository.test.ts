import { CatalogLoadError, CatalogValidationError } from '../domain/errors';
import { JsonCatalogRepository } from './JsonCatalogRepository';

const validItem = {
  id: 'a',
  title: 'A',
  description: 'desc',
  url: 'https://example.com',
  image: '/covers/a.svg',
  type: 'Portal',
  keywords: ['x'],
  topics: [],
  featured: false,
};

const respond = (body: unknown, init?: ResponseInit) =>
  (async () => new Response(JSON.stringify(body), init)) as typeof fetch;

describe('JsonCatalogRepository', () => {
  it('converte o JSON em catálogo de domínio', async () => {
    const repo = new JsonCatalogRepository('/x.json', respond([{ category: 'Cat', items: [validItem] }]));
    expect(await repo.getCatalog()).toEqual([{ name: 'Cat', items: [validItem] }]);
  });

  it('lê orientações com cenários e responsáveis', async () => {
    const guide = {
      where: 'No Zeev.',
      cases: [{ title: 'Inclusão', steps: ['Abra o formulário.'] }],
      contacts: [{ name: 'Maria', role: 'RH', email: 'maria@exemplo.com', slack: '#rh' }],
    };
    const repo = new JsonCatalogRepository('/x.json', respond([{ category: 'Cat', items: [{ ...validItem, guide }] }]));
    const [category] = await repo.getCatalog();
    expect(category?.items[0]?.guide).toEqual(guide);
  });

  it('rejeita responsável com e-mail inválido ou cenário sem passos', async () => {
    const badEmail = { contacts: [{ name: 'Maria', email: 'nao-e-email' }] };
    const noSteps = { cases: [{ title: 'Inclusão', steps: [] }] };
    for (const guide of [badEmail, noSteps]) {
      const repo = new JsonCatalogRepository('/x.json', respond([{ category: 'Cat', items: [{ ...validItem, guide }] }]));
      await expect(repo.getCatalog()).rejects.toBeInstanceOf(CatalogValidationError);
    }
  });

  it('lê os tópicos do serviço e rejeita tópico vazio', async () => {
    const ok = new JsonCatalogRepository('/x.json', respond([{ category: 'Cat', items: [{ ...validItem, topics: ['Benefícios'] }] }]));
    expect((await ok.getCatalog())[0]?.items[0]?.topics).toEqual(['Benefícios']);
    const bad = new JsonCatalogRepository('/x.json', respond([{ category: 'Cat', items: [{ ...validItem, topics: [''] }] }]));
    await expect(bad.getCatalog()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('lança CatalogLoadError em HTTP de erro', async () => {
    const repo = new JsonCatalogRepository('/x.json', respond({}, { status: 500 }));
    await expect(repo.getCatalog()).rejects.toBeInstanceOf(CatalogLoadError);
  });

  it('lança CatalogLoadError em falha de rede', async () => {
    const repo = new JsonCatalogRepository('/x.json', (async () => {
      throw new TypeError('offline');
    }) as typeof fetch);
    await expect(repo.getCatalog()).rejects.toBeInstanceOf(CatalogLoadError);
  });

  it('lança CatalogValidationError com URL inválida', async () => {
    const repo = new JsonCatalogRepository(
      '/x.json',
      respond([{ category: 'Cat', items: [{ ...validItem, url: 'não é url' }] }]),
    );
    await expect(repo.getCatalog()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('rejeita ids duplicados', async () => {
    const repo = new JsonCatalogRepository(
      '/x.json',
      respond([{ category: 'Cat', items: [validItem, validItem] }]),
    );
    await expect(repo.getCatalog()).rejects.toThrow(/duplicado/);
  });
});
