import type { Category, Service } from '../../../domain/service';
import { Modal } from '../../components/ui/Modal';

type Props = {
  category: Category;
  /** Abre a tela de detalhe do serviço (passos, contatos e anotações pessoais). */
  onOpenService: (service: Service) => void;
  onClose: () => void;
};

/** Resumo da área: cada serviço com o link de acesso e os responsáveis. */
export function AreaGuideDialog({ category, onOpenService, onClose }: Props) {
  return (
    <Modal title={`Orientações de ${category.name}`} onClose={onClose} wide>
      <p className="dialog__hint">Onde acessar cada serviço e a quem procurar se não conseguir resolver sozinho.</p>

      <ul className="dialog__body area-guide">
        {category.items.map((service) => (
          <AreaGuideItem key={service.id} service={service} onOpen={() => onOpenService(service)} />
        ))}
      </ul>

      <div className="dialog__actions">
        <button type="button" className="btn" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

function AreaGuideItem({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const contacts = service.guide?.contacts ?? [];
  return (
    <li className="area-guide__item">
      <div className="area-guide__head">
        <strong>{service.title}</strong>
        <span className="tag">{service.type}</span>
      </div>
      <p className="area-guide__desc">{service.description}</p>

      {contacts.length > 0 ? (
        <p className="area-guide__contacts">
          <span>Procurar:</span>
          {contacts.map((contact) =>
            contact.email ? (
              <a key={contact.name} href={`mailto:${contact.email}`} title={contact.email}>
                {contact.name}
              </a>
            ) : (
              <span key={contact.name}>{contact.name}</span>
            ),
          )}
        </p>
      ) : (
        service.guide?.contactsIntro && <p className="area-guide__desc">{service.guide.contactsIntro}</p>
      )}

      <div className="guide__links">
        <a className="btn btn--small btn--accent" href={service.url} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${service.title}`}>
          Acessar
        </a>
        {service.guide?.url && (
          <a className="btn btn--small" href={service.guide.url} target="_blank" rel="noopener noreferrer" aria-label={`Orientações completas de ${service.title}`}>
            Orientações completas
          </a>
        )}
        <button type="button" className="btn btn--small" aria-label={`Detalhes e anotações de ${service.title}`} onClick={onOpen}>
          Detalhes e anotações
        </button>
      </div>
    </li>
  );
}
