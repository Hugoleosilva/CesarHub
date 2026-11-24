import { useEffect, useId, useRef } from 'react';
import type { RefObject } from 'react';
import type { GuideNote, NoteDraft } from '../../../domain/guideNotes';
import type { Service } from '../../../domain/service';
import { CoverImage } from '../../components/ui/CoverImage';
import { GuideSections } from './GuideSections';
import { NotesSection } from './NotesSection';

type Props = {
  service: Service;
  /** Anotação pessoal do usuário sobre este serviço, se houver. */
  note?: GuideNote;
  onSaveNote: (draft: NoteDraft) => void;
  onBack: () => void;
};

/** Tela de detalhe do serviço (estilo KnowBe4): capa, tipo, descrição, como fazer, a quem procurar e anotações. */
export function ServiceDetail({ service, note, onSaveNote, onBack }: Props) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    window.scrollTo(0, 0);
  }, []);

  // Esc volta ao catálogo, a menos que o usuário esteja digitando (para não perder a anotação).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(event.target.tagName);
      if (event.key === 'Escape' && !typing) onBack();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);

  return (
    <section className="detail" aria-labelledby={titleId}>
      <button type="button" className="btn btn--small detail__back" onClick={onBack}>
        ‹ Voltar
      </button>

      <div className="detail__top">
        <div className="detail__media">
          <CoverImage src={service.image} />
        </div>
        <DetailInfo service={service} titleId={titleId} titleRef={titleRef} />
      </div>

      <div className="detail__body">
        {service.guide ? (
          <GuideSections guide={service.guide} />
        ) : (
          <p className="dialog__hint">Ainda não há orientações oficiais para este serviço. Você pode registrar as suas abaixo.</p>
        )}
        <NotesSection note={note} onSave={onSaveNote} />
      </div>
    </section>
  );
}

type InfoProps = { service: Service; titleId: string; titleRef: RefObject<HTMLHeadingElement> };

function DetailInfo({ service, titleId, titleRef }: InfoProps) {
  const topics = service.topics ?? [];
  return (
    <div className="detail__info">
      <span className="tag">{service.type}</span>
      <h2 id={titleId} ref={titleRef} tabIndex={-1}>
        {service.title}
      </h2>
      <p className="detail__desc">{service.description}</p>
      {topics.length > 0 && (
        <ul className="detail__topics" aria-label="Tópicos">
          {topics.map((topic) => (
            <li key={topic} className="tag">
              {topic}
            </li>
          ))}
        </ul>
      )}
      <div className="guide__links">
        <a className="btn btn--accent" href={service.url} target="_blank" rel="noopener noreferrer">
          Acessar {service.title}
        </a>
        {service.guide?.url && (
          <a className="btn" href={service.guide.url} target="_blank" rel="noopener noreferrer">
            Ver orientações completas
          </a>
        )}
      </div>
    </div>
  );
}
