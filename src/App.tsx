import { useState, useEffect, useRef, Suspense } from 'react';
import { useSettingsStore } from './store';
import Home from './components/Home';
import AudioPlayer from './components/AudioPlayer';
import UpdateToast from './components/common/UpdateToast';
import { AnimatePresence } from 'motion/react';
import { popModal } from './utils/modalBackHandler';
import { checkUrlForTransfer, importUserData } from './utils/dataTransfer';
import { useGlobalAdhanScheduler } from './hooks/useGlobalAdhanScheduler';
import { Loader2 } from 'lucide-react';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import PermissionsModal from './components/PermissionsModal';
import { isPermissionPromptNeeded } from './utils/permissionManager';
import { parseCurrentRoute, updateBrowserRoute } from './utils/urlRouter';

// Code-split heavy views with resilient retry and chunk refresh logic
const WelcomeScreen = lazyWithRetry(() => import('./components/WelcomeScreen'), 'WelcomeScreen');
const SurahView = lazyWithRetry(() => import('./components/SurahView'), 'SurahView');
const JuzView = lazyWithRetry(() => import('./components/JuzView'), 'JuzView');
const Sidebar = lazyWithRetry(() => import('./components/Sidebar'), 'Sidebar');
const DuaScreen = lazyWithRetry(() => import('./components/DuaScreen'), 'DuaScreen');
const MafatihItemView = lazyWithRetry(() => import('./components/MafatihItemView'), 'MafatihItemView');

const ViewLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
  </div>
);

