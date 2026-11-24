/** Pessoa a procurar quando a pessoa não conseguir resolver sozinha. */
export type Contact = {
  readonly name: string;
  readonly role?: string;
  readonly email?: string;
  readonly slack?: string;
  readonly phone?: string;
};

/** Um cenário do serviço, ex.: "Inclusão" e "Exclusão" no plano de saúde. */
export type GuideCase = {
  readonly title: string;
  readonly steps: readonly string[];
};

/** Orientações: como fazer, onde acessar e quem procurar. */
export type Guide = {
  readonly where?: string;
  /** Página com as orientações completas, quando já existe uma (ex.: Confluence). */
  readonly url?: string;
  /** Apresentação da equipe responsável, exibida acima da lista de contatos. */
  readonly contactsIntro?: string;
  readonly cases: readonly GuideCase[];
  readonly contacts: readonly Contact[];
};

export type Service = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly image: string;
  readonly type: string;
  readonly keywords: readonly string[];
  /** Assuntos do serviço (lista curada), usados no filtro "Tópicos". */
  readonly topics?: readonly string[];
  /** Aparece no banner de destaque (comunicados e portais sazonais). */
  readonly featured: boolean;
  /** Quando existe, o card abre as orientações em vez de ir direto ao link. */
  readonly guide?: Guide;
};

export type Category = {
  readonly name: string;
  readonly items: readonly Service[];
  /** Capa do card de Orientações da área (o primeiro card, que resume links e responsáveis). */
  readonly guideImage?: string;
};

export type Catalog = readonly Category[];
