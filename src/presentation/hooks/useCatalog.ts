import { useCallback, useEffect, useState } from 'react';
import type { GetCatalog } from '../../application/useCases/getCatalog';
import type { Catalog } from '../../domain/service';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; catalog: Catalog };

export function useCatalog(getCatalog: GetCatalog) {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getCatalog(controller.signal)
      .then((catalog) => setState({ status: 'ready', catalog }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, [getCatalog, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
