import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Type, Info, Bookmark, Pilcrow, BookOpen, Heart } from 'lucide-react';
import { useSettingsStore } from '../store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { 
    isDarkMode, toggleDarkMode, 
    fontSize, setFontSize, 
    arabicFont, setArabicFont,
    englishFont, setEnglishFont,
    showTranslation, toggleShowTranslation,
    translationLanguages, toggleTranslationLanguage,
    tafseerLanguages, toggleTafseerLanguage,
    reminderTime, setReminderTime,
    bookmarks, removeBookmark 
  } = useSettingsStore();

  const arabicFonts = [
    { name: 'Amiri', value: 'Amiri' },
    { name: 'Amiri Quran', value: "'Amiri Quran'" },
    { name: 'Lateef', value: 'Lateef' },
    { name: 'Scheherazade New', value: "'Scheherazade New'" },
  ];

  const englishFonts = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Lora', value: 'Lora' },
    { name: 'Playfair Display', value: "'Playfair Display'" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-stone-50 dark:bg-stone-900 shadow-2xl overflow-y-auto flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
              <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-8">
              {/* Theme Toggle */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Appearance</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-emerald-500 transition-colors"
                >
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                    <motion.div
                      layout
                      className="absolute top-1 left-1 bottom-1 w-4 bg-white rounded-full shadow-sm"
                      style={{
                        x: isDarkMode ? 16 : 0,
                      }}
                    />
                  </div>
                </button>
              </div>

              {/* Typography Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  <Pilcrow size={20} />
                  <span>Typography</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm text-stone-500 dark:text-stone-400">English Font</label>
                  <select 
                    value={englishFont.replace(/'/g, '')}
                    onChange={(e) => {
                      const selected = englishFonts.find(f => f.name === e.target.value)?.value;
                      if (selected) setEnglishFont(selected);
                    }}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-emerald-500 dark:text-stone-200"
                  >
                    {englishFonts.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-stone-500 dark:text-stone-400">Arabic Font</label>
                  <select 
                    value={arabicFont.replace(/'/g, '')}
                    onChange={(e) => {
                      const selected = arabicFonts.find(f => f.name === e.target.value)?.value;
                      if (selected) setArabicFont(selected);
                    }}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-emerald-500 dark:text-stone-200"
                  >
                    {arabicFonts.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Translation Toggle */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  <Pilcrow size={20} />
                  <span>Translation</span>
                </div>
                <button
                  onClick={toggleShowTranslation}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-emerald-500 transition-colors"
                >
                  <span>Show Translations</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${showTranslation ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
                    <motion.div
                      layout
                      className="absolute top-1 left-1 bottom-1 w-4 bg-white rounded-full shadow-sm"
                      style={{
                        x: showTranslation ? 16 : 0,
                      }}
                    />
                  </div>
                </button>
                
                {showTranslation && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleTranslationLanguage('en')}
                      className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${translationLanguages.includes('en') ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => toggleTranslationLanguage('ur')}
                      className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${translationLanguages.includes('ur') ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'}`}
                    >
                      Urdu
                    </button>
                  </div>
                )}
              </div>

              {/* Tafseer Language Toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">Tafseer Language</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleTafseerLanguage('en')}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${tafseerLanguages.includes('en') ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => toggleTafseerLanguage('ur')}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${tafseerLanguages.includes('ur') ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'}`}
                  >
                    Urdu
                  </button>
                </div>
              </div>

              {/* Daily Reminder */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  <Pilcrow size={20} />
                  <span>Daily Reminder</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="time"
                    value={reminderTime || ''}
                    onChange={async (e) => {
                      const time = e.target.value;
                      setReminderTime(time);
                      try {
                        const { LocalNotifications } = await import('@capacitor/local-notifications');
                        const permStatus = await LocalNotifications.checkPermissions();
                        if (permStatus.display !== 'granted') {
                          await LocalNotifications.requestPermissions();
                        }
                        if (time) {
                          const [hours, minutes] = time.split(':').map(Number);
                          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
                          await LocalNotifications.schedule({
                            notifications: [
                              {
                                title: "Quran Study Time",
                                body: "It's time for your daily Quran reading.",
                                id: 1,
                                schedule: {
                                  on: {
                                    hour: hours,
                                    minute: minutes,
                                  },
                                  repeats: true,
                                }
                              }
                            ]
                          });
                        } else {
                          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
                        }
                      } catch (err) {
                        console.error('Local notifications not supported:', err);
                      }
                    }}
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:border-emerald-500 dark:text-stone-200"
                  />
                  {reminderTime && (
                    <button
                      onClick={async () => {
                        setReminderTime(null);
                        try {
                          const { LocalNotifications } = await import('@capacitor/local-notifications');
                          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
                        } catch (err) {
                          console.error('Local notifications not supported:', err);
                        }
                      }}
                      className="px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  <Type size={20} />
                  <span>Arabic Font Size</span>
                </div>
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">A</span>
                    <input
                      type="range"
                      min="24"
                      max="64"
                      step="4"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="text-xl font-bold">A</span>
                  </div>
                  <div className="mt-6 text-center text-stone-500 dark:text-stone-400">
                    <p className="font-arabic" style={{ fontSize: `${fontSize}px`, fontFamily: arabicFont }}>
                      بِسْمِ اللَّهِ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center gap-3 text-stone-800 dark:text-stone-200 font-medium">
                  <Bookmark size={20} />
                  <span>Your Bookmarks</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {bookmarks.map((b) => (
                    <div key={`${b.surahId}-${b.ayahNumber}`} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Surah {b.surahId}, Ayah {b.ayahNumber}</span>
                      </div>
                      <button 
                        onClick={() => removeBookmark(b.surahId, b.ayahNumber)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                        title="Remove bookmark"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="p-6 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium mb-3">
                <Info size={18} />
                <span className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400">About the Developer</span>
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed space-y-4">
                <p>
                  Developed by Syed Murtaza Rizvi from Kargil, Ladakh, India. This project is dedicated to empowering the global youth (Shiayaan-e-Ali), particularly across the subcontinent (Barr-e-Sageer), by providing an intuitive and accessible platform to read, learn, and deeply understand the Holy Quran.
                </p>
                <p className="font-medium text-emerald-600 dark:text-emerald-500 font-arabic text-lg">Iltemas e dua.</p>
                <div>
                  <p className="font-medium text-emerald-600 dark:text-emerald-500 font-arabic text-lg">Iltemas e Surah Faitha:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-emerald-700 dark:text-emerald-400 font-arabic text-lg">
                    <li>Sakina Banoo D/O Akhoon Mohd Kazim</li>
                    <li>Syed Abass Rizvi S/o Syed Hassan Rizvi</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Help Developer Section */}
            <div className="p-6 bg-violet-50 dark:bg-violet-900/10 border-t border-violet-100 dark:border-violet-900/30">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-2xl mb-4 border border-violet-200 dark:border-violet-800/50 text-center shadow-sm">
                <p className="text-sm text-violet-800 dark:text-violet-300 font-medium leading-relaxed">
                  Support the developer in building more impactful applications for the community. Positive change requires collective effort. Jazakallah.
                </p>
              </div>
              <a 
                href="upi://pay?pa=9906275833@superyes&pn=Developer" 
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white p-4 rounded-2xl font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                <Heart size={20} className="fill-current" />
                <span>Help</span>
              </a>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
