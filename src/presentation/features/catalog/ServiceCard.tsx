import type { Service } from '../../../domain/service';
import { CoverImage } from '../../components/ui/CoverImage';

type Props = {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  /** Quando presentes (links pessoais), substituem a estrela por editar/remover. */
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
};

/** Clicar no card sempre abre o link do serviço; as orientações ficam no card "Orientações" da área. */
export function ServiceCard({ service, isFavorite, onToggleFavorite, onEdit, onRemove }: Props) {
  const managed = Boolean(onEdit && onRemove);
  const label = isFavorite
    ? `Remover ${service.title} dos favoritos`
    : `Adicionar ${service.title} aos favoritos`;

  return (
    <div className="card-wrap">
      <a className="card" href={service.url} target="_blank" rel="noopener noreferrer">
        <div className="card__media">
          <CoverImage src={service.image} />
          <div className="card__shade" aria-hidden="true" />
          <span className="card__cta" aria-hidden="true">
            Acessar ›
          </span>
        </div>
        <div className="card__body">
          <h3 className="card__title">{service.title}</h3>
          <p className="card__meta">
            <span className="meta__icon" aria-hidden="true" />
            {service.type}
          </p>
          <p className="card__desc">{service.description}</p>
        </div>
      </a>
      {managed ? (
        <div className="card-actions">
          <button type="button" className="mini-btn" aria-label={`Editar ${service.title}`} title="Editar" onClick={() => onEdit?.(service.id)}>
            ✎
          </button>
          <button type="button" className="mini-btn" aria-label={`Remover ${service.title}`} title="Remover" onClick={() => onRemove?.(service.id)}>
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={isFavorite ? 'fav is-on' : 'fav'}
          aria-pressed={isFavorite}
          aria-label={label}
          title={label}
          onClick={() => onToggleFavorite(service.id)}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
    </div>
  );
}
