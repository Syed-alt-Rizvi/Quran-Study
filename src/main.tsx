import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Production build and cache tracking
const currentBuildId = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev';

// Auto-recover from stale chunks when a new build is published in AI Studio
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Gracefully absorb benign network, aborted audio, or background fetch rejections
    if (!event.reason || event.reason?.name === 'AbortError' || event.reason?.message?.includes?.('aborted')) {
      event.preventDefault();
      return;
    }
    console.warn('Unhandled rejection absorbed safely:', event.reason);
    event.preventDefault();
  });

  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error (new build published), reloading newest assets...', event);
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('dynamically imported module') ||
       event.message.includes('Importing a module script failed') ||
       event.message.includes('Loading chunk'))
    ) {
      console.warn('Stale asset chunk error caught, refreshing to newest published build...');
      window.location.reload();
    }
  });

  // Verify and purge outdated shell caches if build version changed
  try {
    const savedBuildId = localStorage.getItem('shia_app_build_id');
    if (savedBuildId && savedBuildId !== currentBuildId && 'caches' in window) {
      window.caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.includes('app-shell') || key.includes('workbox-precache')) {
            window.caches.delete(key).catch(() => {});
          }
        }
      }).catch(() => {});
    }
    localStorage.setItem('shia_app_build_id', currentBuildId);
  } catch {}
}

// Clean up any stale service workers in development to prevent module interception
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  } else {
    // Production PWA Service Worker Registration & Cache Sanitization
    if ('caches' in window) {
      window.caches.keys().then((keys) => {
        for (const key of keys) {
          if (
            key === 'tafseer-namoona-cache' ||
            key === 'tafseer-namoona-v2-cache' ||
            key === 'tafseer-namoona-api-cache'
          ) {
            window.caches.delete(key).catch(() => {});
          }
        }
      }).catch(() => {});
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((registration) => {
        // If a worker is already waiting, tell it to take over immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Proactively check for new builds right away
        registration.update().catch(() => {});

        // Re-check for updates whenever user returns to the tab or focuses the app
        const checkForUpdates = () => {
          registration.update().catch(() => {});
        };

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkForUpdates();
          }
        });
        window.addEventListener('focus', checkForUpdates);

        // Periodically check for published updates every 30 seconds
        setInterval(checkForUpdates, 30 * 1000);

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            });
          }
        });
      }).catch((err) => {
        console.warn('PWA service worker registration notice:', err);
      });
    });

    // Reload when controller changes to activate the newest build seamlessly
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
