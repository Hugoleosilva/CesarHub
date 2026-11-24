import type { Catalog, Service } from '../../../domain/service';

/** `guide`: o card de Orientações da área está visível? Indefinido na tela personalizada, que não tem esse card. */
export type SectionRow = { id: string; label: string; visible: boolean; guide?: boolean };

type AreasProps = {
  sections: readonly SectionRow[];
  onToggleSection: (id: string) => void;
  onToggleGuide: (id: string) => void;
  onMoveSection: (id: string, direction: -1 | 1) => void;
};

/** Quais áreas aparecem no início, em que ordem e se mostram o card de Orientações. */
export function AreasPicker({ sections, onToggleSection, onToggleGuide, onMoveSection }: AreasProps) {
  return (
    <fieldset className="pick">
      <legend>Áreas na tela</legend>
      <p className="dialog__hint">
        Escolha quais áreas aparecem no início e em que ordem. “Orientações” é o primeiro card de cada área: desmarque se não quiser vê-lo. A busca continua encontrando tudo.
      </p>
      {sections.map((section, index) => (
        <div key={section.id} className="pick__item pick__item--link">
          <label className="pick__check">
            <input type="checkbox" checked={section.visible} onChange={() => onToggleSection(section.id)} />
            <strong>{section.label}</strong>
          </label>
          {section.guide !== undefined && (
            <label className="pick__check pick__check--small">
              <input
                type="checkbox"
                aria-label={`Card de Orientações em ${section.label}`}
                checked={section.guide}
                onChange={() => onToggleGuide(section.id)}
              />
              Orientações
            </label>
          )}
          <span className="pick__buttons">
            <button type="button" className="btn btn--small" aria-label={`Mover ${section.label} para cima`} disabled={index === 0} onClick={() => onMoveSection(section.id, -1)}>
              ↑
            </button>
            <button type="button" className="btn btn--small" aria-label={`Mover ${section.label} para baixo`} disabled={index === sections.length - 1} onClick={() => onMoveSection(section.id, 1)}>
              ↓
            </button>
          </span>
        </div>
      ))}
    </fieldset>
  );
}

type ServicesProps = {
  catalog: Catalog;
  selectedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
};

/** Marca os serviços oficiais que entram na tela personalizada. */
export function ServicesPicker({ catalog, selectedIds, onToggle }: ServicesProps) {
  return (
    <>
      {catalog.map((category) => (
        <fieldset key={category.name} className="pick">
          <legend>{category.name}</legend>
          {category.items.map((service) => (
            <label key={service.id} className="pick__item">
              <input type="checkbox" checked={selectedIds.has(service.id)} onChange={() => onToggle(service.id)} />
              <span>
                <strong>{service.title}</strong>
                <small>{service.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
      ))}
    </>
  );
}

type LinksProps = {
  links: readonly Service[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

/** Cursos e sites externos do próprio usuário. */
export function ExternalLinksPicker({ links, onAdd, onEdit, onRemove }: LinksProps) {
  return (
    <fieldset className="pick">
      <legend>Cursos e links externos</legend>
      <p className="dialog__hint">Ex.: Udemy, Alura, YouTube ou qualquer site que você use.</p>
      {links.map((link) => (
        <div key={link.id} className="pick__item pick__item--link">
          <span>
            <strong>{link.title}</strong>
            <small>{link.description}</small>
          </span>
          <span className="pick__buttons">
            <button type="button" className="btn btn--small" aria-label={`Editar link ${link.title}`} onClick={() => onEdit(link.id)}>
              Editar
            </button>
            <button type="button" className="btn btn--small" aria-label={`Remover link ${link.title}`} onClick={() => onRemove(link.id)}>
              Remover
            </button>
          </span>
        </div>
      ))}
      <button type="button" className="btn btn--small pick__add" onClick={onAdd}>
        + Adicionar link externo
      </button>
    </fieldset>
  );
}
