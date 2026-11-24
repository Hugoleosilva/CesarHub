import raw from '../../public/data/services.json';
import { parseCatalog } from './catalogSchema';

// Protege o arquivo editado à mão: qualquer erro de digitação quebra o teste antes de chegar ao usuário.
describe('public/data/services.json', () => {
  const catalog = parseCatalog(raw);
  const services = catalog.flatMap((category) => category.items);

  it('é válido segundo o schema do catálogo', () => {
    expect(catalog.length).toBeGreaterThan(0);
  });

  it('toda capa citada (serviços e cards de Orientações) existe em public/covers', () => {
    const existing = new Set(Object.keys(import.meta.glob('../../public/covers/*')));
    const cited = [
      ...services.map((s) => s.image),
      ...catalog.flatMap((c) => (c.guideImage ? [c.guideImage] : [])),
    ].filter((path) => path.startsWith('/covers/'));

    const missing = cited.filter((path) => !existing.has(`../../public${path}`));
    expect(missing).toEqual([]);
  });

  it('nenhuma capa em public/covers fica sem uso', () => {
    const files = Object.keys(import.meta.glob('../../public/covers/*')).map((p) => p.replace('../../public', ''));
    const used = new Set([
      ...services.map((s) => s.image),
      ...catalog.flatMap((c) => (c.guideImage ? [c.guideImage] : [])),
    ]);
    expect(files.filter((file) => !used.has(file))).toEqual([]);
  });

  // O prefixo do arquivo diz a área da ilustração (e a cor): pessoas_ = laranja, solicitacao_ = azul etc.
  it('cada capa está na área indicada pelo prefixo do nome do arquivo', () => {
    const areaOfPrefix: Record<string, string> = {
      pessoas: 'Pessoas',
      solicitacao: 'Solicitações',
      ferramentas: 'Ferramentas',
      aprendizagem: 'Aprendizagem',
    };
    const wrong = catalog.flatMap((category) =>
      category.items.flatMap((service) => {
        const prefix = service.image.replace('/covers/', '').split('_')[0] ?? '';
        const expected = areaOfPrefix[prefix];
        return expected && expected !== category.name ? [`${service.id}: capa de ${expected} em ${category.name}`] : [];
      }),
    );
    expect(wrong).toEqual([]);
  });

  it('toda área tem a capa do card de Orientações', () => {
    expect(catalog.filter((c) => !c.guideImage).map((c) => c.name)).toEqual([]);
  });

  it('aponta cada capa para um arquivo SVG em /covers/ ou para uma URL absoluta', () => {
    for (const service of services) expect(service.image).toMatch(/^(\/covers\/.+|https?:\/\/.+)$/);
  });

  it('Ponto Eletrônico tem o link real, a página de orientações e os 4 responsáveis do DP', () => {
    const ponto = services.find((s) => s.id === 'ponto');
    expect(ponto?.title).toBe('Ponto Eletrônico');
    expect(ponto?.url).toContain('portalcolaborador.cesar.org.br');
    expect(ponto?.guide?.url).toContain('cesar.learning.rocks');
    expect(ponto?.guide?.contacts.map((c) => c.email)).toEqual([
      'rbga@cesar.org.br',
      'mmsoc@cesar.org.br',
      'jcrbo@cesar.org.br',
      'cbml@cesar.org.br',
    ]);
    expect(ponto?.keywords).toEqual(expect.arrayContaining(['banco de horas', 'abono', 'ajustar batidas']));
  });

  it('Auxílio Creche aponta para o Zeev real e traz as 5 regras do benefício', () => {
    const creche = services.find((s) => s.id === 'auxilio-creche');
    expect(creche?.url).toBe('https://cesar.zeev.it/my/services-legacy');
    expect(creche?.image).toMatch(/^\/covers\/solicitacao_/);
    expect(creche?.guide?.cases[0]?.steps).toHaveLength(5);
    expect(creche?.guide?.contactsIntro).toContain('Departamento Pessoal');
  });

  // Pega copiar/colar: dois serviços não devem apontar para a mesma página de orientações.
  it('não repete o link de orientações entre serviços', () => {
    const urls = services.flatMap((s) => (s.guide?.url ? [s.guide.url] : []));
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('tem o exemplo de orientações com cenários e responsáveis', () => {
    const plano = services.find((s) => s.id === 'plano-saude');
    expect(plano?.guide?.cases.map((c) => c.title)).toEqual(['Inclusão de dependente', 'Exclusão de dependente ou titular']);
    expect(plano?.guide?.contacts.length).toBeGreaterThan(0);
  });
});
