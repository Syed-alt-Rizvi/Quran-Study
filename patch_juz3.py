import re

with open('src/components/JuzView.tsx', 'r') as f:
    content = f.read()

target = """        {juz.number !== 1 && juz.number !== 9 && (
          <div className="text-center mb-12">
            <h2 
              className="font-arabic text-emerald-700 dark:text-emerald-500 mb-4" 
              style={{ fontSize: `${fontSize * 1.2}px` }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h2>
          </div>
        )}"""

replacement = """        {juz.ayahs[0].numberInSurah === 1 && juz.ayahs[0].surahNumber !== 1 && juz.ayahs[0].surahNumber !== 9 && (
          <div className="text-center mb-12">
            <h2 
              className="font-arabic text-emerald-700 dark:text-emerald-500 mb-4" 
              style={{ fontSize: `${fontSize * 1.2}px` }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h2>
          </div>
        )}"""

if target in content:
    with open('src/components/JuzView.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Replaced successfully.")
else:
    print("Target not found.")

