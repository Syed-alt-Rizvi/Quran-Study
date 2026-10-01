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

  // 3. In web browsers (including custom domains like shiatafseer.in or localhost),
  // relative paths ALWAYS work directly without cross-origin issues or dead hardcoded domains!
  return cleanPath;
};
