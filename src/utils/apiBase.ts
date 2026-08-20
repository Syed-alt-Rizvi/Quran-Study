import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string) => {
  // If we are in the Capacitor native app, point to the live backend URL
  // Otherwise, fallback to an env variable or current origin (handled automatically by relative path)
  const isNative = Capacitor.isNativePlatform();
  const baseUrl = isNative 
    ? 'https://ais-pre-jx76sn2jydycu7xlncbv7z-1063163461455.asia-southeast1.run.app'
    : '';
  
  return `${baseUrl}${path}`;
}
