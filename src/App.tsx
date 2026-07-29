import { useState, useEffect } from 'react';
import { useSettingsStore } from './store';
import WelcomeScreen from './components/WelcomeScreen';
import Home from './components/Home';
import SurahView from './components/SurahView';
import JuzView from './components/JuzView';
import Sidebar from './components/Sidebar';
import DuaScreen from './components/DuaScreen';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { isDarkMode, hasSeenWelcome, setHasSeenWelcome, englishFont } = useSettingsStore();
  const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);
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

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  const handleExitComplete = () => {
    // In a real PWA/Android app, this might close the window/activity.
    // For this web view, we'll just reset state to show Home.
    setIsExiting(false);
  };

  return (
    <div 
      className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-500/30"
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
            onBack={() => setSelectedSurah(null)} 
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
    </div>
  );
}
