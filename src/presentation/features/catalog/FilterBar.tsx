import { NO_FILTERS, hasFilters } from '../../../domain/filters';
import type { Filters } from '../../../domain/filters';
import { MultiSelect } from './MultiSelect';

type Props = {
  types: readonly string[];
  topics: readonly string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function FilterBar({ types, topics, filters, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filtros">
      <MultiSelect label="Tipos de conteúdo" options={types} selected={filters.types} onChange={(next) => onChange({ ...filters, types: next })} />
      <MultiSelect label="Tópicos" options={topics} selected={filters.topics} onChange={(next) => onChange({ ...filters, topics: next })} />
      {hasFilters(filters) && (
        <button type="button" className="link-btn filters__clear" onClick={() => onChange(NO_FILTERS)}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}
