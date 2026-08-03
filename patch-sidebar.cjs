const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(
  "import { X, Moon, Sun, Type, Info, Bookmark, Pilcrow, BookOpen } from 'lucide-react';",
  "import { X, Moon, Sun, Type, Info, Bookmark, Pilcrow, BookOpen, Heart } from 'lucide-react';"
);

const aboutSection = `            {/* About Section */}
            <div className="p-6 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium mb-3">
                <Info size={18} />
                <span className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400">About the Developer</span>
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed space-y-4">
                <p>
                  This is an amateur project by Syed Murtaza Rizvi from Kargil, Ladakh, India. I want to make it as easy as possible for our youth (Shiayaan e Ali) around the world and especially around the Barr-e-Sageer to learn and read the Holy Quran and it's meaning, as clearly and easily possible.
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
            </div>`;

const donationSection = `
            {/* Help Developer Section */}
            <div className="p-6 bg-violet-50 dark:bg-violet-900/10 border-t border-violet-100 dark:border-violet-900/30">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-2xl mb-4 border border-violet-200 dark:border-violet-800/50 text-center shadow-sm">
                <p className="text-sm text-violet-800 dark:text-violet-300 font-medium leading-relaxed">
                  Help the developer building more such amazing apps for the community. Positive change needs effort. jazakallah
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
`;

code = code.replace(
  aboutSection,
  aboutSection + donationSection
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
