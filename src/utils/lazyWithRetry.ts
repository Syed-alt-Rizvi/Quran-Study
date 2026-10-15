import { lazy, ComponentType } from 'react';

/**
 * Resilient dynamic component loader with retry logic and chunk mismatch auto-recovery.
 * Prevents "Failed to fetch dynamically imported module" errors during network hiccups
 * or when app updates change chunk hashes.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName: string = 'Component',
  retries: number = 3,
  interval: number = 750
) {
  return lazy(async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await factory();
      } catch (err: any) {
        attempt++;
        console.warn(`[LazyRetry] Failed loading ${componentName} (attempt ${attempt}/${retries}):`, err);

        if (attempt >= retries) {
          const isChunkOrFetchError =
            err?.name === 'ChunkLoadError' ||
            err?.message?.includes('Failed to fetch dynamically imported module') ||
            err?.message?.includes('error loading dynamically imported module') ||
            err?.message?.includes('Importing a module script failed');

          if (isChunkOrFetchError && typeof window !== 'undefined') {
            const reloadKey = `chunk_reload_${componentName}`;
            const lastReload = sessionStorage.getItem(reloadKey);
            const now = Date.now();

            // Prevent infinite reload loops: allow at most one reload every 25 seconds
            if (!lastReload || now - parseInt(lastReload, 10) > 25000) {
              sessionStorage.setItem(reloadKey, now.toString());
              console.warn(`[LazyRetry] Dynamic chunk mismatch detected. Auto-reloading page for fresh assets...`);
              window.location.reload();
              return new Promise<{ default: T }>(() => {});
            }
          }
          throw err;
        }

        // Delay with slight exponential backoff
        await new Promise((resolve) => setTimeout(resolve, interval * attempt));
      }
    }
    return factory();
  });
}
