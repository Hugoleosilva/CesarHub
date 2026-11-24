export interface FavoritesRepository {
  load(): string[];
  save(ids: readonly string[]): void;
}
