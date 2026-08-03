const fs = require('fs');
let code = fs.readFileSync('src/components/Home.tsx', 'utf-8');

code = code.replace(
  "const { readProgress } = useSettingsStore();",
  "const { readProgress, lastRead } = useSettingsStore();"
);

const continueReadingBlock = `        {lastRead && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Continue Reading</p>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">{lastRead.surahName || ('Surah ' + lastRead.surahId)} &bull; Ayah {lastRead.ayahNumber}</h3>
            </div>
            <button 
              onClick={() => onSelectSurah(lastRead.surahId)} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors"
            >
              Resume
            </button>
          </div>
        )}
`;

code = code.replace(
  "<DynamicBanner />",
  "<DynamicBanner />\n" + continueReadingBlock
);

fs.writeFileSync('src/components/Home.tsx', code);
