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
        )}

        <div className="space-y-12">
          {juz.ayahs.map((ayah, index) => (
            <AyahCard key={`${ayah.numberInSurah}-${index}`} ayah={ayah} juz={juz} />
          ))}
        </div>"""

replacement = """        <div className="space-y-12">
          {juz.ayahs.map((ayah, index) => {
            const isNewSurah = index === 0 || ayah.surahNumber !== juz.ayahs[index - 1].surahNumber;
            const isSurahStart = isNewSurah && ayah.numberInSurah === 1;

            return (
              <React.Fragment key={`${ayah.surahNumber}-${ayah.numberInSurah}-${index}`}>
                {isNewSurah && (
                  <div className="text-center my-12 pt-8">
                    {index > 0 && <hr className="mb-12 border-stone-200 dark:border-stone-800" />}
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
                      Surah {ayah.surahName}
                    </h2>
                    {isSurahStart && ayah.surahNumber !== 1 && ayah.surahNumber !== 9 && (
                      <h3
                        className="font-arabic text-emerald-700 dark:text-emerald-500 mt-4 mb-8"
                        style={{ fontSize: `${fontSize * 1.2}px` }}
                      >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </h3>
                    )}
                  </div>
                )}
                <AyahCard ayah={ayah} juz={juz} />
              </React.Fragment>
            );
          })}
        </div>"""

if target in content:
    with open('src/components/JuzView.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Replaced successfully.")
else:
    print("Target not found.")

