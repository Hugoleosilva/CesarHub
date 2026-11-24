import { useCallback, useMemo, useState } from 'react';
import type { CustomLinksRepository } from '../../application/ports/CustomLinksRepository';
import { customLinkToService } from '../../domain/customLinks';
import type { CustomLink, LinkDraft } from '../../domain/customLinks';

const newId = () => `custom:${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;

/** Recebe rascunhos já validados pelo domínio (ver LinkFormDialog). */
export function useCustomLinks(repository: CustomLinksRepository) {
  const [links, setLinks] = useState<CustomLink[]>(() => repository.load());

  const commit = useCallback(
    (update: (current: CustomLink[]) => CustomLink[]) =>
      setLinks((current) => {
        const next = update(current);
        repository.save(next);
        return next;
      }),
    [repository],
  );

  const add = useCallback((draft: LinkDraft) => commit((all) => [...all, { id: newId(), ...draft }]), [commit]);
  const update = useCallback(
    (id: string, draft: LinkDraft) => commit((all) => all.map((link) => (link.id === id ? { id, ...draft } : link))),
    [commit],
  );
  const remove = useCallback((id: string) => commit((all) => all.filter((link) => link.id !== id)), [commit]);

  const services = useMemo(() => links.map(customLinkToService), [links]);
  const ids = useMemo(() => new Set(services.map((service) => service.id)), [services]);
  return { links, services, ids, add, update, remove };
}
