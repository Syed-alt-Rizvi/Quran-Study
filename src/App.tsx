import { useState, useEffect } from 'react';
import { useSettingsStore } from './store';
import WelcomeScreen from './components/WelcomeScreen';
import Home from './components/Home';
import SurahView from './components/SurahView';
import JuzView from './components/JuzView';
import Sidebar from './components/Sidebar';
import DuaScreen from './components/DuaScreen';
import AudioPlayer from './components/AudioPlayer';
import { AnimatePresence } from 'motion/react';
import { getStorage, setStorage, removeStorage } from './utils/storage';

export default function App() {
  const { isDarkMode, englishFont } = useSettingsStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load saved navigation state robustly on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedSurah = await getStorage('shia-quran-active-surah');
        const savedJuz = await getStorage('shia-quran-active-juz');
        if (savedSurah) {
          setSelectedSurah(parseInt(savedSurah));
          setShowWelcome(false); // Skip welcome screen if resuming reading
        } else if (savedJuz) {
          setSelectedJuz(parseInt(savedJuz));
          setShowWelcome(false);
        }
      } catch (e) {
        console.warn('Failed to restore state', e);
      } finally {
        setIsRestoring(false);
      }
    };
    restoreState();
  }, []);

  // Save navigation state robustly on change
  useEffect(() => {
    if (isRestoring) return; // Don't save while restoring
    
    if (selectedSurah) {
      setStorage('shia-quran-active-surah', selectedSurah.toString());
      removeStorage('shia-quran-active-juz');
    } else if (selectedJuz) {
      setStorage('shia-quran-active-juz', selectedJuz.toString());
      removeStorage('shia-quran-active-surah');
    } else {
      removeStorage('shia-quran-active-surah');
      removeStorage('shia-quran-active-juz');
    }
  }, [selectedSurah, selectedJuz, isRestoring]);

  useEffect(() => {
    let appListener: any;
    import('@capacitor/app').then(({ App }) => {
      appListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          setIsExiting(false);
          // Intentionally NOT calling setShowWelcome(true) to preserve reading context
        }
      });
    }).catch(() => {
      // Ignore if capacitor is not available
    });

    return () => {
      if (appListener) {
        appListener.then((listener: any) => listener.remove());
      }
    };
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleExitComplete = async () => {
    try {
      const { App: CapacitorApp } = await import('@capacitor/app');
      await CapacitorApp.exitApp();
    } catch (e) {
      console.warn("Could not exit app using capacitor", e);
      window.close();
      // Fallback for web if window.close() is blocked
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 pb-24 bg-fixed"
      style={{ fontFamily: englishFont }}
    >
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" onComplete={handleWelcomeComplete} />
        ) : isExiting ? (
          <DuaScreen key="dua" onContinueExit={handleExitComplete} />
        ) : selectedSurah ? (
          <SurahView 
            key="surah-view" 
            surahId={selectedSurah} 
            onBack={() => {
              history.replaceState(null, '', ' ');
              setSelectedSurah(null);
            }} 
          />
        ) : selectedJuz ? (
          <JuzView 
            key="juz-view" 
            juzId={selectedJuz} 
            onBack={() => setSelectedJuz(null)} 
          />
        ) : (
          <Home 
            key="home" 
            onSelectSurah={setSelectedSurah} 
            onSelectJuz={setSelectedJuz}
            onOpenSettings={() => setIsSidebarOpen(true)} 
            onExit={() => setIsExiting(true)}
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {!showWelcome && !isExiting && <AudioPlayer />}
    </div>
  );
}
