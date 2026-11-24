export class CatalogLoadError extends Error {
  constructor(message = 'Não foi possível carregar o catálogo de serviços.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'CatalogLoadError';
  }
}

export class CatalogValidationError extends Error {
  constructor(
    readonly issues: readonly string[],
    options?: ErrorOptions,
  ) {
    super(`Catálogo inválido: ${issues.join('; ')}`, options);
    this.name = 'CatalogValidationError';
  }
}
