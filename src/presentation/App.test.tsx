import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CustomLinksRepository } from '../application/ports/CustomLinksRepository';
import type { FavoritesRepository } from '../application/ports/FavoritesRepository';
import type { GuideNotesRepository } from '../application/ports/GuideNotesRepository';
import type { LayoutRepository } from '../application/ports/LayoutRepository';
import type { GuideNotes } from '../domain/guideNotes';
import type { Layout } from '../domain/layout';
import type { ScreenNameRepository } from '../application/ports/ScreenNameRepository';
import type { CustomLink } from '../domain/customLinks';
import { CatalogLoadError } from '../domain/errors';
import type { Catalog } from '../domain/service';
import { App } from './App';

const catalog: Catalog = [
  {
    name: 'Pessoas',
    items: [
      { id: 'holerite', title: 'Holerite', description: 'Contracheques.', url: 'https://example.com/h', image: '/h.svg', type: 'Portal', keywords: ['contra-cheque'], featured: false },
      { id: 'ponto', title: 'Controle de Ponto', description: 'Jornada.', url: 'https://example.com/p', image: '/p.svg', type: 'Portal', keywords: [], featured: false },
    ],
  },
  {
    name: 'Aprendizagem',
    items: [
      { id: 'cursos', title: 'Plataforma de Cursos', description: 'Trilhas.', url: 'https://example.com/c', image: '/c.svg', type: 'Portal', keywords: [], featured: true },
    ],
  },
];

const memoryFavorites = (initial: string[] = []): FavoritesRepository & { saved: string[] } => {
  const repo = { saved: initial, load: () => repo.saved, save: (ids: readonly string[]) => void (repo.saved = [...ids]) };
  return repo;
};

const memoryLinks = (initial: CustomLink[] = []): CustomLinksRepository & { saved: CustomLink[] } => {
  const repo = { saved: initial, load: () => repo.saved, save: (links: readonly CustomLink[]) => void (repo.saved = [...links]) };
  return repo;
};

const memoryName = (initial: string | null = null): ScreenNameRepository & { saved: string | null } => {
  const repo = { saved: initial, load: () => repo.saved, save: (name: string) => void (repo.saved = name) };
  return repo;
};

const memoryLayout = (initial: Layout = { order: [], hidden: [], hiddenGuides: [] }): LayoutRepository & { saved: Layout } => {
  const repo = { saved: initial, load: () => repo.saved, save: (layout: Layout) => void (repo.saved = layout) };
  return repo;
};

const memoryNotes = (initial: GuideNotes = {}): GuideNotesRepository & { saved: GuideNotes } => {
  const repo = { saved: initial, load: () => repo.saved, save: (notes: GuideNotes) => void (repo.saved = notes) };
  return repo;
};

type Options = {
  notes?: ReturnType<typeof memoryNotes>;
  favorites?: ReturnType<typeof memoryFavorites>;
  links?: ReturnType<typeof memoryLinks>;
  name?: ReturnType<typeof memoryName>;
  layout?: ReturnType<typeof memoryLayout>;
  getCatalog?: () => Promise<Catalog>;
};

const setup = ({
  notes = memoryNotes(),
  favorites = memoryFavorites(),
  links = memoryLinks(),
  name = memoryName(),
  layout = memoryLayout(),
  getCatalog = async () => catalog,
}: Options = {}) =>
  render(
    <App
      getCatalog={getCatalog}
      favoritesRepository={favorites}
      customLinksRepository={links}
      screenNameRepository={name}
      layoutRepository={layout}
      guideNotesRepository={notes}
    />,
  );

const sectionTitles = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);

/** Personalizar fica em Minha Tela: abre a aba e clica no botão (ou no convite da tela vazia). */
async function openCustomize(user: ReturnType<typeof userEvent.setup>) {
  // A aba da tela personalizada é sempre a segunda (o nome dela pode ter sido trocado).
  await user.click(within(screen.getByRole('navigation', { name: 'Áreas' })).getAllByRole('button')[1]!);
  await user.click(screen.getByRole('button', { name: /^Personalizar/ }));
}

