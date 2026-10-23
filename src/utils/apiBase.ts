import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Static assets (.json, .mp3, .m4a, images, or bundled public assets) MUST always load locally!
  const isStaticAsset =
    cleanPath.endsWith('.json') ||
    cleanPath.endsWith('.mp3') ||
    cleanPath.endsWith('.m4a') ||
    cleanPath.endsWith('.png') ||
    cleanPath.endsWith('.jpg') ||
    cleanPath.endsWith('.svg') ||
    cleanPath.startsWith('/audio/') ||
    cleanPath.startsWith('/icons/') ||
    cleanPath.startsWith('/tafseer_') ||
    cleanPath.startsWith('/mafatih_items/');

  if (isStaticAsset) {
    return cleanPath;
  }

  // 2. Explicit environment variable takes precedence for backend API proxying
  const configured = import.meta.env.VITE_BACKEND_URL;
  if (configured) {
    const cleanBase = configured.replace(/\/+$/, '');
    return `${cleanBase}${cleanPath}`;
  }

  // 3. Custom backend override saved in localStorage
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('shia_custom_backend_url');
      if (custom && custom.startsWith('http')) {
        const cleanBase = custom.replace(/\/+$/, '');
        return `${cleanBase}${cleanPath}`;
      }
    } catch {}
  }

  // 4. On native Android/iOS APK, fallback to production Cloud Run backend for dynamic API requests
  if (Capacitor.isNativePlatform()) {
    const cloudBackend = 'https://ais-pre-jx76sn2jydycu7xlncbv7z-1063163461455.asia-southeast1.run.app';
    return `${cloudBackend}${cleanPath}`;
  }

  // 5. Default to relative clean path (works in web, PWA, and local webview)
  return cleanPath;
};
