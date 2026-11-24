# CESAR Hub

PWA estático (Vite + React + TypeScript) que centraliza os serviços internos em um catálogo visual.

## Arquitetura (dependências apontam para dentro)

`presentation → application → domain` e `infrastructure → application/domain`

- `src/domain`: tipos, regras de busca, erros. Funções puras, sem React/Zod (o ESLint bloqueia).
- `src/application`: portas (`CatalogRepository`) e casos de uso.
- `src/infrastructure`: implementações (`JsonCatalogRepository`, validação Zod).
- `src/presentation`: componentes, hooks, estilos.
- `src/config/container.ts`: único lugar que liga implementações às portas.

## Estrutura da presentation

`App.tsx`, `MainContent.tsx` e `AppDialogs.tsx` só compõem. O resto fica em `features/<assunto>/` (shell, catalog, guide,
customize), peças reutilizáveis em `components/ui/` (Modal, TextField…) e estado em `hooks/`. Janela nova usa `Modal`; campo
de formulário novo usa `TextField`.

## Regras

- Dados vivem em `public/data/services.json`; nunca hardcode serviços no código.
- Erros tipados em `domain/errors.ts`; a UI trata `CatalogLoadError` e `CatalogValidationError`.
- Toda regra nova de domínio tem teste em `*.test.ts` ao lado do arquivo.
- O ESLint barra code smells (complexidade > 10, função > 80 linhas, arquivo > 200, > 4 parâmetros, aninhamento > 3).
  Se estourar, divida o código; não suba o limite.
- Antes de concluir: `npm run lint && npm run typecheck && npm test && npm run build`.

## Adicionar serviço

1. Edite `public/data/services.json` (ids únicos, URL válida).
2. Coloque a **foto** original em `public/images/` e rode `npm run images`: ele gera `public/covers/<nome>.webp`
   (maior lado até 1280px, proporção original preservada, ~70 KB) e só processa o que é novo ou mudou (`--force`
   reprocessa tudo). Aponte `image` para `/covers/<nome>.webp`. Para as ilustrações antigas com moldura escura use
   `--inset=0.055`. O recorte é feito pelo CSS, então fotos verticais e horizontais funcionam.
   Prefixo do nome = área (`pessoas_`, `solicitacao_`, `ferramentas_`, `aprendizagem_`, `1_orientacoes_` para os guias).

## Visual dos cards

- Cartão no estilo do KnowBe4 (que a equipe já conhece) com pegada de Netflix: imagem quase quadrada (1:1) em
  cima com sombra suave na base, título, tipo e descrição embaixo, fundo escuro. Ao passar o mouse: a imagem dá
  zoom, o card cresce e aparece o botão laranja "Acessar". Setas redondas e brancas ficam sempre visíveis.
  As cores do cartão vêm dos tokens `--card-*`, então o tema claro vira o KnowBe4 claro.
- O banner do topo é largo e cinematográfico: foto inteira com gradiente preto da esquerda e de baixo.
- Melhor foto para o card: quadrada, ou de qualquer proporção com o assunto no centro (o card mostra o meio).
  No banner, prefira fotos horizontais.
- Filtros acima das fileiras: **Tipos de conteúdo** (vem do campo `type`) e **Tópicos** (campo `topics`, lista curada
  por serviço). Dentro de cada lista vale "qualquer um"; entre as duas vale "e". Com filtro ativo, os cards de
  Orientações somem. Serviços sem `topics` não aparecem quando se filtra por tópico.
- Capas atuais: ícones sóbrios em SVG (fundo escuro, brilho discreto na cor da área, símbolo no centro), gerados por
  `npm run assets` (`scripts/generate-covers.mjs`, um símbolo por id) em `public/covers/<prefixo>_<id>.svg`. Capa `.svg` conta
  como provisória: ao trocar por foto real (`npm run images`) o card sobe sozinho. As ilustrações coloridas antigas e seus
  originais ficam em `arquivo/ilustracoes-coloridas/` (fora do app).
- A imagem é decorativa (`alt=""`): o título e a descrição do card é que nomeiam o conteúdo.
3. Preencha `topics` (assuntos, ex.: "Benefícios", "Férias e folgas"): é o que alimenta o filtro Tópicos.
   Reuse os mesmos nomes entre serviços; "Benefícios" e "Beneficios" viram dois tópicos diferentes.
4. Opcional: `guide` com `where`, `url` (página completa), `contactsIntro`, `cases` (título + passos) e
   `contacts` (nome, cargo, e-mail, slack, telefone).
   `src/infrastructure/servicesJson.test.ts` valida o arquivo (inclusive se as capas existem): rode `npm test` depois de editar.

## Ordem dos cards

- Em cada área, serviços com capa de verdade (webp/png/jpg) aparecem antes dos que ainda usam a capa provisória
  (`.svg`). Ao trocar a capa de um serviço, ele sobe sozinho; a ordem do `services.json` vale dentro de cada grupo.
- A cor da capa indica a área (prefixo do arquivo: `pessoas_`, `solicitacao_`, `ferramentas_`, `aprendizagem_`);
  um teste garante que cada capa está na área certa e que nenhuma capa de `public/covers/` fica sem uso.

## Orientações

- Clicar em qualquer card de serviço abre o link direto, sempre.
- O primeiro card de cada área é o card de **Orientações** (botão, capa em `guideImage` da categoria). Ele abre um
  resumo da área: link de acesso e responsáveis de cada serviço, com "Detalhes e anotações" para o painel completo
  (`guide` do serviço + anotações pessoais do usuário, salvas no navegador).
- O usuário pode remover o card de Orientações de cada área em Personalizar (`hiddenGuides` no layout).
- Os cards de Orientações não aparecem na busca nem na tela personalizada.
