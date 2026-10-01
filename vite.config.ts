import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(async ({ command }): Promise<any> => {
  // Generate unified build identifier
  const buildId = process.env.BUILD_TIME || Date.now().toString();

  // Ensure public/build_id.txt exists so server and client always match
  try {
    const publicDir = path.resolve(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'build_id.txt'), buildId, 'utf-8');
  } catch (e) {}

  const plugins: any[] = [
    react(), 
    tailwindcss(),
  ];

  if (command === 'build') {
    try {
      const { VitePWA } = await import('vite-plugin-pwa');
      plugins.push(
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: false,
          includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'favicon.ico', 'manifest.webmanifest'],
          manifest: {
            id: '/',
            name: 'Shia Markaz',
            short_name: 'Shia Markaz',
            description: 'Comprehensive Shia Markaz platform featuring the Holy Quran, Shia Tafseer (Namoona & Al-Kauthar), authentic Mafatih Al Jinan supplications & ziyaraat with audio recitations, scientific insights from the Ahlulbayt (a.s), and community discussions.',
            theme_color: '#059669',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            scope: '/',
            categories: ['books', 'education', 'reference'],
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ]
          },
          workbox: {
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            skipWaiting: true,
            navigateFallback: null,
            // Exclude html from precache so index.html is NEVER locked into an outdated CacheFirst state
            globPatterns: ['**/*.{js,css,ico,png,svg,webmanifest,woff,woff2}'],
            globIgnores: ['**/index.html', '**/kauthar.json', '**/tafseer_kauthar/**', '**/tafseer_kauthar_refined/**'],
            maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            runtimeCaching: [
              {
                // Navigation requests (HTML): Always try network first (1.5s timeout) so newly published updates load immediately on launch!
                urlPattern: ({ request }) => request.mode === 'navigate',
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'app-shell-html-cache',
                  networkTimeoutSeconds: 1.5,
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\/mafatih_index\.json$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'mafatih-index-cache',
                  expiration: {
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                  }
                }
              },
              {
                urlPattern: /\/mafatih_items\/.*\.json$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'mafatih-items-cache',
                  expiration: {
                    maxEntries: 600,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              },
              {
                urlPattern: /\/tafseer_namoona\/.*\.json$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'tafseer-namoona-v5-cache',
                  expiration: {
                    maxEntries: 114,
                    maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  }
                }
              },
              {
                urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'quran-api-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              }
            ]
          }
        })
      );
    } catch (e) {
      console.warn('VitePWA could not be loaded:', e);
    }
  }

  return {
    plugins,
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'esnext',
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/react-markdown')) {
              return 'vendor-markdown';
            }
            if (id.includes('node_modules/zustand')) {
              return 'vendor-state';
            }
          }
        }
      }
    },
  };
});