export default function App() {
  const { isDarkMode, englishFont, hasSeenWelcome, setHasSeenWelcome } = useSettingsStore();
  
  // Continuous global Shia Adhan announcement scheduler & seasonal day-to-day shift tracker
  useGlobalAdhanScheduler();
  
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
  const [hasOpenedSidebar, setHasOpenedSidebar] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Check and prompt for essential permissions once installed/opened
  useEffect(() => {
    if (!showWelcome && isPermissionPromptNeeded()) {
      const timer = setTimeout(() => {
        setShowPermissionsModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleOpenSettings = () => {
    setHasOpenedSidebar(true);
    setIsSidebarOpen(true);
  };

  // Sync dark mode class with root documentElement and body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDarkMode ? '#04110d' : '#047857');
      }
    }
  }, [isDarkMode]);

  // Android & Capacitor platform detection for status bar insets
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isAndroid = Capacitor.getPlatform() === 'android' || /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        document.documentElement.classList.add('capacitor-android');
        document.body.classList.add('capacitor-android');
      }
      if (Capacitor.isNativePlatform()) {
        document.documentElement.classList.add('capacitor-native');
        document.body.classList.add('capacitor-native');
      }
    }
  }, []);

  // Sync when zustand persist rehydrates
  useEffect(() => {
    if (hasSeenWelcome && showWelcome) {
      setShowWelcome(false);
    }
  }, [hasSeenWelcome, showWelcome]);

  // Idle prefetch secondary views so subsequent navigations are instant (with catch to avoid unhandled rejections)
  useEffect(() => {
    const preloader = () => {
      import('./components/SurahView').catch(() => {});
      import('./components/JuzView').catch(() => {});
      import('./components/Sidebar').catch(() => {});
      import('./components/MafatihItemView').catch(() => {});
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloader, { timeout: 2000 });
    } else {
      setTimeout(preloader, 1000);
    }
  }, []);

  // Parse deep link and check for cross-site transfer payload from URL hash on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user opened a transfer link or sync code from primary/secondary site
    checkUrlForTransfer();

    // Check today/tomorrow special Shia events and dispatch notifications if enabled (loaded on-demand)
    const state = useSettingsStore.getState();
    if (state.calendarNotificationSettings?.enabled) {
      import('./utils/calendarNotifications').then(({ checkAndDispatchCalendarNotifications }) => {
        checkAndDispatchCalendarNotifications(
          state.calendarNotificationSettings,
          state.hijriOffset || 0,
          (notifiedDate) => {
            state.updateCalendarNotificationSettings({ lastNotifiedDate: notifiedDate });
          }
        );
      }).catch(() => {});
    }

    // Listen for cross-window / iframe data transfer from parent window (for masked forwarding)
    const handleMessage = (e: MessageEvent) => {
      try {
        if (e.data?.type === 'SHIA_MARKAZ_IMPORT_DATA' && e.data.payload) {
          importUserData(e.data.payload);
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);

    // Listen for Android AppWidget quick launch intents
    const handleWidgetTab = (e: any) => {
      const tab = e.detail;
      if (tab === 'quran') {
        setSelectedMafatihItem(null);
        setSelectedJuz(null);
        setSelectedSurah(null);
        useSettingsStore.getState().setDefaultAppTab('quran');
      } else if (tab === 'mafatih') {
        setSelectedSurah(null);
        setSelectedJuz(null);
        setSelectedMafatihItem(null);
        useSettingsStore.getState().setDefaultAppTab('mafatih');
      }
    };
    window.addEventListener('open-app-tab', handleWidgetTab);

    // Parse deep link (clean paths like /surah/1, /juz/1, /mafatih/ziyarat-ashura, /adhan or legacy #hash)
    const initialRoute = parseCurrentRoute();
    if (initialRoute.type === 'surah') {
      setSelectedSurah(initialRoute.surahId);
      if (initialRoute.targetAyah) setTargetAyah(initialRoute.targetAyah);
      updateBrowserRoute(initialRoute, true);
    } else if (initialRoute.type === 'juz') {
      setSelectedJuz(initialRoute.juzId);
      updateBrowserRoute(initialRoute, true);
    } else if (initialRoute.type === 'mafatih-item') {
      setSelectedMafatihItem(initialRoute.itemId);
      useSettingsStore.getState().setCurrentAppTab('mafatih');
      updateBrowserRoute(initialRoute, true);
    } else if (initialRoute.type === 'home') {
      useSettingsStore.getState().setCurrentAppTab(initialRoute.tab);
      updateBrowserRoute(initialRoute, true);
    } else if (initialRoute.type === 'settings') {
      handleOpenSettings();
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('open-app-tab', handleWidgetTab);
    };
  }, []);

  const handleSelectSurah = (id: number, ayahNumber?: number) => {
    setIsSidebarOpen(false);
    setSelectedSurah(Number(id));
    setSelectedMafatihItem(null);
    setTargetAyah(ayahNumber ? Number(ayahNumber) : null);
    setTargetSurah(null);
    setSelectedJuz(null);

    updateBrowserRoute({ type: 'surah', surahId: Number(id), targetAyah: ayahNumber });
  };

  const handleSelectJuz = (id: number, ayahNumber?: number, surahNumber?: number) => {
    setIsSidebarOpen(false);
    setSelectedJuz(Number(id));
    setSelectedMafatihItem(null);
    setTargetAyah(ayahNumber ? Number(ayahNumber) : null);
    setTargetSurah(surahNumber ? Number(surahNumber) : null);
    setSelectedSurah(null);

    updateBrowserRoute({ type: 'juz', juzId: Number(id) });
  };

  const handleSelectMafatihItem = (itemId: string) => {
    setIsSidebarOpen(false);
    useSettingsStore.getState().setCurrentAppTab('mafatih');
    setSelectedMafatihItem(itemId);
    setSelectedSurah(null);
    setSelectedJuz(null);
    setTargetAyah(null);
    setTargetSurah(null);

    updateBrowserRoute({ type: 'mafatih-item', itemId });
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
      const wasMafatih = selectedMafatihItemRef.current !== null;
      setSelectedSurah(null);
      setSelectedJuz(null);
      setSelectedMafatihItem(null);
      setTargetAyah(null);
      setTargetSurah(null);
      const targetTab = wasMafatih ? 'mafatih' : 'quran';
      useSettingsStore.getState().setCurrentAppTab(targetTab);
      updateBrowserRoute({ type: 'home', tab: targetTab });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return true;
    }

    const currentTab = useSettingsStore.getState().currentAppTab;
    if (currentTab && currentTab !== 'quran') {
      useSettingsStore.getState().setCurrentAppTab('quran');
      updateBrowserRoute({ type: 'home', tab: 'quran' });
      return true;
    }

    return false;
  };

  // Listen to popstate for standard web browser and PWA standalone navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseCurrentRoute();
      if (route.type === 'surah') {
        setSelectedSurah(route.surahId);
        setTargetAyah(route.targetAyah || null);
        setSelectedJuz(null);
        setSelectedMafatihItem(null);
        updateBrowserRoute(route, true);
      } else if (route.type === 'juz') {
        setSelectedJuz(route.juzId);
        setSelectedSurah(null);
        setSelectedMafatihItem(null);
        updateBrowserRoute(route, true);
      } else if (route.type === 'mafatih-item') {
        setSelectedMafatihItem(route.itemId);
        useSettingsStore.getState().setCurrentAppTab('mafatih');
        setSelectedSurah(null);
        setSelectedJuz(null);
        updateBrowserRoute(route, true);
      } else if (route.type === 'home') {
        setSelectedSurah(null);
        setSelectedJuz(null);
        setSelectedMafatihItem(null);
        useSettingsStore.getState().setCurrentAppTab(route.tab);
        updateBrowserRoute(route, true);
      } else if (route.type === 'settings') {
        handleOpenSettings();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cleanupFns: Array<() => void> = [];

    try {
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
        .then((listener: any) => {
          if (!isMounted) {
            listener?.remove?.();
          } else {
            cleanupFns.push(() => listener?.remove?.());
          }
        })
        .catch(() => {});
    } catch (e) {}

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
      await CapacitorApp.exitApp();
    } catch (e) {
      console.warn("Could not exit app using capacitor", e);
      setIsExiting(false);
    }
  };

  return (
    <div 
      className={`min-h-screen w-full relative ${isDarkMode ? 'dark' : ''} text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden`}
      style={{ fontFamily: englishFont }}
    >
      <div className="relative z-10 min-h-screen flex flex-col">
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
                updateBrowserRoute({ type: 'home', tab: 'quran' });
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
                setSelectedJuz(null);
                setTargetAyah(null);
                setTargetSurah(null);
                updateBrowserRoute({ type: 'home', tab: 'quran' });
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
            />
          ) : selectedMafatihItem ? (
            <MafatihItemView 
              key={`mafatih-view-${selectedMafatihItem}`} 
              itemId={selectedMafatihItem} 
              onBack={() => {
                useSettingsStore.getState().setCurrentAppTab('mafatih');
                setSelectedMafatihItem(null);
                updateBrowserRoute({ type: 'home', tab: 'mafatih' });
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
            />
          ) : (
            <Home 
              key="home" 
              onSelectSurah={handleSelectSurah} 
              onSelectJuz={handleSelectJuz}
              onSelectMafatihItem={handleSelectMafatihItem}
              onOpenSettings={handleOpenSettings} 
              onExit={() => setIsExiting(true)}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {hasOpenedSidebar && (
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
      )}
      
      {!showWelcome && !isExiting && (
        <AudioPlayer 
          onSelectSurah={handleSelectSurah}
          onSelectJuz={handleSelectJuz}
          onSelectMafatihItem={handleSelectMafatihItem}
          selectedMafatihItem={selectedMafatihItem}
          selectedSurah={selectedSurah}
          isOnHome={!selectedSurah && !selectedJuz && !selectedMafatihItem}
        />
      )}

      <UpdateToast />
      <PermissionsModal 
        isOpen={showPermissionsModal} 
        onClose={() => setShowPermissionsModal(false)} 
      />
      </div>
    </div>
  );
}
