import { coverFor } from '../../../domain/customLinks';
import { CoverImage } from '../../components/ui/CoverImage';

type Props = {
  area: string;
  image?: string;
  onOpen: () => void;
};

/** Primeiro card de cada área: resume links e responsáveis. É um botão; os demais cards são links diretos. */
export function GuideCard({ area, image, onOpen }: Props) {
  return (
    <div className="card-wrap">
      <button type="button" className="card card--guide" aria-label={`Orientações de ${area}`} aria-haspopup="dialog" onClick={onOpen}>
        <div className="card__media">
          <CoverImage src={image ?? coverFor(area)} />
          <div className="card__shade" aria-hidden="true" />
          <span className="card__cta" aria-hidden="true">
            Abrir ›
          </span>
        </div>
        <div className="card__body">
          <h3 className="card__title">Orientações</h3>
          <p className="card__meta">
            <span className="meta__icon" aria-hidden="true" />
            Guia
          </p>
          <p className="card__desc">Como fazer e a quem procurar em {area}.</p>
        </div>
      </button>
    </div>
  );
}
