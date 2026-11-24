import { countServices, normalize, searchCatalog, suggestServices } from './search';
import type { Catalog } from './service';

const svc = (id: string, title: string, keywords: string[] = [], type = 'Portal') => ({
  id,
  title,
  description: `Descrição de ${title}`,
  url: `https://example.com/${id}`,
  image: `/covers/${id}.svg`,
  type,
  featured: false,
  keywords,
});

const catalog: Catalog = [
  { name: 'Gente & RH', items: [svc('holerite', 'Holerite', ['contra-cheque']), svc('ponto', 'Controle de Ponto', ['bater ponto'])] },
  { name: 'Chamados & TI', items: [svc('ti', 'Chamados de TI', ['computador quebrado'], 'Chamados')] },
];

describe('normalize', () => {
  it('remove acentos, hífens e caixa', () => {
    expect(normalize('  Contra-Cheque Médico ')).toBe('contra cheque medico');
  });
});

describe('searchCatalog', () => {
  it('retorna tudo com consulta vazia', () => {
    expect(searchCatalog(catalog, '   ')).toBe(catalog);
  });

  it('encontra por palavra-chave ignorando acento e hífen', () => {
    const result = searchCatalog(catalog, 'contracheque'.replace('contra', 'contra-'));
    expect(result.flatMap((c) => c.items.map((i) => i.id))).toEqual(['holerite']);
  });

  it('exige todos os termos', () => {
    expect(countServices(searchCatalog(catalog, 'computador quebrado'))).toBe(1);
    expect(countServices(searchCatalog(catalog, 'computador holerite'))).toBe(0);
  });

  it('encontra pelo nome da categoria e pelo tipo', () => {
    expect(searchCatalog(catalog, 'gente')[0]?.name).toBe('Gente & RH');
    expect(countServices(searchCatalog(catalog, 'chamados'))).toBe(1);
  });

  it('omite categorias sem resultado', () => {
    expect(searchCatalog(catalog, 'zzz')).toEqual([]);
  });
});

describe('busca em orientações', () => {
  const withGuide: Catalog = [
    {
      name: 'Solicitações',
      items: [
        {
          ...svc('plano', 'Plano de Saúde'),
          guide: {
            cases: [{ title: 'Inclusão de dependente', steps: ['Abra o formulário.'] }],
            contacts: [{ name: 'Maria Souza', role: 'Benefícios' }],
          },
        },
        svc('ponto', 'Controle de Ponto'),
      ],
    },
  ];

  it('encontra o serviço pelo nome ou cargo do responsável', () => {
    expect(countServices(searchCatalog(withGuide, 'maria'))).toBe(1);
    expect(countServices(searchCatalog(withGuide, 'benefícios'))).toBe(1);
  });

  it('encontra o serviço pelo título de um cenário', () => {
    expect(searchCatalog(withGuide, 'inclusao dependente')[0]?.items[0]?.id).toBe('plano');
  });

  it('não casa com o texto dos passos', () => {
    expect(countServices(searchCatalog(withGuide, 'formulário'))).toBe(0);
  });
});

describe('suggestServices', () => {
  it('prioriza títulos que começam com o termo e respeita o limite', () => {
    expect(suggestServices(catalog, 'ch')[0]?.id).toBe('ti');
    expect(suggestServices(catalog, 'o', 1)).toHaveLength(1);
  });

  it('não sugere com consulta vazia', () => {
    expect(suggestServices(catalog, '')).toEqual([]);
  });
});
