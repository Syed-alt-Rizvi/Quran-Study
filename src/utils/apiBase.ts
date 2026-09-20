import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string) => {
  // If configured via VITE_BACKEND_URL, use that base URL.
  // Otherwise use relative paths which work for both web and local proxies.
  const configured = import.meta.env.VITE_BACKEND_URL;
  const baseUrl = configured || '';
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
};