describe('App', () => {
  it('home mostra o banner de Orientações e uma fileira por categoria', async () => {
    setup();
    expect(await screen.findByRole('heading', { name: 'Pessoas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Aprendizagem' })).toBeInTheDocument();
    const banner = screen.getByRole('region', { name: 'Destaques' });
    expect(within(banner).getByRole('heading', { name: 'Orientações de Pessoas' })).toBeInTheDocument();
    expect(within(banner).getAllByRole('button', { name: /^Destaque \d/ })).toHaveLength(2);
  });

  it('o botão do banner abre o resumo de Orientações da área', async () => {
    const user = userEvent.setup();
    setup();
    const banner = await screen.findByRole('region', { name: 'Destaques' });
    await user.click(within(banner).getByRole('button', { name: 'Ver orientações' }));
    expect(screen.getByRole('dialog', { name: 'Orientações de Pessoas' })).toBeInTheDocument();
  });

  it('os pontos do banner trocam de slide', async () => {
    const user = userEvent.setup();
    setup();
    const banner = await screen.findByRole('region', { name: 'Destaques' });
    await user.click(within(banner).getByRole('button', { name: 'Destaque 2: Orientações de Aprendizagem' }));
    expect(within(banner).getByRole('heading', { name: 'Orientações de Aprendizagem' })).toBeInTheDocument();
  });

  it('o banner some quando nenhuma área visível tem card de Orientações', async () => {
    setup({ layout: memoryLayout({ order: [], hidden: ['Pessoas'], hiddenGuides: ['Aprendizagem'] }) });
    await screen.findByRole('heading', { name: 'Aprendizagem' });
    expect(screen.queryByRole('region', { name: 'Destaques' })).not.toBeInTheDocument();
  });

  it('cards abrem em nova aba com rel seguro', async () => {
    setup();
    const link = await screen.findByRole('link', { name: /Holerite/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  describe('filtros', () => {
    const filterable: Catalog = [
      {
        name: 'Pessoas',
        items: [
          { id: 'ponto', title: 'Ponto Eletrônico', description: 'Jornada.', url: 'https://example.com/p', image: '/p.svg', type: 'Portal', keywords: [], topics: ['Jornada'], featured: false },
          { id: 'plano', title: 'Plano de Saúde', description: 'Inclusão.', url: 'https://example.com/pl', image: '/p.svg', type: 'Zeev', keywords: [], topics: ['Benefícios', 'Saúde'], featured: false },
        ],
      },
      {
        name: 'Ferramentas',
        items: [
          { id: 'gmail', title: 'Gmail', description: 'E-mail.', url: 'https://mail.example.com', image: '/g.svg', type: 'Google', keywords: [], topics: ['Colaboração'], featured: false },
        ],
      },
    ];

    const pick = async (user: ReturnType<typeof userEvent.setup>, label: string, option: string) => {
      await user.click(screen.getByRole('button', { name: new RegExp(label) }));
      await user.click(screen.getByRole('checkbox', { name: option }));
    };

    it('lista os tipos e os tópicos existentes no catálogo, em ordem alfabética', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Pessoas' });

      await user.click(screen.getByRole('button', { name: /Tipos de conteúdo/ }));
      expect(screen.getAllByRole('checkbox').map((c) => c.parentElement?.textContent)).toEqual(['Google', 'Portal', 'Zeev']);
      await user.click(screen.getByRole('button', { name: /Tópicos/ }));
      expect(screen.getAllByRole('checkbox').map((c) => c.parentElement?.textContent)).toEqual(['Benefícios', 'Colaboração', 'Jornada', 'Saúde']);
    });

    it('filtrar por tipo mantém só os serviços daquele tipo e some com áreas vazias', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Ferramentas' });

      await pick(user, 'Tipos de conteúdo', 'Zeev');
      expect(screen.getByRole('heading', { name: 'Plano de Saúde' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Ponto Eletrônico' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Ferramentas' })).not.toBeInTheDocument();
    });

    it('filtrar por tópico, e combinar tipo e tópico com "e"', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Ferramentas' });

      await pick(user, 'Tópicos', 'Saúde');
      expect(screen.getByRole('heading', { name: 'Plano de Saúde' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Gmail' })).not.toBeInTheDocument();

      await pick(user, 'Tipos de conteúdo', 'Portal'); // Saúde + Portal: ninguém
      expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
    });

    it('esconde os cards de Orientações enquanto há filtro e os traz de volta ao limpar', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('button', { name: 'Orientações de Pessoas' });

      await pick(user, 'Tipos de conteúdo', 'Portal');
      expect(screen.queryByRole('button', { name: 'Orientações de Pessoas' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Orientações de Ferramentas' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
      expect(screen.getByRole('button', { name: 'Orientações de Pessoas' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
    });

    it('o filtro vale dentro da aba da área e na busca', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Ferramentas' });

      await user.click(screen.getByRole('button', { name: 'Pessoas' }));
      await pick(user, 'Tipos de conteúdo', 'Portal');
      expect(screen.getByRole('heading', { name: 'Ponto Eletrônico' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Plano de Saúde' })).not.toBeInTheDocument();

      await user.type(screen.getByRole('combobox'), 'saude');
      expect(screen.getByText(/com os filtros escolhidos/)).toBeInTheDocument();
    });

    it('Esc fecha só a lista suspensa, sem limpar a busca', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Pessoas' });
      await user.type(screen.getByRole('combobox'), 'ponto');

      await user.click(screen.getByRole('button', { name: /Tópicos/ }));
      expect(screen.getByRole('group', { name: 'Tópicos' })).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('group', { name: 'Tópicos' })).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('ponto');
    });

    it('o resumo do botão mostra a seleção', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => filterable });
      await screen.findByRole('heading', { name: 'Pessoas' });
      await pick(user, 'Tópicos', 'Saúde');
      expect(screen.getByRole('button', { name: /Tópicos/ })).toHaveTextContent('Saúde');
      await user.click(screen.getByRole('checkbox', { name: 'Jornada' }));
      expect(screen.getByRole('button', { name: /Tópicos/ })).toHaveTextContent('2 selecionados');
    });
  });

  describe('card de Orientações', () => {
    const guided: Catalog = [
      {
        name: 'Solicitações',
        guideImage: '/g.webp',
        items: [
          {
            id: 'plano', title: 'Plano de Saúde', description: 'Inclusão e exclusão.', url: 'https://example.com/plano', image: '/p.svg', type: 'Zeev', keywords: [], featured: false,
            guide: {
              where: 'No Zeev, em Benefícios.',
              url: 'https://wiki.example.com/plano',
              contactsIntro: 'Time de Benefícios: cuida de planos e auxílios.',
              cases: [
                { title: 'Inclusão', steps: ['Abra o formulário.', 'Anexe os documentos.'] },
                { title: 'Exclusão', steps: ['Informe quem sai.'] },
              ],
              contacts: [{ name: 'Maria Souza', role: 'Benefícios', email: 'maria@example.com', slack: '#beneficios' }],
            },
          },
          { id: 'ponto', title: 'Controle de Ponto', description: 'Jornada.', url: 'https://example.com/p', image: '/p.svg', type: 'Portal', keywords: [], featured: false },
        ],
      },
    ];

    const openArea = async (user: ReturnType<typeof userEvent.setup>, area = 'Solicitações') =>
      user.click(await screen.findByRole('button', { name: `Orientações de ${area}` }));

    it('cada área começa com o card de Orientações, antes dos serviços', async () => {
      setup();
      const pessoas = await screen.findByRole('region', { name: 'Pessoas' });
      const titles = within(pessoas).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
      expect(titles).toEqual(['Orientações', 'Holerite', 'Controle de Ponto']);
      expect(screen.getByRole('button', { name: 'Orientações de Aprendizagem' })).toBeInTheDocument();
    });

    it('o card aparece também ao abrir a aba da área, mas não nos resultados da busca nem na tela personalizada', async () => {
      const user = userEvent.setup();
      setup({ favorites: memoryFavorites(['holerite']) });
      await screen.findByRole('heading', { name: 'Aprendizagem' });

      const minhaTela = screen.getByRole('region', { name: 'Minha Tela' });
      expect(within(minhaTela).queryByRole('button', { name: /Orientações/ })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Pessoas' }));
      expect(screen.getByRole('button', { name: 'Orientações de Pessoas' })).toBeInTheDocument();

      await user.type(screen.getByRole('combobox'), 'holerite');
      expect(screen.queryByRole('button', { name: 'Orientações de Pessoas' })).not.toBeInTheDocument();
    });

    it('abre o resumo da área com o link de acesso e os responsáveis de cada serviço', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);

      const dialog = screen.getByRole('dialog', { name: 'Orientações de Solicitações' });
      const acessarPlano = within(dialog).getByRole('link', { name: 'Acessar Plano de Saúde' });
      expect(acessarPlano).toHaveAttribute('href', 'https://example.com/plano');
      expect(acessarPlano).toHaveAttribute('target', '_blank');
      expect(acessarPlano).toHaveAttribute('rel', 'noopener noreferrer');
      expect(within(dialog).getByRole('link', { name: 'Maria Souza' })).toHaveAttribute('href', 'mailto:maria@example.com');
      expect(within(dialog).getByRole('link', { name: 'Orientações completas de Plano de Saúde' })).toHaveAttribute('href', 'https://wiki.example.com/plano');
      expect(within(dialog).getByRole('link', { name: 'Acessar Controle de Ponto' })).toHaveAttribute('href', 'https://example.com/p');
      // serviço sem responsável cadastrado não ganha linha "Procurar"
      expect(within(dialog).getAllByText('Procurar:')).toHaveLength(1);
    });

    it('sem pessoas listadas, o resumo mostra o texto da equipe responsável', async () => {
      const user = userEvent.setup();
      const teamOnly: Catalog = [
        { name: 'Solicitações', items: [{ ...guided[0]!.items[0]!, guide: { contactsIntro: 'Departamento Pessoal: cuida da folha.', cases: [], contacts: [] } }] },
      ];
      setup({ getCatalog: async () => teamOnly });
      await openArea(user);
      const dialog = screen.getByRole('dialog', { name: 'Orientações de Solicitações' });
      expect(within(dialog).getByText('Departamento Pessoal: cuida da folha.')).toBeInTheDocument();
      expect(within(dialog).queryByText('Procurar:')).not.toBeInTheDocument();
    });

    it('Detalhes e anotações abre a tela de detalhe do serviço', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Plano de Saúde' }));

      const dialog = screen.getByRole('region', { name: 'Plano de Saúde' });
      expect(within(dialog).getByText('No Zeev, em Benefícios.')).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: 'Inclusão' })).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: 'Exclusão' })).toBeInTheDocument();
      expect(within(dialog).getByText('Anexe os documentos.')).toBeInTheDocument();
      expect(within(dialog).getByText('Time de Benefícios: cuida de planos e auxílios.')).toBeInTheDocument();
      expect(within(dialog).getByRole('link', { name: 'maria@example.com' })).toHaveAttribute('href', 'mailto:maria@example.com');
      expect(within(dialog).getByText('Slack: #beneficios')).toBeInTheDocument();
      expect(within(dialog).getByRole('link', { name: 'Ver orientações completas' })).toHaveAttribute('href', 'https://wiki.example.com/plano');
      expect(within(dialog).getByRole('link', { name: 'Acessar Plano de Saúde' })).toHaveAttribute('href', 'https://example.com/plano');
    });

    it('o detalhe substitui o resumo da área e Voltar retorna ao catálogo', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Plano de Saúde' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Plano de Saúde' })).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Pessoas' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Voltar/ }));
      expect(screen.queryByRole('region', { name: 'Plano de Saúde' })).not.toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Solicitações' })).toBeInTheDocument();
    });

    it('Esc volta do detalhe ao catálogo, mas não enquanto o usuário digita a anotação', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Plano de Saúde' }));
      await user.click(screen.getByRole('button', { name: 'Adicionar minhas anotações' }));
      await user.type(screen.getByLabelText('Suas anotações'), 'rascunho');

      await user.keyboard('{Escape}');
      expect(screen.getByRole('region', { name: 'Plano de Saúde' })).toBeInTheDocument();
      expect(screen.getByLabelText('Suas anotações')).toHaveValue('rascunho');

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('region', { name: 'Plano de Saúde' })).not.toBeInTheDocument();
    });

    it('trocar de aba fecha o detalhe', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Plano de Saúde' }));
      await user.click(screen.getByRole('button', { name: 'Início' }));
      expect(screen.queryByRole('region', { name: 'Plano de Saúde' })).not.toBeInTheDocument();
    });

    it('Esc fecha o painel da área logo ao abrir, sem clicar em nada dentro', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await openArea(user);
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('clicar no card de um serviço vai direto ao link, sem abrir painel', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      const plano = await screen.findByRole('link', { name: /Plano de Saúde/ });
      const ponto = screen.getByRole('link', { name: /Controle de Ponto/ });
      for (const [card, href] of [[plano, 'https://example.com/plano'], [ponto, 'https://example.com/p']] as const) {
        expect(card).toHaveAttribute('href', href);
        expect(card).toHaveAttribute('target', '_blank');
        expect(card).not.toHaveAttribute('aria-haspopup');
        await user.click(card);
      }
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('o usuário remove o card de Orientações de uma área em Personalizar e isso persiste', async () => {
      const user = userEvent.setup();
      const layout = memoryLayout();
      setup({ layout });
      await screen.findByRole('button', { name: 'Orientações de Pessoas' });

      await openCustomize(user);
      await user.click(screen.getByRole('checkbox', { name: 'Card de Orientações em Pessoas' }));
      expect(layout.saved.hiddenGuides).toEqual(['Pessoas']);
      await user.click(screen.getByRole('button', { name: 'Concluir' }));
      await user.click(screen.getByRole('button', { name: 'Início' }));

      expect(screen.queryByRole('button', { name: 'Orientações de Pessoas' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Orientações de Aprendizagem' })).toBeInTheDocument();
      const pessoas = screen.getByRole('region', { name: 'Pessoas' });
      expect(within(pessoas).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Holerite', 'Controle de Ponto']);
    });

    it('respeita o card removido salvo e permite recolocá-lo', async () => {
      const user = userEvent.setup();
      const layout = memoryLayout({ order: [], hidden: [], hiddenGuides: ['Pessoas'] });
      setup({ layout });
      await screen.findByRole('heading', { name: 'Pessoas' });
      expect(screen.queryByRole('button', { name: 'Orientações de Pessoas' })).not.toBeInTheDocument();

      await openCustomize(user);
      const checkbox = screen.getByRole('checkbox', { name: 'Card de Orientações em Pessoas' });
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(layout.saved.hiddenGuides).toEqual([]);
    });

    it('a tela personalizada não tem opção de card de Orientações', async () => {
      const user = userEvent.setup();
      setup();
      await screen.findByRole('heading', { name: 'Pessoas' });
      await openCustomize(user);
      expect(screen.queryByRole('checkbox', { name: 'Card de Orientações em Minha Tela' })).not.toBeInTheDocument();
    });

    it('o usuário registra anotações e o link de uma página de orientação em qualquer serviço', async () => {
      const user = userEvent.setup();
      const notes = memoryNotes();
      setup({ getCatalog: async () => guided, notes });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Controle de Ponto' }));
      const dialog = screen.getByRole('region', { name: 'Controle de Ponto' });
      expect(within(dialog).getByText(/Ainda não há orientações oficiais/)).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: 'Adicionar minhas anotações' }));
      await user.type(within(dialog).getByLabelText('Suas anotações'), 'Pedir à Ana antes das 10h');
      await user.type(within(dialog).getByLabelText('Link da página de orientação (opcional)'), 'wiki.empresa.com/ponto');
      await user.click(within(dialog).getByRole('button', { name: 'Salvar anotações' }));

      expect(notes.saved).toEqual({ ponto: { note: 'Pedir à Ana antes das 10h', link: 'https://wiki.empresa.com/ponto' } });
      expect(within(dialog).getByText('Pedir à Ana antes das 10h')).toBeInTheDocument();
      expect(within(dialog).getByRole('link', { name: 'Abrir minha página de orientação' })).toHaveAttribute('href', 'https://wiki.empresa.com/ponto');
    });

    it('recusa link perigoso e limpa a anotação ao salvar vazio', async () => {
      const user = userEvent.setup();
      const notes = memoryNotes({ plano: { note: 'lembrete', link: '' } });
      setup({ getCatalog: async () => guided, notes });
      await openArea(user);
      await user.click(screen.getByRole('button', { name: 'Detalhes e anotações de Plano de Saúde' }));
      const dialog = screen.getByRole('region', { name: 'Plano de Saúde' });

      await user.click(within(dialog).getByRole('button', { name: 'Editar minhas anotações' }));
      await user.type(within(dialog).getByLabelText('Link da página de orientação (opcional)'), 'javascript:alert(1)');
      await user.click(within(dialog).getByRole('button', { name: 'Salvar anotações' }));
      expect(within(dialog).getByText(/Endereço inválido/)).toBeInTheDocument();
      expect(notes.saved).toEqual({ plano: { note: 'lembrete', link: '' } });

      await user.clear(within(dialog).getByLabelText('Link da página de orientação (opcional)'));
      await user.clear(within(dialog).getByLabelText('Suas anotações'));
      await user.click(within(dialog).getByRole('button', { name: 'Salvar anotações' }));
      expect(notes.saved).toEqual({});
    });

    it('a busca encontra o serviço pelo nome do responsável', async () => {
      const user = userEvent.setup();
      setup({ getCatalog: async () => guided });
      await screen.findByRole('link', { name: /Plano de Saúde/ });
      await user.type(screen.getByRole('combobox'), 'maria');
      expect(screen.getByRole('heading', { name: 'Plano de Saúde' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Controle de Ponto' })).not.toBeInTheDocument();
    });
  });

  it('Esc fecha o Personalizar logo ao abrir, sem clicar em nada dentro', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Pessoas' });
    await openCustomize(user);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('aba de categoria mostra só aquela área', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await user.click(screen.getByRole('button', { name: 'Pessoas' }));
    expect(screen.queryByRole('heading', { name: 'Aprendizagem' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Controle de Ponto' })).toBeInTheDocument();
  });

  it('favorita pela estrela, persiste e mostra na tela personalizada', async () => {
    const user = userEvent.setup();
    const favorites = memoryFavorites();
    setup({ favorites });

    await user.click(await screen.findByRole('button', { name: 'Adicionar Holerite aos favoritos' }));
    expect(favorites.saved).toEqual(['holerite']);
    expect(screen.getByRole('heading', { name: 'Minha Tela' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Minha Tela' }));
    expect(screen.getByRole('button', { name: 'Remover Holerite dos favoritos' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Controle de Ponto' })).not.toBeInTheDocument();
  });

  it('tela personalizada vazia orienta o usuário', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Aprendizagem' });
    await user.click(screen.getByRole('button', { name: 'Minha Tela' }));
    expect(screen.getByText('Minha Tela está vazia')).toBeInTheDocument();
  });

  it('Personalizar marca serviços de qualquer área', async () => {
    const user = userEvent.setup();
    const favorites = memoryFavorites();
    setup({ favorites });
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await openCustomize(user);
    const dialog = screen.getByRole('dialog', { name: 'Personalizar minha tela' });
    await user.click(within(dialog).getByRole('checkbox', { name: /Plataforma de Cursos/ }));
    expect(favorites.saved).toEqual(['cursos']);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Minha Tela' })).toBeInTheDocument();
  });

  it('renomeia a tela personalizada e volta ao padrão se ficar vazio', async () => {
    const user = userEvent.setup();
    const name = memoryName();
    setup({ name, favorites: memoryFavorites(['holerite']) });
    await screen.findByRole('heading', { name: 'Minha Tela' });

    await openCustomize(user);
    const input = screen.getByLabelText('Nome da sua tela');
    await user.clear(input);
    await user.type(input, 'Meu dia a dia');
    await user.click(screen.getByRole('button', { name: 'Concluir' }));

    expect(name.saved).toBe('Meu dia a dia');
    expect(screen.getByRole('heading', { name: 'Meu dia a dia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Meu dia a dia' })).toBeInTheDocument();

    await openCustomize(user);
    await user.clear(screen.getByLabelText('Nome da sua tela'));
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.getByRole('heading', { name: 'Minha Tela' })).toBeInTheDocument();
  });

  it('inclui um curso externo pelo Personalizar e o mostra na tela personalizada', async () => {
    const user = userEvent.setup();
    const links = memoryLinks();
    setup({ links });
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await openCustomize(user);
    await user.click(screen.getByRole('button', { name: '+ Adicionar link externo' }));
    await user.type(screen.getByLabelText('Título'), 'Curso Alura');
    await user.type(screen.getByLabelText('Descrição (opcional)'), 'Formação em Go');
    await user.type(screen.getByLabelText('Endereço (URL)'), 'alura.com.br/curso');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(links.saved).toMatchObject([
      { title: 'Curso Alura', description: 'Formação em Go', url: 'https://alura.com.br/curso' },
    ]);
    await user.click(screen.getByRole('button', { name: 'Concluir' }));

    const link = screen.getByRole('link', { name: /Curso Alura/ });
    expect(link).toHaveTextContent('Formação em Go');
    expect(link).toHaveAttribute('href', 'https://alura.com.br/curso');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('heading', { name: 'Meus Links' })).not.toBeInTheDocument();
  });

  it('edita e remove um link externo pelo Personalizar', async () => {
    const user = userEvent.setup();
    const links = memoryLinks([{ id: 'custom:1', title: 'Curso Udemy', description: '', url: 'https://udemy.com/c/' }]);
    setup({ links });
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await openCustomize(user);
    await user.click(screen.getByRole('button', { name: 'Editar link Curso Udemy' }));
    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Udemy Kubernetes');
    await user.type(screen.getByLabelText('Descrição (opcional)'), 'Do zero ao deploy');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(links.saved[0]).toMatchObject({ title: 'Udemy Kubernetes', description: 'Do zero ao deploy' });

    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Remover link Udemy Kubernetes' }));
    expect(confirm).toHaveBeenCalledWith('Remover o link "Udemy Kubernetes"?');
    expect(links.saved).toEqual([]);
    confirm.mockRestore();
  });

  it('não remove o link externo se o usuário cancelar a confirmação', async () => {
    const user = userEvent.setup();
    const links = memoryLinks([{ id: 'custom:1', title: 'Curso Udemy', description: '', url: 'https://udemy.com/c/' }]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    setup({ links });
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await openCustomize(user);
    await user.click(screen.getByRole('button', { name: 'Remover link Curso Udemy' }));
    expect(links.saved).toHaveLength(1);
    confirm.mockRestore();
  });

  it('a busca informa quantos serviços encontrou, e o início não mostra contagem', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Pessoas' });
    expect(screen.queryByText(/encontrado/)).not.toBeInTheDocument();

    await user.type(screen.getByRole('combobox', { name: 'Buscar serviços' }), 'holerite');
    expect(screen.getByRole('status')).toHaveTextContent('1 serviço encontrado');
  });

  it('o botão Ajuda abre o guia de uso e fecha com Esc', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Pessoas' });
    await user.click(screen.getByRole('button', { name: 'Ajuda' }));
    const dialog = screen.getByRole('dialog', { name: 'Como usar o CESAR Hub' });
    expect(within(dialog).getByText(/Clique no card/)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('recusa link com endereço perigoso e mostra o erro', async () => {
    const user = userEvent.setup();
    const links = memoryLinks();
    setup({ links });
    await screen.findByRole('heading', { name: 'Aprendizagem' });

    await openCustomize(user);
    await user.click(screen.getByRole('button', { name: '+ Adicionar link externo' }));
    await user.type(screen.getByLabelText('Título'), 'Mal');
    await user.type(screen.getByLabelText('Endereço (URL)'), 'javascript:alert(1)');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText(/Endereço inválido/)).toBeInTheDocument();
    expect(links.saved).toEqual([]);
  });

  it('reordena as áreas na home e nas abas, e persiste', async () => {
    const user = userEvent.setup();
    const layout = memoryLayout();
    setup({ layout });
    await screen.findByRole('heading', { name: 'Pessoas' });
    expect(sectionTitles()).toEqual(['Orientações de Pessoas', 'Pessoas', 'Aprendizagem']);

    await openCustomize(user);
    await user.click(screen.getByRole('button', { name: 'Mover Aprendizagem para cima' }));
    expect(layout.saved.order).toEqual(['__personal__', 'Aprendizagem', 'Pessoas']);
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    await user.click(screen.getByRole('button', { name: 'Início' }));

    expect(sectionTitles()).toEqual(['Orientações de Aprendizagem', 'Aprendizagem', 'Pessoas']);
    const tabNames = within(screen.getByRole('navigation', { name: 'Áreas' })).getAllByRole('button').map((b) => b.textContent);
    expect(tabNames).toEqual(['Início', 'Minha Tela', 'Aprendizagem', 'Pessoas']);
  });

  it('oculta uma área da tela, mas a busca continua encontrando seus serviços', async () => {
    const user = userEvent.setup();
    const layout = memoryLayout();
    setup({ layout });
    await screen.findByRole('heading', { name: 'Pessoas' });

    await openCustomize(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('checkbox', { name: 'Pessoas' }));
    expect(layout.saved.hidden).toEqual(['Pessoas']);
    await user.click(screen.getByRole('button', { name: 'Concluir' }));

    expect(screen.queryByRole('heading', { name: 'Pessoas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pessoas' })).not.toBeInTheDocument();

    await user.type(screen.getByRole('combobox'), 'holerite');
    expect(screen.getByRole('heading', { name: 'Holerite' })).toBeInTheDocument();
  });

  it('respeita a ordem e as áreas ocultas salvas', async () => {
    setup({ layout: memoryLayout({ order: ['Aprendizagem', 'Pessoas'], hidden: ['__personal__'], hiddenGuides: [] }) });
    await screen.findByRole('heading', { name: 'Aprendizagem' });
    expect(sectionTitles()).toEqual(['Orientações de Aprendizagem', 'Aprendizagem', 'Pessoas']);
  });

  it('mostra aviso quando todas as áreas estão ocultas', async () => {
    setup({ layout: memoryLayout({ order: [], hidden: ['__personal__', 'Pessoas', 'Aprendizagem'], hiddenGuides: [] }) });
    expect(await screen.findByText('Nenhuma área na tela')).toBeInTheDocument();
  });

  it('filtra por palavra-chave, inclui links externos e mostra estado vazio', async () => {
    const user = userEvent.setup();
    setup({ links: memoryLinks([{ id: 'custom:1', title: 'Wiki do time', description: '', url: 'https://wiki.exemplo.com/' }]) });
    await screen.findByRole('heading', { name: 'Controle de Ponto' });

    await user.type(screen.getByRole('combobox'), 'contra-cheque');
    expect(screen.queryByRole('heading', { name: 'Controle de Ponto' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Holerite' })).toBeInTheDocument();

    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'wiki');
    expect(screen.getByRole('heading', { name: 'Wiki do time' })).toBeInTheDocument();

    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'zzzz');
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('"/" foca a busca e "Esc" limpa', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Holerite' });

    await user.keyboard('/');
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();

    await user.type(input, 'ponto');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(input).not.toHaveFocus();
  });

  it('alterna para o tema claro', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByRole('heading', { name: 'Holerite' });
    await user.click(screen.getByRole('button', { name: 'Mudar para tema claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    await user.click(screen.getByRole('button', { name: 'Mudar para tema escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('mostra erro e permite tentar novamente', async () => {
    const user = userEvent.setup();
    const getCatalog = vi.fn().mockRejectedValueOnce(new CatalogLoadError()).mockResolvedValueOnce(catalog);
    setup({ getCatalog });

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Pessoas' })).toBeInTheDocument());
  });
});
