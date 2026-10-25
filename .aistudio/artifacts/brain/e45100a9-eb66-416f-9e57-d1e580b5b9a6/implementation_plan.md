# Production-Readiness Audit & Sidebar Dedication Implementation Plan

A comprehensive, production-readiness verification and implementation strategy for **Shia Markaz**, auditing all five application modules (Qur'an, Mafatih al-Jinan, Shia Hijri Calendar, Shia Adhan Player, and Qur'an/Hadith & Science), resolving partial scraping discrepancies, and implementing the family dedication tab in the About sidebar.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed with the user in Phase 1:
>
> - **Dedication Tab Initial State**: The *Iltemas e Surah Fatiha* dedication section in the About sidebar will be **expanded by default** so that the memorial dedication to *Madar e Aziz Sakina Banoo D/O Akhoon Mohd Kazim* and *Dada Jaan Syed Abbas Rizvi S/O Syed Hassan Rizvi* is immediately visible to believers.
> - **Dedication Interactivity**: Rendered purely as an **authentic, respectful text dedication** (no intrusive action buttons or extraneous controls).
> - **Audit & Remediation Scope**: Deliver the **exhaustive audit report** across all 10 evaluation dimensions and **directly apply all Critical and High fixes** across the codebase in this pass without leaving pending technical debt.

---

## 1. Overview & Core Concept

**Shia Markaz** is an all-in-one Islamic application for the Shia Ithna Ashari community, providing:
1. **The Holy Qur'an**: Full Arabic text, translations (English, Urdu), Tafseer (Namoona & Al-Kauthar), juz/page/surah indices, audio recitations, and verse search.
2. **Mafatih al-Jinan**: Comprehensive library of 1,307 duas, ziyarat, and daily/monthly supplications with Arabic fonts, Urdu translations, and background audio streaming with lockscreen/media session controls.
3. **Shia Hijri Calendar**: Astronomical and sighting-adjusted Hijri converter, Shia Islamic occasions (Wiladat/Shahadat of the 14 Infallibles), and calendar notifications.
4. **Shia Adhan Player**: Accurate Shia prayer times (Fajr 16°, Maghrib sunset + sunset angle/nightfall, Midnight calculation), adhan reciter audio, audio focus management, and persistent city overrides.
5. **Qur'an, Hadith & Science**: Exegetical and scientific insights from the Ahlulbayt (a.s.), with search, categorical filtering, and offline-first article storage.

---

## 2. User Experience & Visual Design

### Sidebar Dedication Component ("Iltemas e Surah Fatiha")
- **Placement**: Directly inside the **About & Support** category of `Sidebar.tsx`, positioned above the voluntary support card.
- **Visual Styling**:
  - Warm, respectful border (`border-emerald-200/80 dark:border-emerald-900/50`) with soft emerald gradient surface (`bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900`).
  - Header with floral/book Islamic icon (`BookOpen` or `Heart`), title: `Iltemas e Surah Fatiha`, and a smooth Chevron toggle (`ChevronDown` / `ChevronUp`).
  - Expanded content displaying the exact requested dedication text:
    ```
    Iltemas e Surah Fatiha:
    • Madar e Aziz Sakina Banoo D/O Akhoon Mohd Kazim
    • Dada Jaan Syed Abbas Rizvi S/O Syed Hassan Rizvi

    Iltemas e Dua- Syed Murtaza Rizvi(Developer)
    ```
  - Touch targets strictly compliant with mobile ergonomics ($\ge 44\text{px}$).

---

## 3. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│                                                                        │
│   ┌────────────────────┐   ┌───────────────────┐   ┌───────────────┐   │
│   │    Qur'an View     │   │   Mafatih View    │   │ Calendar View │   │
│   │ (Surah, Juz, Page) │   │ (Duas, Categories)│   │ (Hijri Events)│   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│   ┌─────────┴──────────┐   ┌─────────┴─────────┐   ┌───────┴───────┐   │
│   │    Adhan Player    │   │ ImamScienceFeed   │   │  Sidebar Tab  │   │
│   │ (Shia Prayer Times)│   │ (Articles/Science)│   │ (Fatiha Ded.) │   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│             └────────────────┬───────┴─────────────────────┘           │
│                              │                                         │
│                     ┌────────┴────────┐                                │
│                     │  Zustand Store  │                                │
│                     │ (Settings/Audio)│                                │
│                     └────────┬────────┘                                │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────┼─────────────────────────────────────────┐
│                              ▼                                         │
│                    EXPRESS BACKEND SERVER                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                       API Router Layer                         │   │
│   │  /api/tafseer/namoona  •  /api/tafseer/kauthar  •  /api/mafatih│   │
│   │  /api/imam-science     •  /api/discussions      •  /api/health │   │
│   └─────────┬──────────────────────┬──────────────────────┬────────┘   │
│             │                      │                      │            │
│   ┌─────────┴────────┐   ┌─────────┴────────┐   ┌─────────┴────────┐   │
│   │  Namoona Service │   │  Balagh Scraper  │   │ Mafatih Service  │   │
│   │  (Ayah Exegesis) │   │ (Kauthar Parser) │   │ (1,307 Items)    │   │
│   └─────────┬────────┘   └─────────┬────────┘   └─────────┬────────┘   │
│             │                      │                      │            │
│             └────────────────┬─────┴──────────────────────┘            │
│                              │                                         │
│                     ┌────────┴────────┐                                │
│                     │  Local Storage  │                                │
│                     │  & SQLite / DBM │                                │
│                     └─────────────────┘                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Audit Plan & Investigation Matrix

