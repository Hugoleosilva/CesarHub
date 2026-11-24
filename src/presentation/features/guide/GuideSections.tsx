import type { Guide } from '../../../domain/service';

/** Conteúdo oficial das orientações: onde acessar, como fazer e a quem procurar. */
export function GuideSections({ guide }: { guide: Guide }) {
  const hasContacts = guide.contacts.length > 0 || Boolean(guide.contactsIntro);
  return (
    <>
      {guide.where && (
        <section className="guide__section">
          <h3>Onde acessar</h3>
          <p>{guide.where}</p>
        </section>
      )}
      {guide.cases.length > 0 && <CasesSection cases={guide.cases} />}
      {hasContacts && <ContactsSection guide={guide} />}
    </>
  );
}

function CasesSection({ cases }: { cases: Guide['cases'] }) {
  return (
    <section className="guide__section">
      <h3>Como fazer</h3>
      {cases.map((item) => (
        <div key={item.title} className="guide__case">
          <h4>{item.title}</h4>
          <ol>
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

function ContactsSection({ guide }: { guide: Guide }) {
  return (
    <section className="guide__section">
      <h3>A quem procurar</h3>
      <p className="dialog__hint">{guide.contactsIntro ?? 'Se não conseguir resolver sozinho, fale com:'}</p>
      {guide.contacts.length > 0 && (
        <ul className="guide__contacts">
          {guide.contacts.map((contact) => (
            <li key={contact.name}>
              <strong>{contact.name}</strong>
              {contact.role && <small>{contact.role}</small>}
              <span className="guide__channels">
                {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                {contact.slack && <span>Slack: {contact.slack}</span>}
                {contact.phone && <span>Tel.: {contact.phone}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
