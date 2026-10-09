import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Explicit environment variable takes precedence
  const configured = import.meta.env.VITE_BACKEND_URL;
  if (configured) {
    const cleanBase = configured.replace(/\/+$/, '');
    return `${cleanBase}${cleanPath}`;
  }

  // 2. Custom backend override saved in localStorage
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('shia_custom_backend_url');
      if (custom && custom.startsWith('http')) {
        const cleanBase = custom.replace(/\/+$/, '');
        return `${cleanBase}${cleanPath}`;
      }
    } catch {}
  }

  // 3. In native mobile apps (Capacitor APK), localhost has no Express server.
  // Route to the deployed cloud backend if running natively.
  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    const cloudBackend = 'https://ais-dev-jx76sn2jydycu7xlncbv7z-1063163461455.asia-southeast1.run.app';
    return `${cloudBackend}${cleanPath}`;
  }

  // 4. In web browsers (including custom domains or preview), relative paths work directly!
  return cleanPath;
};