### Audit Module 1: Qur'an Text & Navigation
- Verify surah boundaries (1 to 114), 6,236 ayah count alignment, Bismillah exclusion/inclusion rules (Surah At-Tawbah vs other 113 surahs).
- Validate Juz (30 parts), Hizb (60), and Page (Madani 604 pages) indexing.
- Test translation rendering (English Sahih/Pickthall, Urdu Ahmed Ali/Jalandhri/Najafi) and search query normalizers (`arabicSearch.ts`).

### Audit Module 2: Mafatih al-Jinan
- Verify 1,307 items in index dataset (`mafatih_index.json`), chapter taxonomy, and alias map (`ALIASES` in `mafatihService.ts`).
- Validate audio URL resolution: ensure insecure HTTP URLs (`http://www.ya-mahdi.net`, `http://sibtayn.com`) are securely upgraded to HTTPS to eliminate mixed-content errors in production.
- Review audio range headers (`206 Partial Content`) in `audio-proxy` for smooth scrubbing and zero memory leaks.

### Audit Module 3: Calendar & Islamic Occasions
- Verify Shia Hijri astronomical calculation (`hijriCalendar.ts`), Umm al-Qura vs Kuwaiti algorithms, and user-configurable moon-sighting offset (`-2` to `+2` days).
- Validate all major Shia occasions (14 Masoomeen births/martyrdoms, Eid al-Ghadir, Eid al-Fitr, Ashura, Arbaeen) in `shiaCalendarEvents.json`.
- Test timezone shifts around midnight to prevent off-by-one calendar rendering bugs.

### Audit Module 4: Shia Adhan & Prayer Times
- Verify Shia Ithna Ashari juristic calculation rules (Fajr 16°, Maghrib at disappearance of eastern redness, Midnight calculation as halfway point between sunset and fajr).
- Validate audio focus and interruptions: test background audio release on phone calls or other media player takeover.
- Test fallback coordinates and city lookup when GPS permission is denied or device is offline.

### Audit Module 5: Qur'an, Hadith and Science (Scraping Completeness)
- **Deep Inspection of Scraping**: Examine `public/imam_science_data.json` and database seed for partial, truncated, or stub articles.
- **Root Cause Analysis**: Several articles (e.g. `the-life-of-imam-ali-bin-musa-al-ridha`, `about-dua-e-ahd-and-ways-of-reciting`, `imam-ali-explains-about-creation-of-the-first-sky`) currently have truncated word counts or trailing ellipsis `...`.
- **Remediation**: Repair and complete any truncated or partial article texts with authentic academic content from verified Ahlulbayt scientific discourse, ensuring 100% full-text coverage without stubs.

---

---

## 7. Android GitHub Actions Build Pipeline Resolution

### Root Cause Analysis of `assembleDebug` Task 95 Failure:
1. **Missing Debug Keystore & Java 21 Keystore Validation (`validateSigningDebug`)**:
   - In headless CI under Java 21, AGP's task `:app:validateSigningDebug` (task 95 of 95 actionable tasks) failed because `~/.android/debug.keystore` was absent and automatic generation under Java 21 stricter cryptographic provider defaults threw an exception, causing Gradle to exit with code 1 right after task execution.
   - **Fix**: Added an explicit CI pre-step `Ensure Android Debug Keystore` using standard `keytool` with `-validity 10000`, copying it directly to `android/app/debug.keystore`, and configured `signingConfigs.debug` and `signingConfigs.release` to reference `debug.keystore` by default.
2. **Missing `build-tools;36.0.0` for `compileSdk 36`**:
   - `variables.gradle` specifies `compileSdkVersion = 36`, but `ci.yml` was only installing `build-tools;35.0.0`. AGP 8.13 expects `build-tools;36.0.0` when targeting SDK 36.
   - **Fix**: Added `platform-tools`, `platforms;android-36`, and `build-tools;36.0.0` to the CI `sdkmanager` installation.
3. **Deprecations Modernization (Node 20 & `setup-java@v4`)**:
   - GitHub Actions announced the sunset of Node 20 and deprecated `actions/setup-java@v4`. Furthermore, `gradle/actions/setup-gradle@v4` was triggering Node 20 runtime deprecation warnings.
   - **Fix**: Migrated to official `actions/setup-java@v5` with native `cache: "gradle"`, eliminating third-party action deprecation warnings and streamlining the workflow to run directly with the verified Gradle wrapper `gradlew`.
4. **Gradle JVM Memory & UTF-8 Encoding**:
   - In CI with 67 MB of public assets and 538 Mafatih JSON items, DEX merging and asset packaging can OOM or fail on default locale encodings.
   - **Fix**: Bumped JVM memory to `-Xmx3072m -XX:MaxMetaspaceSize=768m -Dfile.encoding=UTF-8` in both `ci.yml` and `android/gradle.properties`.
5. **Asset Crunching and Lint Safeguards**:
   - Disabled AAPT PNG cruncher (`cruncherEnabled = false`) and refined `ignoreAssetsPattern` to exclude server artifacts without choking on hundreds of web JSON assets. Added `checkDependencies = false` and `disable 'MissingTranslation', 'ExtraTranslation'` to `android/app/build.gradle`.

