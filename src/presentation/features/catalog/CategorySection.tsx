import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Category } from '../../../domain/service';
import { Carousel } from './Carousel';
import { ServiceCard } from './ServiceCard';

type Props = {
  category: Category;
  /** "row" é o carrossel da home; "grid" mostra tudo de uma vez. */
  variant: 'row' | 'grid';
  favoriteIds: ReadonlySet<string>;
  onToggleFavorite: (id: string) => void;
  onSeeAll?: () => void;
  /** Na visão completa de uma área: volta às fileiras do início. */
  onBack?: () => void;
  /** Itens do próprio usuário (links externos): trocam a estrela por editar/remover. */
  managedIds?: ReadonlySet<string>;
  onEditItem?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  /** Card extra no início da área (o card de Orientações). */
  leading?: ReactNode;
};

export function CategorySection({
  category,
  variant,
  favoriteIds,
  onToggleFavorite,
  onSeeAll,
  onBack,
  managedIds,
  onEditItem,
  onRemoveItem,
  leading,
}: Props) {
  const headingId = useId();
  const cards = [
    leading,
    ...category.items.map((service) => {
      const managed = managedIds?.has(service.id) ?? false;
      return (
        <ServiceCard
          key={service.id}
          service={service}
          isFavorite={favoriteIds.has(service.id)}
          onToggleFavorite={onToggleFavorite}
          onEdit={managed ? onEditItem : undefined}
          onRemove={managed ? onRemoveItem : undefined}
        />
      );
    }),
  ];

  return (
    <section className="category" aria-labelledby={headingId}>
      <div className="category__head">
        <h2 id={headingId} className="category__title">
          {category.name}
        </h2>
        {variant === 'row' && onSeeAll && (
          <button type="button" className="link-btn" onClick={onSeeAll}>
            Ver todos ›
          </button>
        )}
        {variant === 'grid' && onBack && (
          <button type="button" className="link-btn" onClick={onBack}>
            ‹ Voltar ao início
          </button>
        )}
      </div>
      {variant === 'row' ? <Carousel>{cards}</Carousel> : <div className="grid">{cards}</div>}
    </section>
  );
}
