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

export default function App() {
  const { isDarkMode, englishFont } = useSettingsStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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
    const savedSurah = localStorage.getItem('shia-quran-active-surah');
    const savedJuz = localStorage.getItem('shia-quran-active-juz');
    if (savedSurah) {
      setSelectedSurah(parseInt(savedSurah));
      setShowWelcome(false); // Skip welcome screen if resuming reading
    } else if (savedJuz) {
      setSelectedJuz(parseInt(savedJuz));
      setShowWelcome(false);
    }
  }, []);

  // Save navigation state on change
  useEffect(() => {
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
  }, [selectedSurah, selectedJuz]);

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
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 pb-24"
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
