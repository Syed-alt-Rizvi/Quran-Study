import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from './store';
import WelcomeScreen from './components/WelcomeScreen';
import Home from './components/Home';
import SurahView from './components/SurahView';
import JuzView from './components/JuzView';
import Sidebar from './components/Sidebar';
import DuaScreen from './components/DuaScreen';
import AudioPlayer from './components/AudioPlayer';
import { AnimatePresence } from 'motion/react';
import { popModal } from './utils/modalBackHandler';

export default function App() {
  const { isDarkMode, englishFont, hasSeenWelcome, setHasSeenWelcome } = useSettingsStore();
  
  // Safe initial check checking both localStorage and store so the user is never stuck
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      if (localStorage.getItem('shia-quran-has-seen-welcome') === 'true') {
        return false;
      }
      const raw = localStorage.getItem('shia-quran-settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.hasSeenWelcome) return false;
      }
    } catch (e) {}
    return !hasSeenWelcome;
  });

  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [targetAyah, setTargetAyah] = useState<number | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Sync when zustand persist rehydrates
  useEffect(() => {
    if (hasSeenWelcome && showWelcome) {
      setShowWelcome(false);
    }
  }, [hasSeenWelcome, showWelcome]);

  const handleSelectSurah = (id: number, ayahNumber?: number) => {
    setSelectedSurah(id);
    setTargetAyah(ayahNumber || null);
    setSelectedJuz(null);
  };

  const handleSelectJuz = (id: number) => {
    setSelectedJuz(id);
    setSelectedSurah(null);
    setTargetAyah(null);
  };

  const isSidebarOpenRef = useRef(isSidebarOpen);
  isSidebarOpenRef.current = isSidebarOpen;
  const selectedSurahRef = useRef(selectedSurah);
  selectedSurahRef.current = selectedSurah;
  const selectedJuzRef = useRef(selectedJuz);
  selectedJuzRef.current = selectedJuz;
  const isExitingRef = useRef(isExiting);
  isExitingRef.current = isExiting;
  const showWelcomeRef = useRef(showWelcome);
  showWelcomeRef.current = showWelcome;

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load saved navigation state on mount
  useEffect(() => {
    try {
      const savedSurah = localStorage.getItem('shia-quran-active-surah');
      const savedJuz = localStorage.getItem('shia-quran-active-juz');
      if (savedSurah) {
        const num = parseInt(savedSurah, 10);
        if (!isNaN(num) && num >= 1 && num <= 114) {
          setSelectedSurah(num);
          setShowWelcome(false);
        }
      } else if (savedJuz) {
        const num = parseInt(savedJuz, 10);
        if (!isNaN(num) && num >= 1 && num <= 30) {
          setSelectedJuz(num);
          setShowWelcome(false);
        }
      }
    } catch (e) {
      console.warn("Could not parse saved navigation state", e);
    }
  }, []);

  // Save navigation state on change
  useEffect(() => {
    try {
      if (selectedSurah) {
        localStorage.setItem('shia-quran-active-surah', selectedSurah.toString());
        localStorage.removeItem('shia-quran-active-juz');
      } else if (selectedJuz) {
        localStorage.setItem('shia-quran-active-juz', selectedJuz.toString());
        localStorage.removeItem('shia-quran-active-surah');
      } else {
        localStorage.removeItem('shia-quran-active-surah');
        localStorage.removeItem('shia-quran-active-juz');
      }
    } catch (e) {}
  }, [selectedSurah, selectedJuz]);

  // Safe Capacitor lifecycle listeners
  useEffect(() => {
    let isMounted = true;
    const cleanupFns: Array<() => void> = [];

    import('@capacitor/app')
      .then(({ App: CapacitorApp }) => {
        if (!isMounted) return;

        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            setIsExiting(false);
          }
        })
          .then((listener) => {
            if (!isMounted) {
              listener?.remove?.();
            } else {
              cleanupFns.push(() => listener?.remove?.());
            }
          })
          .catch(() => {});

        CapacitorApp.addListener('backButton', () => {
          // If any modal (reader, reflections, sign in, report, privacy) is open, dismiss it first
          if (popModal()) {
            return;
          }

          if (isSidebarOpenRef.current) {
            setIsSidebarOpen(false);
          } else if (selectedSurahRef.current !== null) {
            setSelectedSurah(null);
          } else if (selectedJuzRef.current !== null) {
            setSelectedJuz(null);
          } else if (isExitingRef.current) {
            setIsExiting(false);
          } else if (!showWelcomeRef.current) {
            setIsExiting(true);
          } else {
            CapacitorApp.exitApp().catch(() => {});
          }
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
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 pb-24"
      style={{ fontFamily: englishFont }}
    >
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
            onBack={() => {
              if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
              }
              setSelectedJuz(null);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }} 
          />
        ) : (
          <Home 
            key="home" 
            onSelectSurah={handleSelectSurah} 
            onSelectJuz={handleSelectJuz}
            onOpenSettings={() => setIsSidebarOpen(true)} 
            onExit={() => setIsExiting(true)}
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onSelectSurah={(surahId, ayahNumber) => {
          setIsSidebarOpen(false);
          handleSelectSurah(surahId, ayahNumber);
        }} 
      />
      
      {!showWelcome && !isExiting && <AudioPlayer />}
    </div>
  );
}
