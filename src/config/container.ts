import { makeGetCatalog } from '../application/useCases/getCatalog';
import { JsonCatalogRepository } from '../infrastructure/JsonCatalogRepository';
import { LocalStorageCustomLinksRepository } from '../infrastructure/LocalStorageCustomLinksRepository';
import { LocalStorageFavoritesRepository } from '../infrastructure/LocalStorageFavoritesRepository';
import { LocalStorageGuideNotesRepository } from '../infrastructure/LocalStorageGuideNotesRepository';
import { LocalStorageLayoutRepository } from '../infrastructure/LocalStorageLayoutRepository';
import { LocalStorageScreenNameRepository } from '../infrastructure/LocalStorageScreenNameRepository';

export const getCatalog = makeGetCatalog(new JsonCatalogRepository());
export const favoritesRepository = new LocalStorageFavoritesRepository();
export const customLinksRepository = new LocalStorageCustomLinksRepository();
export const screenNameRepository = new LocalStorageScreenNameRepository();
export const layoutRepository = new LocalStorageLayoutRepository();
export const guideNotesRepository = new LocalStorageGuideNotesRepository();
