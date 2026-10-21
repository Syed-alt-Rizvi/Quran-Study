# Shia Markaz Dataset Architecture & Catalog

This document specifies the organization, storage hierarchy, and consumption endpoints of all data assets powering Shia Markaz. All production paths are preserved to ensure zero disruption across web, PWA, and mobile platforms.

---

## 1. Directory & Storage Overview

```
project-root/
├── public/
│   ├── tafseer_namoona/          # 114 Surahs: Tafseer-e-Namoona (Ayatullah Naser Makarim Shirazi)
│   ├── tafseer_kauthar/          # Surah & Ayah commentaries: Tafseer Al-Kauthar (Allama Mohsin Ali Najafi)
│   ├── mafatih_index.json        # Master manifest of all supplications, ziyaraat, and amaal
│   ├── mafatih_items/            # Verse-by-verse text and translations for individual Mafatih items
│   ├── quran_urdu_translation.json    # Complete Quranic Urdu translations for offline caching
│   ├── quran_english_translation.json # Complete Quranic English translations for offline caching
│   └── imam_science_data.json    # Classical Ahlulbayt scientific and theological discourses
├── src/
│   ├── surahList.json            # 114 Surahs canonical metadata (Arabic title, English name, Ayah counts)
│   └── data/
│       ├── quranMetadata.ts      # Revelation classifications, Juz boundaries, Sajdah markers
│       ├── surahUrduNames.ts     # Canonical Urdu naming and meanings for all 114 chapters
│       ├── tafseerData.ts        # Fast in-memory curated excerpts for daily featured widgets
│       ├── mafatihData.ts        # Canonical category taxonomies, aliases, and titles
│       ├── prayerTimes.ts        # Ja'fari astronomical algorithms (twilight angles, shadow lengths)
│       ├── shiaCities.ts         # Coordinates, timezones, and elevations for major global cities
│       └── shiaCalendarEvents.json # Hijri chronicle: Wiladats, Shahadats, Eids, and Fasting days
```

---

## 2. Dataset Modules & Access Specifications

### A. Quranic Commentary (Tafseer)
- **Tafseer-e-Namoona**:
  - **Location**: `public/tafseer_namoona/surah_{surahId}.json`
  - **Author**: Grand Ayatullah Naser Makarim Shirazi & Editorial Board
  - **Language**: Urdu & Arabic
  - **Consumer**: `src/services/tafseerScraper.ts`, `server/namoonaService.ts`, `SurahView.tsx`, `JuzView.tsx`
  - **Format**: JSON object mapped by Ayah number containing textual explanation, background of revelation, and legal/theological commentary.

- **Tafseer Al-Kauthar**:
  - **Location**: `public/tafseer_kauthar/s{surahId}_a{ayahId}.json` & `surah_{surahId}.json`
  - **Author**: Allama Sheikh Mohsin Ali Najafi
  - **Language**: Urdu & Arabic
  - **Consumer**: `src/services/tafseerScraper.ts`, `server/balaghScraper.ts`
  - **Format**: JSON object containing verse breakdown, contextual narrative, and linguistic notes.

### B. Supplications & Ziyaraat (Mafatih Al Jinan)
- **Master Index**:
  - **Location**: `public/mafatih_index.json`
  - **Author**: Sheikh Abbas Qummi
  - **Consumer**: `src/mafatihApi.ts`, `MafatihView.tsx`
  - **Schema**: Array of summaries containing `id`, `code`, `title`, `mainCategory`, `hasAudio`, `audioUrl`, `versesCount`, and search snippet.
- **Item Recitations**:
  - **Location**: `public/mafatih_items/{id}.json`
  - **Consumer**: `src/mafatihApi.ts`, `MafatihItemView.tsx`
  - **Schema**: Full item details with categorized verses (`index`, `arabic`, `translation`) and historical introductions.

### C. Astronomical Prayer Times & Qibla
- **Calculation Method**: Ja'fari Ithna Ashari (Method 0)
- **Parameters**: Fajr angle: 16.0°, Isha angle: 14.0°, Maghrib elevation: 4.0° sunset angle.
- **Consumer**: `src/components/HomeAdhanWidget.tsx`, `src/components/AdhanMapScreen.tsx`, `server.ts`

### D. Shia Islamic Hijri Calendar
- **Chronicle**: `src/data/shiaCalendarEvents.json`
- **Consumer**: `src/components/CalendarView.tsx`, `src/components/HomeCalendarWidget.tsx`
- **Taxonomy**:
  - `eid`: Eid al-Ghadeer, Eid al-Fitr, Eid al-Adha, Eid al-Mubahala
  - `celebration`: Wiladat of Holy Prophet (s) and Ma'sumeen (a.s)
  - `urs` / `commemoration`: Shahadat and historical martyrdom anniversaries
  - `fasting`: Recommended and mandatory fasting days (13-15th Rajab, Ayyam al-Beed, etc.)

---

## 3. Preservation & Non-Regression Policy
- All file paths listed above are canonical and strictly preserved.
- Webpack/Vite bundler assets in `public/` are served at root `/` across client routing.
- The SQLite / in-memory cache layers mirror this structure to deliver instant 0ms offline capability.
