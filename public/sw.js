// Shia Markaz PWA Service Worker
const CACHE_VERSION = 'shia-markaz-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

// Core static assets to precache for offline shell
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some precache assets could not be cached immediately:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Skip browser extensions and chrome-extension:// schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML documents): Network first, falling back to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Google Fonts & CDN resources: Cache first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('cdn.islamic.network')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes.clone());
            }
            return networkRes;
          }).catch(() => cached);
        });
      })
    );
    return;
  }

  // 3. Mafatih, Tafseer, and Quran JSON data: Stale while revalidate
  if (
    url.pathname.endsWith('.json') ||
    url.pathname.includes('/tafseer_') ||
    url.pathname.includes('/mafatih_') ||
    url.hostname.includes('api.alquran.cloud')
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(req).then((cached) => {
          const fetchPromise = fetch(req)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                cache.put(req, networkRes.clone());
              }
              return networkRes;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Static images and icons: Cache first with network fallback
  if (
    req.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/i)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes.clone());
            }
            return networkRes;
          }).catch(() => cached);
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
