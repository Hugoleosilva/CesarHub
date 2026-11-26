import { ASSISTANT } from '../../../config/assistant';

/** Botão fixo no canto da tela: abre a conversa com o assistente direto no aplicativo do Slack. */
export function AssistantButton() {
  return (
    <a className="assistant" href={ASSISTANT.url}>
      <img className="assistant__img" src={ASSISTANT.image} alt="" width={56} height={56} />
      <span className="assistant__text">
        <span className="assistant__ask">E aí? Tu ainda não se achou? </span>
        <strong>Fala com o {ASSISTANT.name}!</strong>
      </span>
      <span className="visually-hidden"> (abre o aplicativo do Slack)</span>
    </a>
  );
}
