import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(async ({ command }) => {
  const plugins = [
    react(), 
    tailwindcss(),
  ];

  if (command === 'build') {
    try {
      const { VitePWA } = await import('vite-plugin-pwa');
      plugins.push(
        VitePWA({
          registerType: 'autoUpdate',
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
            clientsClaim: true,
            skipWaiting: true,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
            globIgnores: ['**/kauthar.json', '**/tafseer_kauthar/**', '**/tafseer_kauthar_refined/**'],
            maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
          }
        })
      );
    } catch (e) {
      console.warn('VitePWA could not be loaded:', e);
    }
  }

  return {
    plugins,
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
  };
});

