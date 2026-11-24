import { CatalogValidationError } from '../../../domain/errors';

export function LoadingState() {
  return (
    <div className="skeletons" aria-busy="true" aria-label="Carregando serviços">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function EmptyState({ query, filtered = false }: { query: string; filtered?: boolean }) {
  const hasQuery = query.trim() !== '';
  return (
    <div className="state" role="status">
      <h2>Nenhum resultado</h2>
      {hasQuery ? (
        <p>
          Nada encontrado para “{query}”
          {filtered ? ' com os filtros escolhidos' : ''}. Tente outro termo, como “ponto”, “benefícios” ou “chamado”.
        </p>
      ) : (
        <p>Nenhum serviço combina com os filtros escolhidos. Tente remover algum deles.</p>
      )}
    </div>
  );
}

export function PersonalEmptyState({ screenName, onCustomize }: { screenName: string; onCustomize: () => void }) {
  return (
    <div className="state" role="status">
      <h2>{screenName} está vazia</h2>
      <p>Toque na estrela ☆ de um serviço ou escolha vários de uma vez, incluindo cursos externos.</p>
      <button type="button" className="btn btn--accent" onClick={onCustomize}>
        Personalizar minha tela
      </button>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const detail = error instanceof CatalogValidationError ? error.issues.join('\n') : null;
  return (
    <div className="state" role="alert">
      <h2>Não foi possível carregar o catálogo</h2>
      <p>{error.message}</p>
      {detail && <pre className="state__detail">{detail}</pre>}
      <button type="button" className="btn" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}
