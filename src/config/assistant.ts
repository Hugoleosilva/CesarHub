/**
 * O assistente de IA do CESAR, que já vive no Slack: o Hub só leva a pessoa até a conversa.
 * O link `slack://` abre direto o aplicativo do Slack instalado; os IDs identificam o workspace e o usuário do Cesinha
 * (não são segredos).
 */
const WORKSPACE_ID = 'T02FSLY4W';
const ASSISTANT_USER_ID = 'U0CEE3R387Q';

export const ASSISTANT = {
  name: 'Cesinha',
  url: `slack://user?team=${WORKSPACE_ID}&id=${ASSISTANT_USER_ID}`,
  image: '/assistente/cesinha.webp',
} as const;
