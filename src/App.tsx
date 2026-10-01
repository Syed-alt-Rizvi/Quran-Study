import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSettingsStore } from './store';
import Home from './components/Home';
import AudioPlayer from './components/AudioPlayer';
import UpdateToast from './components/common/UpdateToast';
import { AnimatePresence } from 'motion/react';
import { popModal } from './utils/modalBackHandler';
import { trackAppLaunchAndTelemetry } from './utils/telemetry';
import { checkUrlForTransfer, importUserData } from './utils/dataTransfer';
import { Loader2 } from 'lucide-react';

// Code-split heavy views for instantaneous first paint
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const SurahView = lazy(() => import('./components/SurahView'));
const JuzView = lazy(() => import('./components/JuzView'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const DuaScreen = lazy(() => import('./components/DuaScreen'));
const MafatihItemView = lazy(() => import('./components/MafatihItemView'));

const ViewLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
  </div>
);

export default function App() {
  const { isDarkMode, englishFont, hasSeenWelcome, setHasSeenWelcome } = useSettingsStore();
  
  // Safe initial check checking both localStorage and store so the user is never stuck
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      if (
        localStorage.getItem('shia-quran-has-seen-welcome') === 'true' ||
        localStorage.getItem('quran_welcome_seen') === 'true'
      ) {
        return false;
      }
      const raw = localStorage.getItem('quran-app-settings') || 
                  localStorage.getItem('shia-quran-settings') ||
                  localStorage.getItem('shia_quran_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.hasSeenWelcome) return false;
      }
    } catch (e) {}
    return !hasSeenWelcome;
  });

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [targetAyah, setTargetAyah] = useState<number | null>(null);
  const [targetSurah, setTargetSurah] = useState<number | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [selectedMafatihItem, setSelectedMafatihItem] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileInFrame, setIsMobileInFrame] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const isPreviewOrDev =
          window.location.hostname.includes('run.app') ||
          window.location.hostname.includes('localhost') ||
          window.location.hostname.includes('127.0.0.1');

        if (!isPreviewOrDev) {
          const isFramed = window.self !== window.top;
          const isMobileDevice = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
          if (isFramed && isMobileDevice) {
            setIsMobileInFrame(true);
          }
        }
      } catch {}
    }
  }, []);

  // Sync dark mode class with root documentElement and body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Sync when zustand persist rehydrates
  useEffect(() => {
    if (hasSeenWelcome && showWelcome) {
      setShowWelcome(false);
    }
  }, [hasSeenWelcome, showWelcome]);

  // Idle prefetch secondary views so subsequent navigations are instant
  useEffect(() => {
    const preloader = () => {
      import('./components/SurahView');
      import('./components/JuzView');
      import('./components/Sidebar');
      import('./components/MafatihItemView');
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloader, { timeout: 2000 });
    } else {
      setTimeout(preloader, 800);
    }
  }, []);

  // Parse deep link and check for cross-site transfer payload from URL hash on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user opened a transfer link or sync code from primary/secondary site
    checkUrlForTransfer();

    // Listen for cross-window / iframe data transfer from parent window (for masked forwarding)
    const handleMessage = (e: MessageEvent) => {
      try {
        if (e.data?.type === 'SHIA_MARKAZ_IMPORT_DATA' && e.data.payload) {
          importUserData(e.data.payload);
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash) return () => window.removeEventListener('message', handleMessage);

    if (hash.startsWith('surah-')) {
      const parts = hash.split('-');
      const sId = parseInt(parts[1], 10);
      const aIdx = hash.indexOf('-ayah-');
      const aId = aIdx !== -1 ? parseInt(hash.substring(aIdx + 6), 10) : undefined;
      if (!isNaN(sId) && sId >= 1 && sId <= 114) {
        setSelectedSurah(sId);
        if (aId && !isNaN(aId)) setTargetAyah(aId);
      }
    } else if (hash.startsWith('juz-')) {
      const jId = parseInt(hash.replace('juz-', ''), 10);
      if (!isNaN(jId) && jId >= 1 && jId <= 30) {
        setSelectedJuz(jId);
      }
    } else if (hash.startsWith('mafatih-')) {
      const mId = hash.replace('mafatih-', '');
      if (mId) {
        setSelectedMafatihItem(mId);
      }
    } else if (hash === 'settings') {
      setIsSidebarOpen(true);
    }
  }, []);

  const handleSelectSurah = (id: number, ayahNumber?: number) => {
    setIsSidebarOpen(false);
    setSelectedSurah(Number(id));
    setSelectedMafatihItem(null);
    setTargetAyah(ayahNumber ? Number(ayahNumber) : null);
    setTargetSurah(null);
    setSelectedJuz(null);

    const targetHash = ayahNumber ? `#surah-${id}-ayah-${ayahNumber}` : `#surah-${id}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ view: 'surah', id, ayahNumber }, '', targetHash);
    }
  };

  const handleSelectJuz = (id: number, ayahNumber?: number, surahNumber?: number) => {
    setIsSidebarOpen(false);
    setSelectedJuz(Number(id));
    setSelectedMafatihItem(null);
    setTargetAyah(ayahNumber ? Number(ayahNumber) : null);
    setTargetSurah(surahNumber ? Number(surahNumber) : null);
    setSelectedSurah(null);

    const targetHash = `#juz-${id}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ view: 'juz', id }, '', targetHash);
    }
  };

  const handleSelectMafatihItem = (itemId: string) => {
    setIsSidebarOpen(false);
    setSelectedMafatihItem(itemId);
    setSelectedSurah(null);
    setSelectedJuz(null);
    setTargetAyah(null);
    setTargetSurah(null);

    const targetHash = `#mafatih-${itemId}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ view: 'mafatih', itemId }, '', targetHash);
    }
  };

  // Safe Back-Navigation integration for Web, iOS Safari, Android PWA, and Capacitor
  const selectedSurahRef = useRef(selectedSurah);
  const selectedJuzRef = useRef(selectedJuz);
  const selectedMafatihItemRef = useRef(selectedMafatihItem);
  const isSidebarOpenRef = useRef(isSidebarOpen);
  const showWelcomeRef = useRef(showWelcome);
  const isExitingRef = useRef(isExiting);

  selectedSurahRef.current = selectedSurah;
  selectedJuzRef.current = selectedJuz;
  selectedMafatihItemRef.current = selectedMafatihItem;
  isSidebarOpenRef.current = isSidebarOpen;
  showWelcomeRef.current = showWelcome;
  isExitingRef.current = isExiting;

  // Unified Back Handler for all platforms (Web browser, iOS swipe back, Android hardware back)
  const handleUniversalBack = (): boolean => {
    if (popModal()) {
      return true;
    }

    if (isSidebarOpenRef.current) {
      setIsSidebarOpen(false);
      return true;
    }

    if (isExitingRef.current) {
      setIsExiting(false);
      return true;
    }

    if (selectedSurahRef.current !== null || selectedJuzRef.current !== null || selectedMafatihItemRef.current !== null) {
      setSelectedSurah(null);
      setSelectedJuz(null);
      setSelectedMafatihItem(null);
      setTargetAyah(null);
      setTargetSurah(null);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return true;
    }

    return false;
  };

  // Listen to popstate for standard web browser and PWA standalone navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const handled = handleUniversalBack();
      if (!handled && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const telemetryTimer = setTimeout(() => {
      trackAppLaunchAndTelemetry().catch(() => {});
    }, 1500);

    let isMounted = true;
    const cleanupFns: Array<() => void> = [() => clearTimeout(telemetryTimer)];

    import('@capacitor/app')
      .then(({ App: CapacitorApp }) => {
        if (!isMounted) return;
        CapacitorApp.addListener('backButton', () => {
          const handled = handleUniversalBack();
          if (handled) {
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            return;
          }

          if (showWelcomeRef.current) {
            return;
          }

          setIsExiting(true);
        })
          .then((listener) => {
            if (!isMounted) {
              listener?.remove?.();
            } else {
              cleanupFns.push(() => listener?.remove?.());
            }
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (e) {}
      });
    };
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
    try {
      localStorage.setItem('shia-quran-has-seen-welcome', 'true');
    } catch (e) {}
  };

  const handleExitComplete = async () => {
    try {
      const { App: CapacitorApp } = await import('@capacitor/app');
      await CapacitorApp.exitApp();
    } catch (e) {
      console.warn("Could not exit app using capacitor", e);
      setIsExiting(false);
    }
  };

  return (
    <div 
      className={`min-h-screen w-full ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30`}
      style={{ fontFamily: englishFont }}
    >
      {isMobileInFrame && (
        <div className="bg-emerald-800 text-white px-3.5 py-2 text-xs flex items-center justify-between gap-2 shadow-md z-50 sticky top-0 border-b border-emerald-600/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 font-bold bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Mobile View</span>
            <span className="truncate text-[11px] text-emerald-100">Tap to open native fullscreen mobile app:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  try {
                    window.open(window.location.href, '_top');
                  } catch {
                    window.location.href = 'https://quran-study.ai.studio';
                  }
                }
              }}
              className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg font-bold text-[11px] hover:bg-emerald-50 transition active:scale-95 cursor-pointer shadow-xs"
            >
              Open Mobile
            </button>
            <button
              onClick={() => setIsMobileInFrame(false)}
              className="text-emerald-300 hover:text-white p-1 text-xs cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={<ViewLoadingFallback />}>
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <WelcomeScreen key="welcome" onComplete={handleWelcomeComplete} />
          ) : isExiting ? (
            <DuaScreen key="dua" onContinueExit={handleExitComplete} onCancel={() => setIsExiting(false)} />
          ) : selectedSurah ? (
            <SurahView 
              key={`surah-view-${selectedSurah}`} 
              surahId={selectedSurah}
              targetAyah={targetAyah || undefined} 
              onBack={() => {
                if (window.location.hash) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                setSelectedSurah(null);
                setTargetAyah(null);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
            />
          ) : selectedJuz ? (
            <JuzView 
              key={`juz-view-${selectedJuz}`} 
              juzId={selectedJuz} 
              targetAyah={targetAyah || undefined}
              targetSurah={targetSurah || undefined}
              onBack={() => {
                if (window.location.hash) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                setSelectedJuz(null);
                setTargetAyah(null);
                setTargetSurah(null);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
            />
          ) : selectedMafatihItem ? (
            <MafatihItemView 
              key={`mafatih-view-${selectedMafatihItem}`} 
              itemId={selectedMafatihItem} 
              onBack={() => {
                if (window.location.hash) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                setSelectedMafatihItem(null);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
            />
          ) : (
            <Home 
              key="home" 
              onSelectSurah={handleSelectSurah} 
              onSelectJuz={handleSelectJuz}
              onSelectMafatihItem={handleSelectMafatihItem}
              onOpenSettings={() => setIsSidebarOpen(true)} 
              onExit={() => setIsExiting(true)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      <Suspense fallback={null}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onSelectSurah={(surahId, ayahNumber) => {
            setIsSidebarOpen(false);
            handleSelectSurah(surahId, ayahNumber);
          }} 
          onSelectMafatihItem={(itemId) => {
            setIsSidebarOpen(false);
            handleSelectMafatihItem(itemId);
          }}
          onExitApp={() => {
            setIsSidebarOpen(false);
            setIsExiting(true);
          }}
        />
      </Suspense>
      
      {!showWelcome && !isExiting && (
        <AudioPlayer 
          onSelectSurah={handleSelectSurah}
          onSelectJuz={handleSelectJuz}
          isOnHome={!selectedSurah && !selectedJuz && !selectedMafatihItem}
        />
      )}

      <UpdateToast />
    </div>
  );
}
