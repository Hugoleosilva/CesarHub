export interface ScreenNameRepository {
  /** Retorna o nome salvo, ou null se o usuário nunca renomeou. */
  load(): string | null;
  save(name: string): void;
}
