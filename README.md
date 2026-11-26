# CESAR Hub

> Um só lugar para encontrar os serviços internos do CESAR, com cara de streaming.

O CESAR Hub é um catálogo visual (PWA) que reúne os portais, formulários e ferramentas que as pessoas do CESAR usam no dia a dia: RH, solicitações, ferramentas e aprendizagem. Em vez de lembrar vários links, a pessoa abre o Hub, acha o serviço e clica.

Funciona direto no navegador, instala no computador ou no celular e **não precisa de servidor próprio**: basta publicar a pasta `dist/`.

## O que esperamos do CESAR Hub

| Objetivo | Como o Hub entrega |
| --- | --- |
| **Achar rápido** | Busca sem distinção de acentos (encontra por nome, responsável e passo a passo), filtros por tipo e por tópico. |
| **Saber a quem recorrer** | O card de **Orientações** de cada área mostra onde acessar cada serviço e quem são os responsáveis. |
| **Ir direto ao ponto** | Clicar em um serviço abre o link oficial, sempre. |
| **Ter a própria tela** | Favoritos, links externos (como cursos), anotações e ordem das áreas, salvos só no navegador de cada pessoa. |
| **Manter fácil** | Todo o conteúdo mora em um único arquivo, `public/data/services.json`. Atualizar serviços não exige mexer em código. |
| **Ser confiável** | Dados validados por schema, testes automatizados e limites de qualidade de código no ESLint. |

## Como usar

### Quem usa o Hub

1. **Início:** fileiras por área (Pessoas, Solicitações, Ferramentas, Aprendizagem). Use as setas ou "Ver todos ›" para abrir a área inteira, e "‹ Voltar ao início" para retornar.
2. **Abrir um serviço:** clique no card; o link oficial abre em nova aba.
3. **Orientações:** o primeiro card de cada área resume onde acessar cada serviço e quem procurar. "Detalhes e anotações" abre o passo a passo completo e um campo de anotações pessoais.
4. **Buscar e filtrar:** digite no campo de busca (atalho `/`; `Esc` limpa) ou use **Tipos de conteúdo** e **Tópicos**.
5. **Minha Tela:** marque a estrela de um card para guardá-lo ali. Em **Personalizar** (dentro de Minha Tela) escolha áreas, ordem, nome da tela e inclua links externos.
6. **Tema e instalação:** alterne entre claro e escuro, e use "Instalar App" para ter o Hub como aplicativo. O botão **?** explica tudo isso na própria tela.

### Quem mantém o conteúdo

1. Edite `public/data/services.json` (id único, URL válida, tipo e tópicos; opcionalmente `guide` com passo a passo e responsáveis).
2. Para trocar a capa provisória por uma foto: coloque a imagem em `public/images/` com o prefixo da área (`pessoas_`, `solicitacao_`, `ferramentas_`, `aprendizagem_`), rode `npm run images` e aponte `image` para `/covers/<nome>.webp`.
3. Rode `npm test`: ele aponta erro de digitação, id repetido, capa inexistente ou capa na área errada.

Detalhes completos em [CLAUDE.md](CLAUDE.md).

### Quem desenvolve

Requisitos: Node.js 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:5173/
```

| Comando | Para quê |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | verifica os tipos e gera `dist/` (PWA) |
| `npm run preview` | serve o build localmente |
| `npm test` | testes (Vitest + Testing Library) |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript estrito |
| `npm run images` | converte fotos de `public/images/` em capas otimizadas |
| `npm run assets` | gera os ícones do app e as capas provisórias em SVG |

Antes de entregar: `npm run lint && npm run typecheck && npm test && npm run build`.

## Stacks usadas

| Camada | Tecnologia |
| --- | --- |
| Interface | React 18, TypeScript (modo estrito), CSS puro com variáveis (tokens) |
| Build | Vite 6 |
| PWA | vite-plugin-pwa (Workbox): instalável, funciona offline; o catálogo é buscado na rede primeiro |
| Validação de dados | Zod |
| Testes | Vitest, Testing Library, jsdom |
| Qualidade | ESLint (typescript-eslint, react-hooks), Prettier |
| Imagens | sharp (otimização de capas para WebP) |
| Persistência | `public/data/services.json` (conteúdo) e `localStorage` (preferências de cada pessoa) |

Sem back-end, sem banco de dados e sem dependências de UI de terceiros.

## Arquitetura

As dependências apontam sempre para dentro:

```
presentation → application → domain
infrastructure → application / domain
```

- `src/domain`: tipos e regras puras (busca, filtros, ordem, layout, validação). Sem React nem Zod; o ESLint barra a violação.
- `src/application`: portas (interfaces dos repositórios) e casos de uso.
- `src/infrastructure`: implementações das portas (catálogo em JSON validado com Zod; preferências em `localStorage`, que nunca lançam exceção e revalidam o que leem).
- `src/presentation`: interface, organizada por funcionalidade.
- `src/config/container.ts`: o único lugar que liga implementações às portas.

```
src/presentation/
  App.tsx, MainContent.tsx, AppDialogs.tsx   composição: liga hooks, conteúdo e janelas
  navigation.ts                              abas e identificadores de navegação
  features/
    shell/       cabeçalho, abas, busca e ajuda
    catalog/     fileiras, cards, banner, filtros e contagem de resultados
    guide/       resumo de Orientações da área e tela de detalhe do serviço
    customize/   Personalizar e formulário de link externo
  components/ui/ peças reutilizáveis: Modal, TextField, estados, tema, capa
  hooks/         estado e regras de uso da interface
  styles/        um arquivo CSS por assunto, cores em variáveis (tokens.css)
```

## Qualidade

- **Limites de code smell no ESLint (viram erro):** complexidade até 10, funções até 80 linhas, arquivos até 200, no máximo 4 parâmetros e 3 níveis de aninhamento no código de produção.
- **Testes:** 150+ cobrindo domínio, infraestrutura, interface e o próprio `services.json`.
- **Heurísticas de Nielsen:** avaliadas pelo desenvolvimento (sem teste com usuários reais): visibilidade do estado, controle e liberdade (Voltar, `Esc`), prevenção de erros (confirmação antes de remover), ajuda no botão "?" e demais.
- **Acessibilidade:** HTML semântico, foco devolvido ao fechar janelas, campos com rótulo, imagens decorativas com `alt=""`.

## Decisões

- **Conteúdo fora do código:** os serviços ficam em JSON validado por schema.
- **Sem back-end:** o catálogo muda sem novo deploy do app.
- **Dados pessoais só no navegador:** nada do usuário sai da máquina dele; em troca, não acompanham a pessoa entre dispositivos.
- **Erros tratados na tela:** falha de rede e catálogo inválido têm mensagens próprias, e um `ErrorBoundary` evita tela branca.

## Pendências e limitações

- **Conteúdo incompleto:** 32 dos 40 serviços ainda têm link de exemplo (`exemplo.cesar.org.br` ou `exemplo.zeev.it`) e vários têm a descrição "Descrição a preencher.". Orientações completas existem só para Ponto Eletrônico, Auxílio Creche e Plano de Saúde (este com dados de exemplo).
- **Capas provisórias:** ícones sóbrios gerados por código, a serem trocados por imagens do pacote de identidade do CESAR (confirmar a licença de qualquer ícone de banco externo).
- **Tópicos:** lista proposta pelo desenvolvimento, precisa de validação das áreas.
- **Verificação visual manual:** telas conferidas no Chrome (escuro, claro e celular emulado); sem teste em celulares reais nem com leitor de tela.
