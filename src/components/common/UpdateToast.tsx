import { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { getApiUrl } from '../../utils/apiBase';

export default function UpdateToast() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const bundledVersion = typeof __APP_BUILD_ID__ !== 'undefined' ? String(__APP_BUILD_ID__) : 'dev';

  useEffect(() => {
    let isMounted = true;

    // Check version against the server
    const checkServerVersion = async () => {
      try {
        const urlsToTry = [
          getApiUrl(`/api/version?_t=${Date.now()}`),
        ];

        // If running on a forwarded domain or external host, also check canonical backend directly
        if (
          typeof window !== 'undefined' &&
          !window.location.hostname.includes('ai.studio') &&
          !window.location.hostname.includes('localhost') &&
          !window.location.hostname.includes('127.0.0.1')
        ) {
          urlsToTry.push(`https://quran-study.ai.studio/api/version?_t=${Date.now()}`);
        }

        for (const url of urlsToTry) {
          try {
            const res = await fetch(url, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' }
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (!data?.version) continue;

            const serverVer = String(data.version);
            // If bundled version does not match server version, a new release is live!
            if (bundledVersion !== 'dev' && serverVer !== bundledVersion) {
              if (isMounted) {
                setUpdateAvailable(true);
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then((reg) => {
                    reg?.update().catch(() => {});
                  }).catch(() => {});
                }
              }
              break;
            }
          } catch {}
        }
      } catch {
        // Silently ignore offline or temporary network errors
      }
    };

    // Run first check after 2 seconds, then every 30 seconds
    const initialTimer = setTimeout(checkServerVersion, 2000);
    const interval = setInterval(checkServerVersion, 30000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [bundledVersion]);

  const handleUpdate = async () => {
    try {
      if (typeof window !== 'undefined') {
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of registrations) {
              if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              await reg.update().catch(() => {});
            }
          } catch {}
        }
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            for (const key of keys) {
              await caches.delete(key).catch(() => {});
            }
          } catch {}
        }
        // Force navigation with cache-busting timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('_v', Date.now().toString());
        window.location.href = url.toString();
        return;
      }
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-800/95 dark:bg-emerald-950/95 text-white px-4 py-2.5 rounded-full shadow-2xl border border-emerald-500/30 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[90vw] text-xs sm:text-sm font-medium"
    >
      <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
      <span>New version published!</span>
      <button
        onClick={handleUpdate}
        className="px-3.5 py-1 bg-white text-emerald-900 rounded-full font-bold hover:bg-emerald-50 transition active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
      >
        <RefreshCw size={13} className="animate-spin text-emerald-700" style={{ animationDuration: '4s' }} />
        <span>Update Now</span>
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-emerald-200 hover:text-white transition rounded-full shrink-0 cursor-pointer"
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
